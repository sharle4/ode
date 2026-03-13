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
const POEMS_FILE_PATH = path.join(__dirname, '..', 'scripts', 'poems.cleaned.jsonl.gz');
const ENRICHED_AUTHORS_PATH = path.join(__dirname, '..', 'scripts', 'enriched_authors.jsonl');

// --- In-Memory Caches ---
// We preload data to avoid 50,000+ sequential GET requests that exhaust local ports. 
const authorsMap = new Map(); // name -> author_id
const authorIdToNameMap = new Map(); // author_id -> name
const enrichedAuthorsMap = new Map(); // name -> enriched data
const collectionsMap = new Map(); // collection key -> collection_id
const existingPoemIds = new Set(); // wikisource_page_id
const usedPoemSlugs = new Set(); // slug
const usedCollectionSlugs = new Set(); // slug
const usedAuthorSlugs = new Set(); // slug

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
        let { data, error } = await supabase.from('authors').select('id, name, slug').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading authors", error); break; }
        data?.forEach(a => {
            authorsMap.set(a.name, a.id);
            authorIdToNameMap.set(a.id, a.name);
            if (a.slug) usedAuthorSlugs.add(a.slug);
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
        let { data, error } = await supabase.from('collections').select('id, title, wikisource_page_id, slug').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading collections", error); break; }
        data?.forEach(c => {
            const key = c.wikisource_page_id ? `page_${c.wikisource_page_id}` : `title_${c.title}`;
            collectionsMap.set(key, { id: c.id });
            if (c.slug) usedCollectionSlugs.add(c.slug);
        });
        hasMore = data?.length === limit;
        offset += limit;
    }
    console.log(`✅ Loaded ${collectionsMap.size} collections.`);

    console.log(`✅ Loaded ${usedCollectionSlugs.size} collection slugs, and ${usedAuthorSlugs.size} author slugs. (Poems are JIT loaded)`);
}

