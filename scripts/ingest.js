import fs from 'fs';
import zlib from 'zlib';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing in .env.local file. Please add it.");
    process.exit(1);
}

// Custom fetch with retry against EADDRINUSE and connection resets
const customFetch = async (url, options) => {
    let retries = 5;
    let delay = 200;
    while (retries > 0) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) {
                // If it's a supabase timeout or 500, we might retry it too
                if (res.status >= 500 || res.status === 429) {
                    throw new Error(`HTTP Error ${res.status}`);
                }
            }
            return res;
        } catch (error) {
            if (error.message.includes('fetch failed') || error.message.includes('EADDRINUSE') || error.message.includes('HTTP Error')) {
                retries--;
                if (retries === 0) throw error;
                await new Promise(r => setTimeout(r, delay));
                delay *= 1.5;
            } else {
                throw error;
            }
        }
    }
};

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: { fetch: customFetch }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POEMS_FILE_PATH = path.join(__dirname, '..', 'scripts', 'poems.jsonl.gz');
const ENRICHED_AUTHORS_PATH = path.join(__dirname, '..', 'scripts', 'enriched_authors.jsonl');

// --- In-Memory Caches ---
// We preload data to avoid 50,000+ sequential GET requests that exhaust local ports. 
const authorsMap = new Map(); // name -> author_id
const authorIdToNameMap = new Map(); // author_id -> name
const enrichedAuthorsMap = new Map(); // name -> enriched data
const collectionsMap = new Map(); // collection key -> collection_id
const existingPoemIds = new Set(); // wikisource_page_id
const usedSlugs = new Set(); // slug

const UNKNOWN_AUTHOR = "Auteur Inconnu";

const stats = {
    totalLines: 0,
    insertedPoems: 0,
    skippedDuplicates: 0,
    missingAuthorRecovered: 0,
    errors: {
        parse: 0,
        authors: 0,
        collections: 0,
        poems: 0,
        slugs: 0
    }
};
const failedPoems = []; // stores detailed context on failures

async function preloadData() {
    console.log("📥 Preloading existing database state into memory to optimize ingestion...");
    let offset = 0; let limit = 1000; let hasMore = true;

    // 1. Authors
    while (hasMore) {
        let { data, error } = await supabase.from('authors').select('id, name').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading authors", error); break; }
        data?.forEach(a => {
            authorsMap.set(a.name, a.id);
            authorIdToNameMap.set(a.id, a.name);
        });
        hasMore = data?.length === limit;
        offset += limit;
    }

    // Create unknown author if missing
    if (!authorsMap.has(UNKNOWN_AUTHOR)) {
        const { data } = await supabase.from('authors').insert({ name: UNKNOWN_AUTHOR }).select('id').single();
        if (data) {
            authorsMap.set(UNKNOWN_AUTHOR, data.id);
            authorIdToNameMap.set(data.id, UNKNOWN_AUTHOR);
        }
    }
    console.log(`✅ Loaded ${authorsMap.size} authors.`);

    // 2. Collections
    offset = 0; hasMore = true;
    while (hasMore) {
        let { data, error } = await supabase.from('collections').select('id, title, wikisource_page_id').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading collections", error); break; }
        data?.forEach(c => {
            const key = c.wikisource_page_id ? `page_${c.wikisource_page_id}` : `title_${c.title}`;
            collectionsMap.set(key, { id: c.id });
        });
        hasMore = data?.length === limit;
        offset += limit;
    }
    console.log(`✅ Loaded ${collectionsMap.size} collections.`);

    // 3. Poèmes (IDs existants pour éviter les doublons lors des re-runs)
    offset = 0; hasMore = true;
    while (hasMore) {
        let { data, error } = await supabase.from('poems').select('wikisource_page_id, slug').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading poems", error); break; }
        data?.forEach(p => {
            if (p.wikisource_page_id) existingPoemIds.add(p.wikisource_page_id);
            if (p.slug) usedSlugs.add(p.slug);
        });
        hasMore = data?.length === limit;
        offset += limit;
    }
    console.log(`✅ Loaded ${existingPoemIds.size} existing poems and ${usedSlugs.size} slugs.`);
}

