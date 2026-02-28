import fs from 'fs';
import zlib from 'zlib';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

// We use the Local Supabase Keys printed from `npx supabase start`
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
// IMPORTANT: We need the Service Role Key to bypass RLS for ingestion
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing in .env.local file. Please add it.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POEMS_FILE_PATH = path.join(__dirname, '..', 'poems', 'poems.cleaned.jsonl.gz');

// In-memory maps to avoid duplicate inserts and hold UUIDs
const authorsMap = new Map(); // name -> author_id
const collectionsMap = new Map(); // title -> collection_id

/**
 * Creates a unique slug taking care of existing ones
 */
function generateSlug(authorName, poemTitle) {
    const baseSlug = slugify(`${authorName} ${poemTitle}`, { lower: true, strict: true });
    // For local ingestion, we are assuming no duplicates of the exact SAME slug for the exact SAME poem.
    // Real-world would check DB for collisions, but the JSON is from Wikisource (usually unique per page).
    return baseSlug;
}

async function getOrCreateAuthor(authorName, metadata) {
    if (!authorName) return null;

    if (authorsMap.has(authorName)) {
        return authorsMap.get(authorName);
    }

    // Try fetching from DB first in case it was created in a previous run
    const { data: existing } = await supabase
        .from('authors')
        .select('id')
        .eq('name', authorName)
        .single();

    if (existing) {
        authorsMap.set(authorName, existing.id);
        return existing.id;
    }

    // Insert new
    // Note: We don't have birth/death years in the JSON directly, except maybe in complex parsing.
    // For now we just create the name.
    console.log(`Inserting new author: ${authorName}`);
    const { data, error } = await supabase
        .from('authors')
        .insert({ name: authorName })
        .select('id')
        .single();

    if (error) {
        console.error(`Failed to insert author ${authorName}:`, error);
        return null;
    }

    authorsMap.set(authorName, data.id);
    return data.id;
}

async function getOrCreateCollection(collectionTitle, authorId, publicationYear, collectionStructure) {
    if (!collectionTitle) return null;

    const key = `${authorId}_${collectionTitle}`;
    if (collectionsMap.has(key)) {
        return collectionsMap.get(key);
    }

    const { data: existing } = await supabase
        .from('collections')
        .select('id')
        .eq('title', collectionTitle)
        .eq('author_id', authorId)
        .single();

    if (existing) {
        collectionsMap.set(key, existing.id);
        return existing.id;
    }

    let pageId = null;
    if (collectionStructure && collectionStructure.page_id) {
        pageId = collectionStructure.page_id;
    }

    console.log(`Inserting new collection: ${collectionTitle}`);
    const { data, error } = await supabase
        .from('collections')
        .insert({
            title: collectionTitle,
            author_id: authorId,
            publication_year: publicationYear ? parseInt(publicationYear, 10) : null,
            wikipedia_page_id: pageId
        })
        .select('id')
        .single();

    if (error) {
        console.error(`Failed to insert collection ${collectionTitle}:`, error);
        return null; // Return null on error, still try to insert the poem
    }

    collectionsMap.set(key, data.id);
    return data.id;
}

async function processLine(line) {
    if (!line.trim()) return;

    try {
        const poemData = JSON.parse(line);

        // 1. Author
        const authorName = poemData.metadata?.author;
        if (!authorName) {
            console.warn(`Skipping poem ID ${poemData.page_id}: No author found`);
            return;
        }
        const authorId = await getOrCreateAuthor(authorName, poemData.metadata);
        if (!authorId) return;

        // 2. Collection
        let collectionId = null;
        const collectionTitle = poemData.collection_title || poemData.metadata?.source_collection;
        if (collectionTitle) {
            collectionId = await getOrCreateCollection(
                collectionTitle,
                authorId,
                poemData.metadata?.publication_date,
                poemData.collection_structure
            );
        }

        // 3. Poem
        const slug = generateSlug(authorName, poemData.title);

        // Check if exists
        const { data: existingPoem } = await supabase
            .from('poems')
            .select('id')
            .eq('wikisource_page_id', poemData.page_id)
            .maybeSingle();

        if (existingPoem) {
            console.log(`Poem already exists: ${poemData.title}`);
            return; // Skip duplicate
        }

        const poemInsert = {
            title: poemData.title,
            slug: slug,
            author_id: authorId,
            collection_id: collectionId,
            section_title: poemData.section_title || null,
            poem_order: poemData.poem_order || null,
            content: poemData.structure, // Use JSONB as requested
            normalized_text: poemData.normalized_text,
            language: poemData.language || 'fr',
            publication_year: poemData.metadata?.publication_date ? parseInt(poemData.metadata.publication_date, 10) : null,
            wikisource_page_id: poemData.page_id,
            hub_title: poemData.hub_title || null,
            hub_page_id: poemData.hub_page_id || poemData.page_id
        };

        const { error } = await supabase.from('poems').insert(poemInsert);
        if (error) {
            // Might fail on slug unique constraint if there's a title collision
            console.error(`Failed to insert poem ${poemData.title}:`, error.message);
        } else {
            console.log(`✅ Inserted poem: ${poemData.title}`);
        }

    } catch (e) {
        console.error("Error parsing/processing line:", e.message);
    }
}

async function run() {
    console.log("🚀 Starting ingestion script...");
    console.log(`Reading from ${POEMS_FILE_PATH}`);

    if (!fs.existsSync(POEMS_FILE_PATH)) {
        console.error("❌ File not found:", POEMS_FILE_PATH);
        process.exit(1);
    }

    const fileStream = fs.createReadStream(POEMS_FILE_PATH);
    const gunzip = zlib.createGunzip();
    const rl = readline.createInterface({
        input: fileStream.pipe(gunzip),
        crlfDelay: Infinity
    });

    let count = 0;
    for await (const line of rl) {
        await processLine(line);
        count++;
        if (count % 100 === 0) {
            console.log(`... Processed ${count} lines ...`);
        }
    }

    console.log(`🎉 Ingestion complete! Processed ${count} poems.`);
}

run().catch(console.error);