function generateUniquePoemSlug(authorName, poemTitle) {
    let baseSlug = slugify(`${authorName} ${poemTitle}`, { lower: true, strict: true });
    if (!baseSlug) {
        baseSlug = slugify(`poeme ${poemTitle}`, { lower: true, strict: true }) || 'poeme-sans-titre';
    }

    let finalSlug = baseSlug;
    let counter = 1;
    // Guaranteed to be unique in the system
    while (usedPoemSlugs.has(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
    }
    usedPoemSlugs.add(finalSlug);
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
    while (usedCollectionSlugs.has(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
    }
    usedCollectionSlugs.add(finalSlug);
    return finalSlug;
}

async function processBatch(batch) {
    const batchPageIds = batch.map(line => {
        try { return JSON.parse(line).page_id; } catch { return null; }
    }).filter(Boolean);

    if (batchPageIds.length > 0) {
        const { data: existingPoems } = await supabase.from('poems').select('wikisource_page_id, slug').in('wikisource_page_id', batchPageIds);
        existingPoems?.forEach(p => {
            if (p.wikisource_page_id) existingPoemIds.add(p.wikisource_page_id);
            if (p.slug) usedPoemSlugs.add(p.slug);
        });
    }

    const proposedPoemSlugs = batch.map(line => {
        try {
            const p = JSON.parse(line);
            const author = p.metadata?.author || UNKNOWN_AUTHOR;
            return slugify(`${author} ${p.title}`, { lower: true, strict: true }) || 'poeme-sans-titre';
        } catch { return null; }
    }).filter(Boolean);

    if (proposedPoemSlugs.length > 0) {
        const { data: existingSlugs } = await supabase.from('poems').select('slug').in('slug', proposedPoemSlugs);
        existingSlugs?.forEach(p => usedPoemSlugs.add(p.slug));
    }

    const toProcess = [];
    for (const line of batch) {
        if (!line.trim()) continue;
        stats.totalLines++;

        let poemData;
        try {
            poemData = JSON.parse(line);
        } catch (e) {
            stats.errors.parse++;
            continue;
        }

        if (!poemData.page_id) {
            failedPoems.push({ id: null, title: poemData.title || "Unknown", error: "Missing wikisource_page_id" });
            continue;
        }

        if (existingPoemIds.has(poemData.page_id)) {
            stats.skippedDuplicates++;
            continue;
        }

        // Ajout optimiste IMMÉDIAT pour bloquer les doublons du même lot
        existingPoemIds.add(poemData.page_id);
        toProcess.push(poemData);
    }

    if (toProcess.length === 0) return;

    // 1. Resolve Authors
    const authorsToCreate = new Map();
    for (const p of toProcess) {
        const authorName = p.metadata?.author || null;
        if (!authorName) {
            stats.missingAuthorRecovered++;
        } else if (!authorsMap.has(authorName) && !authorsToCreate.has(authorName)) {
            authorsToCreate.set(authorName, { name: authorName });
        }
    }

    if (authorsToCreate.size > 0) {
        const newAuthors = [];
        for (const [authorName, _] of authorsToCreate) {
            const enriched = enrichedAuthorsMap.get(authorName) || {};

            let baseSlug = slugify(authorName, { lower: true, strict: true });
            if (!baseSlug) baseSlug = `auteur-${Date.now()}`;

            let finalSlug = baseSlug;
            let counter = 1;
            while (usedAuthorSlugs.has(finalSlug)) {
                counter++;
                finalSlug = `${baseSlug}-${counter}`;
            }
            usedAuthorSlugs.add(finalSlug);

            newAuthors.push({
                name: authorName,
                slug: finalSlug,
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
            });
        }

        if (newAuthors.length > 0) {
            const { data, error } = await supabase.from('authors').insert(newAuthors).select('id, name');
            if (error) {
                console.error("Bulk author insert error", error);
                stats.errors.authors += newAuthors.length;
                newAuthors.forEach(a => {
                    authorsMap.set(a.name, authorsMap.get(UNKNOWN_AUTHOR));
                });
            } else if (data) {
                data.forEach(a => {
                    authorsMap.set(a.name, a.id);
                    authorIdToNameMap.set(a.id, a.name);
                });
            }
        }
    }

    // 2. Resolve Collections
    const collectionsToCreateMap = new Map();
    for (const p of toProcess) {
        const collectionTitle = p.collection_title || p.metadata?.source_collection;
        if (!collectionTitle) continue;

        let pageId = p.collection_structure?.page_id || null;
        const key = pageId ? `page_${pageId}` : `title_${collectionTitle}`;

        if (!collectionsMap.has(key) && !collectionsToCreateMap.has(key)) {
            const publicationYear = p.metadata?.publication_date;
            const slug = generateUniqueCollectionSlug(collectionTitle, publicationYear);
            collectionsToCreateMap.set(key, {
                title: collectionTitle,
                slug: slug,
                publication_year: publicationYear ? parseInt(publicationYear, 10) : null,
                wikisource_page_id: pageId,
                poems_count: 0,
                _key: key
            });
        }
    }

    if (collectionsToCreateMap.size > 0) {
        const newCollections = Array.from(collectionsToCreateMap.values());
        const insertData = newCollections.map(c => {
            const { _key, ...rest } = c;
            return rest;
        });

        const { data, error } = await supabase.from('collections').insert(insertData).select('id, wikisource_page_id, title');
        if (error) {
            console.error("Bulk collection insert error", error);
            stats.errors.collections += insertData.length;
        } else if (data) {
            data.forEach(c => {
                const key = c.wikisource_page_id ? `page_${c.wikisource_page_id}` : `title_${c.title}`;
                collectionsMap.set(key, { id: c.id });
            });
        }
    }

    // 3. Collection Authors Relations
    const collectionAuthorsToInsert = [];
    for (const p of toProcess) {
        const authorName = p.metadata?.author || null;
        let authorId = authorsMap.get(authorName) || authorsMap.get(UNKNOWN_AUTHOR);

        const collectionTitle = p.collection_title || p.metadata?.source_collection;
        let pageId = p.collection_structure?.page_id || null;
        const key = pageId ? `page_${pageId}` : `title_${collectionTitle}`;

        if (collectionTitle && collectionsMap.has(key)) {
            const collectionId = collectionsMap.get(key).id;
            if (authorId && collectionId) {
                collectionAuthorsToInsert.push({ collection_id: collectionId, author_id: authorId });
            }
        }
    }

    const uniqueColAuth = [];
    const colAuthKeys = new Set();
    for (const ca of collectionAuthorsToInsert) {
        const k = `${ca.collection_id}_${ca.author_id}`;
        if (!colAuthKeys.has(k)) {
            colAuthKeys.add(k);
            uniqueColAuth.push(ca);
        }
    }

    if (uniqueColAuth.length > 0) {
        await supabase.from('collection_authors').upsert(uniqueColAuth, { onConflict: 'collection_id,author_id', ignoreDuplicates: true });
    }

    // 4. Insert Poems
    const poemsToInsert = [];
    const poemRelationsLookup = new Map(); // page_id -> authorId

    for (const p of toProcess) {
        const authorName = p.metadata?.author || null;
        let authorId = authorsMap.get(authorName) || authorsMap.get(UNKNOWN_AUTHOR);

        const actualAuthorName = authorName || UNKNOWN_AUTHOR;
        const slug = generateUniquePoemSlug(actualAuthorName, p.title);

        const collectionTitle = p.collection_title || p.metadata?.source_collection;
        let pageId = p.collection_structure?.page_id || null;
        const key = pageId ? `page_${pageId}` : `title_${collectionTitle}`;
        const collectionId = collectionsMap.get(key)?.id || null;

        poemsToInsert.push({
            title: p.title,
            slug: slug,
            collection_id: collectionId,
            section_title: p.section_title || null,
            poem_order: p.poem_order || null,
            content: p.structure,
            normalized_text: p.normalized_text,
            language: p.language || 'fr',
            publication_year: p.metadata?.publication_date ? parseInt(p.metadata.publication_date, 10) : null,
            wikisource_page_id: p.page_id,
            hub_title: p.hub_title || null,
            hub_page_id: p.hub_page_id || p.page_id
        });

        poemRelationsLookup.set(p.page_id, authorId);
    }

    if (poemsToInsert.length === 0) return;

    try {
        const { data: insertedPoems, error: poemsError } = await supabase.from('poems').upsert(poemsToInsert, { onConflict: 'wikisource_page_id', ignoreDuplicates: true }).select('id, wikisource_page_id');

        if (poemsError) {
            stats.errors.poems += poemsToInsert.length;
            for (const p of poemsToInsert) {
                failedPoems.push({ id: p.wikisource_page_id, title: p.title, error: poemsError.message });
            }
            return;
        }
        
        if (!insertedPoems || insertedPoems.length === 0) return;

        // 5. Insert Relations for Poems
        const poemAuthorsToInsert = insertedPoems.map(p => ({
            poem_id: p.id,
            author_id: poemRelationsLookup.get(p.wikisource_page_id)
        })).filter(r => r.author_id);

        if (poemAuthorsToInsert.length > 0) {
            const { error: relationsError } = await supabase.from('poem_authors').upsert(poemAuthorsToInsert, { onConflict: 'poem_id,author_id', ignoreDuplicates: true });

            if (relationsError) {
                // Rollback sécurisé contre l'erreur URI Too Long
                const idsToDelete = insertedPoems.map(p => p.id);
                const chunkSize = 100;
                
                for (let i = 0; i < idsToDelete.length; i += chunkSize) {
                    const chunk = idsToDelete.slice(i, i + chunkSize);
                    await supabase.from('poems').delete().in('id', chunk);
                }

                stats.errors.poems += poemsToInsert.length;
                for (const p of poemsToInsert) {
                    failedPoems.push({ id: p.wikisource_page_id, title: p.title, error: `Relation failed, poem rolled back: ${relationsError.message}` });
                }
            } else {
                stats.insertedPoems += insertedPoems.length;
            }
        } else {
            // No relations, just update stats
            stats.insertedPoems += insertedPoems.length;
        }

        // Throttle slightly to keep connections happy between batches
        await new Promise(r => setTimeout(r, 50));
    } catch (e) {
        stats.errors.poems += poemsToInsert.length;
        failedPoems.push({ id: null, title: "Batch Error", error: e.message });
    }
}

async function deleteDummyData() {
    console.log("🗑️ Cleaning up dummy data before ingestion...");
    const dummyAuthors = ['a1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222'];
    const dummyCollections = ['c1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222'];
    const dummyPoems = ['d1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222'];
    const dummyCategories = ['e1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222'];

    // Delete relation tables first
    await supabase.from('poem_categories').delete().in('category_id', dummyCategories);
    await supabase.from('poem_authors').delete().in('poem_id', dummyPoems);
    await supabase.from('collection_authors').delete().in('collection_id', dummyCollections);

    // Delete main tables
    await supabase.from('poems').delete().in('id', dummyPoems);
    await supabase.from('categories').delete().in('id', dummyCategories);
    await supabase.from('collections').delete().in('id', dummyCollections);
    await supabase.from('authors').delete().in('id', dummyAuthors);

    console.log("✅ Dummy data clean up complete.");
}

async function run() {
    console.log("🚀 Starting Optimized Ingestion script...");
    console.log(`Reading from ${POEMS_FILE_PATH}`);

    if (!fs.existsSync(POEMS_FILE_PATH)) {
        console.error("❌ File not found:", POEMS_FILE_PATH);
        process.exit(1);
    }

    try {
        await deleteDummyData();

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

        let batch = [];

        for await (const line of rl) {
            batch.push(line);
            
            if (batch.length >= 500) {
                await processBatch(batch);
                batch = [];
                console.log(`... Processed ${stats.totalLines} lines ... (Inserted: ${stats.insertedPoems})`);
            }
        }
        
        if (batch.length > 0) {
            await processBatch(batch);
            console.log(`... Processed ${stats.totalLines} lines ... (Inserted: ${stats.insertedPoems})`);
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