function generateUniqueSlug(authorName, poemTitle) {
    let baseSlug = slugify(`${authorName} ${poemTitle}`, { lower: true, strict: true });
    if (!baseSlug) {
        baseSlug = slugify(`poeme ${poemTitle}`, { lower: true, strict: true }) || 'poeme-sans-titre';
    }

    let finalSlug = baseSlug;
    let counter = 1;
    // Guaranteed to be unique in the system
    while (usedSlugs.has(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
    }
    usedSlugs.add(finalSlug);
    return finalSlug;
}

function generateUniqueCollectionSlug(title, year) {
    let baseString = title;
    if (year) {
        baseString += `-${year}`;
    }

    let baseSlug = slugify(baseString, { lower: true, strict: true });
    if (!baseSlug) {
        baseSlug = `recueil-${year || Date.now()}`;
    }

    let finalSlug = baseSlug;
    let counter = 1;
    // Guaranteed to be unique in the system
    while (usedSlugs.has(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
    }
    usedSlugs.add(finalSlug);
    return finalSlug;
}

async function getOrCreateAuthor(authorName) {
    if (!authorName) {
        stats.missingAuthorRecovered++;
        return authorsMap.get(UNKNOWN_AUTHOR);
    }
    if (authorsMap.has(authorName)) return authorsMap.get(authorName);

    try {
        const enriched = enrichedAuthorsMap.get(authorName) || {};

        let authorSlug = slugify(authorName, { lower: true, strict: true });
        if (!authorSlug) authorSlug = `auteur-${Date.now()}`;

        const { data, error } = await supabase.from('authors').insert({
            name: authorName,
            slug: authorSlug,
            image_url: enriched.image_url || null,
            signature_url: enriched.signature_url || null,
            date_of_birth: enriched.birth_date || null,
            date_of_death: enriched.death_date || null,
            birth_place: enriched.birth_place_short || null,
            birth_place_detailed: enriched.birth_place_detailed || null,
            death_place: enriched.death_place_short || null,
            death_place_detailed: enriched.death_place_detailed || null,
            native_name: enriched.native_name || null,
            movement: enriched.movement && enriched.movement.length > 0 ? enriched.movement : null,
            language: enriched.language || null,
            nationality: enriched.nationality || null,
            influenced_by: enriched.influenced_by && enriched.influenced_by.length > 0 ? enriched.influenced_by : null
        }).select('id').single();
        if (error) throw error;
        authorsMap.set(authorName, data.id);
        authorIdToNameMap.set(data.id, authorName);
        return data.id;
    } catch (e) {
        stats.errors.authors++;
        throw new Error(`Author Insert: ${e.message}`);
    }
}

async function getOrCreateCollection(collectionTitle, publicationYear, collectionStructure) {
    if (!collectionTitle) return null;

    let pageId = collectionStructure?.page_id || null;
    const key = pageId ? `page_${pageId}` : `title_${collectionTitle}`;

    if (collectionsMap.has(key)) {
        return collectionsMap.get(key).id;
    }

    try {
        const slug = generateUniqueCollectionSlug(collectionTitle, publicationYear);

        const { data, error } = await supabase.from('collections')
            .insert({
                title: collectionTitle,
                slug: slug,
                publication_year: publicationYear ? parseInt(publicationYear, 10) : null,
                wikisource_page_id: pageId,
                poems_count: 0
            }).select('id').single();

        if (error) throw error;
        collectionsMap.set(key, { id: data.id });
        return data.id;
    } catch (e) {
        stats.errors.collections++;
        console.error(`Collection exception for [${collectionTitle}]:`, e.message);
        return null; // Fallback: insert the poem without collection
    }
}

async function processLine(line) {
    if (!line.trim()) return;
    stats.totalLines++;

    let poemData;
    try {
        poemData = JSON.parse(line);
    } catch (e) {
        stats.errors.parse++;
        return;
    }

    try {
        if (!poemData.page_id) throw new Error("Missing wikisource_page_id");

        if (existingPoemIds.has(poemData.page_id)) {
            stats.skippedDuplicates++;
            return;
        }

        const authorName = poemData.metadata?.author || null;
        const authorId = await getOrCreateAuthor(authorName);
        if (!authorId) throw new Error("Could not resolve Author");

        const collectionTitle = poemData.collection_title || poemData.metadata?.source_collection;
        const collectionId = await getOrCreateCollection(
            collectionTitle,
            poemData.metadata?.publication_date,
            poemData.collection_structure
        );

        if (collectionId) {
            await supabase.from('collection_authors').upsert({
                collection_id: collectionId,
                author_id: authorId
            }, { onConflict: 'collection_id,author_id', ignoreDuplicates: true });
        }

        // Multi-version hubs & title
        const actualAuthorName = authorName || UNKNOWN_AUTHOR;
        const slug = generateUniqueSlug(actualAuthorName, poemData.title);

        const poemInsert = {
            title: poemData.title,
            slug: slug,
            collection_id: collectionId,
            section_title: poemData.section_title || null,
            poem_order: poemData.poem_order || null,
            content: poemData.structure,
            normalized_text: poemData.normalized_text,
            language: poemData.language || 'fr',
            publication_year: poemData.metadata?.publication_date ? parseInt(poemData.metadata.publication_date, 10) : null,
            wikisource_page_id: poemData.page_id,
            hub_title: poemData.hub_title || null,
            hub_page_id: poemData.hub_page_id || poemData.page_id
        };

        const { data: insertedPoem, error } = await supabase.from('poems').insert(poemInsert).select('id').single();
        if (error) {
            stats.errors.poems++;
            failedPoems.push({ id: poemData.page_id, title: poemData.title, error: error.message });
        } else {
            await supabase.from('poem_authors').upsert({
                poem_id: insertedPoem.id,
                author_id: authorId
            }, { onConflict: 'poem_id,author_id', ignoreDuplicates: true });

            stats.insertedPoems++;
            existingPoemIds.add(poemData.page_id);
            // Throttle slightly to keep connections happy
            if (stats.insertedPoems % 50 === 0) {
                await new Promise(r => setTimeout(r, 10));
            }
        }
    } catch (e) {
        stats.errors.poems++;
        failedPoems.push({ id: poemData?.page_id, title: poemData?.title, error: e.message });
    }
}

async function run() {
    console.log("🚀 Starting Optimized Ingestion script...");
    console.log(`Reading from ${POEMS_FILE_PATH}`);

    if (!fs.existsSync(POEMS_FILE_PATH)) {
        console.error("❌ File not found:", POEMS_FILE_PATH);
        process.exit(1);
    }

    try {
        if (fs.existsSync(ENRICHED_AUTHORS_PATH)) {
            console.log(`📥 Loading enriched authors from ${ENRICHED_AUTHORS_PATH}...`);
            const fileStream = fs.createReadStream(ENRICHED_AUTHORS_PATH);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            for await (const line of rl) {
                if (!line.trim()) continue;
                try {
                    const data = JSON.parse(line);
                    if (data.name) {
                        enrichedAuthorsMap.set(data.name, data);
                    }
                } catch (e) {
                    // skip malformed lines
                }
            }
            console.log(`✅ Loaded ${enrichedAuthorsMap.size} enriched authors in memory.`);
        } else {
            console.log("⚠️ No enriched authors file found, proceeding without enrichment.");
        }

        await preloadData();

        const fileStream = fs.createReadStream(POEMS_FILE_PATH);
        const gunzip = zlib.createGunzip();
        const rl = readline.createInterface({
            input: fileStream.pipe(gunzip),
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            await processLine(line);
            if (stats.totalLines % 1000 === 0) {
                console.log(`... Processed ${stats.totalLines} lines ... (Inserted: ${stats.insertedPoems})`);
            }
        }
    } catch (err) {
        console.error("FATAL ERROR during ingestion:", err);
    } finally {
        console.log(`\n🎉 Ingestion finished!`);
        console.log(`📊 STATS REPORT:`);
        console.table({
            "Total Lines Parsed": stats.totalLines,
            "Inserted Poems": stats.insertedPoems,
            "Duplicate IDs Skipped": stats.skippedDuplicates,
            "Recovered Missing Authors": stats.missingAuthorRecovered,
            "API/Insert Errors": stats.errors.poems,
            "Author Creation Errors": stats.errors.authors,
            "Collection Creation Errors": stats.errors.collections
        });

        const reportPath = path.join(__dirname, 'ingest_report.json');
        fs.writeFileSync(reportPath, JSON.stringify({ stats, failedPoems }, null, 2));
        console.log(`\n📝 Detailed report saved to ${reportPath}`);

        if (failedPoems.length > 0) {
            console.log(`⚠️ Note: ${failedPoems.length} poems failed. Check the report for exact error messages.`);
        }
    }
}

run();
