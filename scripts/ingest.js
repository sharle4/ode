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

// Entities themselves (Authors, Collections) are fetched JIT per batch to save RAM 
// but cached globally in memoized maps to prevent redundant DB calls across batches.
const memoizedAuthorsMap = new Map(); // name -> author_id
const memoizedCollectionsMap = new Map(); // collection key -> collection_id
const enrichedAuthorsMap = new Map(); // name -> enriched data
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
    console.log("📥 Preloading existing IDs and Slugs into memory to avoid conflicts...");
    let offset = 0; let limit = 5000; let hasMore = true;

    // 1. Authors
    while (hasMore) {
        let { data, error } = await supabase.from('authors').select('slug').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading authors", error); break; }
        data?.forEach(a => {
            if (a.slug) usedAuthorSlugs.add(a.slug);
        });
        hasMore = data?.length === limit;
        offset += limit;
    }

    // 2. Collections
    offset = 0; hasMore = true;
    while (hasMore) {
        let { data, error } = await supabase.from('collections').select('slug').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading collections", error); break; }
        data?.forEach(c => {
            if (c.slug) usedCollectionSlugs.add(c.slug);
        });
        hasMore = data?.length === limit;
        offset += limit;
    }

    // 3. Poèmes (IDs existants pour éviter les doublons lors des re-runs)
    offset = 0; hasMore = true;
    while (hasMore) {
        let { data, error } = await supabase.from('poems').select('wikisource_page_id, slug').range(offset, offset + limit - 1);
        if (error) { console.error("Error preloading poems", error); break; }
        data?.forEach(p => {
            if (p.wikisource_page_id) existingPoemIds.add(p.wikisource_page_id);
            if (p.slug) usedPoemSlugs.add(p.slug);
        });
        hasMore = data?.length === limit;
        offset += limit;
    }
    console.log(`✅ Loaded ${existingPoemIds.size} existing poems, ${usedPoemSlugs.size} poem slugs, ${usedCollectionSlugs.size} collection slugs, and ${usedAuthorSlugs.size} author slugs.`);
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

