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
const POEMS_FILE_PATH = path.join(__dirname, '..', 'poems', 'poems.cleaned.jsonl.gz');

// --- In-Memory Caches ---
// We preload data to avoid 50,000+ sequential GET requests that exhaust local ports. 
const authorsMap = new Map(); // name -> author_id
const collectionsMap = new Map(); // author_id_title -> collection_id
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
        data?.forEach(a => authorsMap.set(a.name, a.id));
        hasMore = data?.length === limit;
        offset += limit;
    }

    // Create unknown author if missing
    if (!authorsMap.has(UNKNOWN_AUTHOR)) {
        const { data } = await supabase.from('authors').insert({ name: UNKNOWN_AUTHOR }).select('id').single();
        if (data) authorsMap.set(UNKNOWN_AUTHOR, data.id);
    }
    console.log(`✅ Loaded ${authorsMap.size} authors.`);

    // 2. Collections
    offset = 0; hasMore = true;
    while (hasMore) {
        let { data, error } = await supabase.from('collections').select('id, title, author_id, wikipedia_page_id').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading collections", error); break; }
        data?.forEach(c => {
            const key = c.wikipedia_page_id ? `page_${c.wikipedia_page_id}` : `title_${c.title}`;
            collectionsMap.set(key, { id: c.id, author_id: c.author_id });
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

async function getOrCreateAuthor(authorName) {
    if (!authorName) {
        stats.missingAuthorRecovered++;
        return authorsMap.get(UNKNOWN_AUTHOR);
    }
    if (authorsMap.has(authorName)) return authorsMap.get(authorName);

    try {
        const { data, error } = await supabase.from('authors').insert({ name: authorName }).select('id').single();
        if (error) throw error;
        authorsMap.set(authorName, data.id);
        return data.id;
    } catch (e) {
        stats.errors.authors++;
        throw new Error(`Author Insert: ${e.message}`);
    }
}

async function getOrCreateCollection(collectionTitle, authorId, publicationYear, collectionStructure) {
    if (!collectionTitle) return null;

    let pageId = collectionStructure?.page_id || null;
    const key = pageId ? `page_${pageId}` : `title_${collectionTitle}`;

    if (collectionsMap.has(key)) {
        const coll = collectionsMap.get(key);
        // Si la collection existe mais que l'auteur est différent, c'est une Revue (multi-auteurs) !
        if (coll.author_id !== null && authorId !== null && coll.author_id !== authorId) {
            console.log(`[Collection] '${collectionTitle}' detected as multi-author. Nullifying author_id.`);
            await supabase.from('collections').update({ author_id: null }).eq('id', coll.id);
            coll.author_id = null; // Update en mémoire pour éviter d'update à chaque poème
        }
        return coll.id;
    }

    try {
        const { data, error } = await supabase.from('collections')
            .insert({
                title: collectionTitle,
                author_id: authorId,
                publication_year: publicationYear ? parseInt(publicationYear, 10) : null,
                wikipedia_page_id: pageId
            }).select('id').single();

        if (error) throw error;
        collectionsMap.set(key, { id: data.id, author_id: authorId });
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
            authorId,
            poemData.metadata?.publication_date,
            poemData.collection_structure
        );

        // Multi-version hubs & title
        const actualAuthorName = authorName || UNKNOWN_AUTHOR;
        const slug = generateUniqueSlug(actualAuthorName, poemData.title);

        const poemInsert = {
            title: poemData.title,
            slug: slug,
            author_id: authorId,
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

        const { error } = await supabase.from('poems').insert(poemInsert);
        if (error) {
            stats.errors.poems++;
            failedPoems.push({ id: poemData.page_id, title: poemData.title, error: error.message });
        } else {
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