async function processBatch(batchLines) {
    // SINGLE JSON.parse pass for all lines in the batch
    const parsedBatch = [];
    for (const line of batchLines) {
        if (!line.trim()) continue;
        stats.totalLines++;

        try {
            parsedBatch.push(JSON.parse(line));
        } catch (e) {
            stats.errors.parse++;
            failedPoems.push({ id: null, title: "JSON Parse Error", error: line.substring(0, 50) });
        }
    }

    const toProcess = [];
    for (const poemData of parsedBatch) {
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

    // --- 1. JIT RESOLVE AUTHORS (Mémoïsé & Chunked) ---
    const missingFromCache = [];
    const batchAuthorNames = [...new Set(toProcess.map(p => p.metadata?.author).filter(Boolean))];
    batchAuthorNames.push(UNKNOWN_AUTHOR); // Always ensure UNKNOWN_AUTHOR is requested

    for (const name of batchAuthorNames) {
        if (!memoizedAuthorsMap.has(name)) missingFromCache.push(name);
    }

    if (missingFromCache.length > 0) {
        const fetchPromises = [];
        for (let i = 0; i < missingFromCache.length; i += 150) {
            fetchPromises.push(supabase.from('authors').select('id, name').in('name', missingFromCache.slice(i, i + 150)));
        }
        
        const results = await Promise.all(fetchPromises);
        results.forEach(({ data, error }) => {
            if (!error && data) {
                data.forEach(a => memoizedAuthorsMap.set(a.name, a.id));
            }
        });

        const reallyMissingAuthors = missingFromCache.filter(name => !memoizedAuthorsMap.has(name));
        if (reallyMissingAuthors.length > 0) {
            const newAuthorsToInsert = reallyMissingAuthors.map(authorName => {
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

                return {
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
                };
            });

            const { data: insertedAuthors, error: insertAuthErr } = await supabase.from('authors').insert(newAuthorsToInsert).select('id, name');
            if (insertAuthErr) {
                console.error("Bulk author insert error", insertAuthErr);
                stats.errors.authors += newAuthorsToInsert.length;
            } else if (insertedAuthors) {
                insertedAuthors.forEach(a => memoizedAuthorsMap.set(a.name, a.id));
            }
        }
    }

    // Compute missing authors recovery stats
    toProcess.forEach(p => {
        if (!p.metadata?.author) stats.missingAuthorRecovered++;
    });

    // --- 2. JIT RESOLVE COLLECTIONS (Mémoïsé & Chunked) ---
    const missingColsFromCache = [];
    const colTitlesToFetch = [];
    for (const p of toProcess) {
        const collectionTitle = p.collection_title || p.metadata?.source_collection;
        if (collectionTitle) colTitlesToFetch.push(collectionTitle);
    }

    if (colTitlesToFetch.length > 0) {
        const uniqueTitles = [...new Set(colTitlesToFetch)];
        for (const title of uniqueTitles) {
            // Un titre peut avoir différentes page_id selon l'édition,
            // mais on optimise d'abord sur la requête 'in'. Le cache global est basé sur key.
            missingColsFromCache.push(title); // This is an approximation since we query by title
        }

        const fetchColPromises = [];
        for (let i = 0; i < missingColsFromCache.length; i += 150) {
            fetchColPromises.push(supabase.from('collections').select('id, title, wikisource_page_id').in('title', missingColsFromCache.slice(i, i + 150)));
        }
        
        const colResults = await Promise.all(fetchColPromises);
        colResults.forEach(({ data, error }) => {
            if (!error && data) {
                data.forEach(c => {
                    const key = c.wikisource_page_id ? `page_${c.wikisource_page_id}` : `title_${c.title}`;
                    memoizedCollectionsMap.set(key, c.id);
                });
            }
        });

        const missingCollectionsMap = new Map();
        for (const p of toProcess) {
            const collectionTitle = p.collection_title || p.metadata?.source_collection;
            if (!collectionTitle) continue;

            let pageId = p.collection_structure?.page_id || null;
            const key = pageId ? `page_${pageId}` : `title_${collectionTitle}`;

            if (!memoizedCollectionsMap.has(key) && !missingCollectionsMap.has(key)) {
                const publicationYear = p.metadata?.publication_date;
                const slug = generateUniqueCollectionSlug(collectionTitle, publicationYear);
                missingCollectionsMap.set(key, {
                    title: collectionTitle,
                    slug: slug,
                    publication_year: publicationYear ? parseInt(publicationYear, 10) : null,
                    wikisource_page_id: pageId,
                    poems_count: 0,
                    _key: key
                });
            }
        }

        if (missingCollectionsMap.size > 0) {
            const insertData = Array.from(missingCollectionsMap.values()).map(c => {
                const { _key, ...rest } = c;
                return rest;
            });
            const { data: insertedCols, error: colsErr } = await supabase.from('collections').insert(insertData).select('id, wikisource_page_id, title');
            if (colsErr) {
                console.error("Bulk collection insert error", colsErr);
                stats.errors.collections += insertData.length;
            } else if (insertedCols) {
                insertedCols.forEach(c => {
                    const key = c.wikisource_page_id ? `page_${c.wikisource_page_id}` : `title_${c.title}`;
                    memoizedCollectionsMap.set(key, c.id);
                });
            }
        }
    }

    // --- 3. COLLECTION AUTHORS RELATIONS ---
    const collectionAuthorsToInsert = [];
    for (const p of toProcess) {
        const authorName = p.metadata?.author || null;
        let authorId = memoizedAuthorsMap.get(authorName) || memoizedAuthorsMap.get(UNKNOWN_AUTHOR);

        const collectionTitle = p.collection_title || p.metadata?.source_collection;
        let pageId = p.collection_structure?.page_id || null;
        const key = pageId ? `page_${pageId}` : `title_${collectionTitle}`;

        if (collectionTitle && memoizedCollectionsMap.has(key)) {
            const collectionId = memoizedCollectionsMap.get(key);
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

    // --- 4. INSERT POEMS ---
    const poemsToInsert = [];
    const poemRelationsLookup = new Map();

    for (const p of toProcess) {
        const authorName = p.metadata?.author || null;
        let authorId = memoizedAuthorsMap.get(authorName) || memoizedAuthorsMap.get(UNKNOWN_AUTHOR);

        const actualAuthorName = authorName || UNKNOWN_AUTHOR;
        const slug = generateUniquePoemSlug(actualAuthorName, p.title);

        const collectionTitle = p.collection_title || p.metadata?.source_collection;
        let pageId = p.collection_structure?.page_id || null;
        const key = pageId ? `page_${pageId}` : `title_${collectionTitle}`;
        const collectionId = memoizedCollectionsMap.get(key) || null;

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

        // --- 5. INSERT RELATIONS FOR POEMS ---
        const poemAuthorsToInsert = insertedPoems.map(p => ({
            poem_id: p.id,
            author_id: poemRelationsLookup.get(p.wikisource_page_id)
        })).filter(r => r.author_id);

        if (poemAuthorsToInsert.length > 0) {
            const { error: relationsError } = await supabase.from('poem_authors').upsert(poemAuthorsToInsert, { onConflict: 'poem_id,author_id', ignoreDuplicates: true });

            if (relationsError) {
                // Rollback sécurisé contre l'erreur URI Too Long en PARALLÈLE (Promise.allSettled)
                const idsToDelete = insertedPoems.map(p => p.id);
                const chunkSize = 100;
                const deletePromises = [];
                
                for (let i = 0; i < idsToDelete.length; i += chunkSize) {
                    const chunk = idsToDelete.slice(i, i + chunkSize);
                    deletePromises.push(supabase.from('poems').delete().in('id', chunk));
                }

                await Promise.allSettled(deletePromises);

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
    console.log("🗑️ Cleaning up database relations completely...");
    // Only safe since this is a data ingestion script wiping state
    await supabase.from('poem_categories').delete().neq('category_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('poem_authors').delete().neq('poem_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('collection_authors').delete().neq('collection_id', '00000000-0000-0000-0000-000000000000');
    
    // We do NOT completely delete 'authors', 'collections', and 'poems'
    // if this is an incremental ingest. Kept original table relationships.
    // If you need full purge before a complete ingest, do:
    // await supabase.from('poems').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabase.from('collections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // await supabase.from('authors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log("✅ Data clean up complete.");
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
