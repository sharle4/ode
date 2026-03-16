import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { CACHE_TAGS } from '@/lib/cache-keys';

// Create a single public client for cached queries to avoid cookie parsing dynamically 
// (which would opt routes into dynamic rendering and break unstable_cache).
// Instantiate safely inside the function to prevent Cross-Request State Pollution
// Wrap in React cache() to memoize the instance per-request, avoiding duplicate instantiations in the same render cycle
export const getPublicClient = cache(() => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
})

interface CacheOptions {
    keyParts: string[];
    tags: string[];
    revalidate?: number | false;
    errorMessage: string;
}

const executeCachedQuery = <T>(
    options: CacheOptions,
    queryFn: (supabase: ReturnType<typeof getPublicClient>) => Promise<T>
): Promise<T> => {
    return unstable_cache(
        async () => {
            try {
                const supabase = getPublicClient();
                return await queryFn(supabase);
            } catch (error) {
                console.error(options.errorMessage, error);
                throw error;
            }
        },
        options.keyParts,
        { tags: options.tags, revalidate: options.revalidate }
    )();
};

export const getPoemBySlug = (slug: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.poem(slug)],
        tags: [CACHE_TAGS.poem(slug)],
        revalidate: 86400, // 24 hours caching
        errorMessage: 'Database Error fetching poem by slug:'
    },
    async (supabase) => {
        const { data: poem } = await supabase
            .from('poems')
            .select(`
                id, title, slug, normalized_text, language, publication_year, average_review, reviews_count, content,
                authors ( id, name, slug ),
                collections ( id, title )
            `)
            .eq('slug', slug)
            .maybeSingle()
            .throwOnError();

        if (poem && Array.isArray(poem.content)) {
            return { ...poem, content: { stanzas: poem.content } };
        }

        return poem;
    }
);

const fetchAuthorByField = (field: 'id' | 'slug', value: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.author(value)],
        tags: [CACHE_TAGS.author(value)],
        revalidate: 86400,
        errorMessage: `Database Error fetching author by ${field}:`
    },
    async (supabase) => {
        const { data: author } = await supabase
            .from('authors')
            .select(`
                *,
                poems ( id, title, slug ),
                collections ( id, title, publication_year )
            `)
            .eq(field, value)
            .maybeSingle()
            .throwOnError();

        return author;
    }
);

export const getAuthorById = (id: string) => fetchAuthorByField('id', id);
export const getAuthorBySlug = (slug: string) => fetchAuthorByField('slug', slug);

const fetchCollectionByField = (field: 'id' | 'slug', value: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.collection(value)],
        tags: [CACHE_TAGS.collection(value)],
        revalidate: 86400,
        errorMessage: `Error fetching collection by ${field}:`
    },
    async (supabase) => {
        const { data: collection } = await supabase
            .from('collections')
            .select('id, title, slug, publication_year, summary, cover_url, poems_count, average_review, reviews_count, authors ( id, name, slug )')
            .eq(field, value)
            .maybeSingle()
            .throwOnError();

        if (!collection) {
            return null;
        }

        const { data: poems } = await supabase
            .from('poems')
            .select('id, title, slug, poem_order')
            .eq('collection_id', collection.id)
            .order('poem_order', { ascending: true, nullsFirst: false })
            .throwOnError();

        return { ...collection, poems };
    }
);

export const getCollectionById = (id: string) => fetchCollectionByField('id', id);
export const getCollectionBySlug = (slug: string) => fetchCollectionByField('slug', slug);

export const getDailyPoem = () => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.daily],
        tags: [CACHE_TAGS.daily],
        revalidate: 3600, // Check every hour
        errorMessage: 'Database Error fetching daily poem:'
    },
    async (supabase) => {
        const today = new Date().toISOString().split('T')[0];

        const { data: dailyPoem } = await supabase
            .from('daily_poems')
            .select('poem_id')
            .eq('date', today)
            .maybeSingle()
            .throwOnError();

        if (!dailyPoem?.poem_id) {
            return null;
        }

        const { data: poem } = await supabase
            .from('poems')
            .select('*, authors ( id, name, slug )')
            .eq('id', dailyPoem.poem_id)
            .maybeSingle()
            .throwOnError();

        if (poem && Array.isArray(poem.content)) {
            return { ...poem, content: { stanzas: poem.content } };
        }

        return poem;
    }
);

export const getTrendingPoems = (limit: number = 10) => executeCachedQuery(
    {
        keyParts: [`trending-poems-${limit}`],
        tags: [CACHE_TAGS.trending],
        revalidate: 3600,
        errorMessage: 'Database Error fetching trending poems:'
    },
    async (supabase) => {
        const { data: poems } = await supabase
            .from('poems')
            .select(`
                *,
                authors ( id, name, slug )
            `)
            .limit(limit)
            .order('reads_count', { ascending: false })
            .order('id', { ascending: false }) // Tie-breaker
            .throwOnError();

        return poems;
    }
);

// ── FEATURED CONTENT (Homepage) ──

export const getFeaturedAuthors = () => executeCachedQuery(
    {
        keyParts: ['featured-authors'],
        tags: [CACHE_TAGS.featured],
        revalidate: 86400,
        errorMessage: 'Database Error fetching featured authors:'
    },
    async (supabase) => {
        const { data } = await supabase
            .from('featured_authors')
            .select('position, authors ( id, name, slug, image_url )')
            .order('position', { ascending: true })
            .throwOnError();

        // Flatten the join: { position, authors: { ... } } → { position, ...author }
        return (data || []).map((row: any) => ({
            ...row.authors,
            position: row.position,
        }));
    }
);

export const getFeaturedCollections = () => executeCachedQuery(
    {
        keyParts: ['featured-collections'],
        tags: [CACHE_TAGS.featured],
        revalidate: 86400,
        errorMessage: 'Database Error fetching featured collections:'
    },
    async (supabase) => {
        const { data } = await supabase
            .from('featured_collections')
            .select('position, collections ( id, title, slug, publication_year, poems_count, authors ( id, name, slug ) )')
            .order('position', { ascending: true })
            .throwOnError();

        return (data || []).map((row: any) => ({
            ...row.collections,
            position: row.position,
        }));
    }
);

// ── COMMUNITY FEED ──

export const getCommunityFeed = (limit: number = 8) => executeCachedQuery(
    {
        keyParts: [`community-feed-${limit}`],
        tags: [CACHE_TAGS.community],
        revalidate: 300, // 5 minutes for fresh community data
        errorMessage: 'Database Error fetching community feed:'
    },
    async (supabase) => {
        const { data } = await supabase
            .from('poem_reviews')
            .select(`
                id, score, review_text, created_at,
                users!poem_reviews_user_id_fkey ( id, username, avatar_url ),
                poems ( id, title, slug, authors ( id, name, slug ) )
            `)
            .order('created_at', { ascending: false })
            .limit(limit)
            .throwOnError();

        return data || [];
    }
);

// ── CATEGORIES ──

export const getCategories = () => executeCachedQuery(
    {
        keyParts: ['all-categories'],
        tags: [CACHE_TAGS.categories],
        revalidate: 86400,
        errorMessage: 'Database Error fetching categories:'
    },
    async (supabase) => {
        const { data } = await supabase
            .from('categories')
            .select('id, name, description, slug, ornament_id, color')
            .order('name', { ascending: true })
            .throwOnError();

        return data || [];
    }
);

// ── PLATFORM STATS (HeroSection) ──

export const getPlatformStats = () => executeCachedQuery(
    {
        keyParts: ['platform-stats-v2'],
        tags: [CACHE_TAGS.stats],
        revalidate: 3600,
        errorMessage: 'Database Error fetching platform stats:'
    },
    async (supabase) => {
        const [poemsResult, collectionsResult, authorsResult] = await Promise.all([
            supabase.from('poems').select('id', { count: 'exact', head: true }).throwOnError(),
            supabase.from('collections').select('id', { count: 'exact', head: true }).throwOnError(),
            supabase.from('authors').select('id', { count: 'exact', head: true }).throwOnError(),
        ]);

        return {
            poemsCount: poemsResult.count || 0,
            collectionsCount: collectionsResult.count || 0,
            authorsCount: authorsResult.count || 0,
        };
    }
);

// ── AUTHOR WITH FULL WORKS ──

export const getAuthorWithWorks = (slug: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.author(slug), 'works'],
        tags: [CACHE_TAGS.author(slug)],
        revalidate: 86400,
        errorMessage: 'Database Error fetching author with works:'
    },
    async (supabase) => {
        // 1. Fetch the author
        const { data: author } = await supabase
            .from('authors')
            .select('*')
            .eq('slug', slug)
            .maybeSingle()
            .throwOnError();

        if (!author) return null;

        // 2. Fetch author's collections via junction table
        const { data: collectionLinks } = await supabase
            .from('collection_authors')
            .select('collections ( id, title, slug, publication_year, poems_count, summary )')
            .eq('author_id', author.id)
            .throwOnError();

        const collections = (collectionLinks || []).map((link: any) => link.collections).filter(Boolean);

        // 3. Fetch author's poems via junction table, ordered by popularity
        const { data: poemLinks } = await supabase
            .from('poem_authors')
            .select('poems ( id, title, slug, average_review, reads_count )')
            .eq('author_id', author.id)
            .throwOnError();

        const poems = (poemLinks || [])
            .map((link: any) => link.poems)
            .filter(Boolean)
            .sort((a: any, b: any) => (b.reads_count || 0) - (a.reads_count || 0));

        return { ...author, collections, poems };
    }
);

// ── COLLECTION WITH SECTIONS ──

export const getCollectionWithSections = (slug: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.collection(slug), 'sections'],
        tags: [CACHE_TAGS.collection(slug)],
        revalidate: 86400,
        errorMessage: 'Database Error fetching collection with sections:'
    },
    async (supabase) => {
        // 1. Fetch the collection with its authors
        const { data: collection } = await supabase
            .from('collections')
            .select('id, title, slug, publication_year, summary, cover_url, poems_count, average_review, reviews_count, authors ( id, name, slug )')
            .eq('slug', slug)
            .maybeSingle()
            .throwOnError();

        if (!collection) return null;

        // 2. Fetch all poems in this collection, ordered
        const { data: poems } = await supabase
            .from('poems')
            .select('id, title, slug, section_title, poem_order, reads_count')
            .eq('collection_id', collection.id)
            .order('poem_order', { ascending: true, nullsFirst: false })
            .throwOnError();

        // 3. Group poems by section_title
        const sectionsMap = new Map<string, any[]>();
        for (const poem of (poems || [])) {
            const section = poem.section_title || 'Poèmes';
            if (!sectionsMap.has(section)) {
                sectionsMap.set(section, []);
            }
            sectionsMap.get(section)!.push(poem);
        }

        const sections = Array.from(sectionsMap.entries()).map(([title, poemsList]) => ({
            title,
            poems: poemsList,
        }));

        return { ...collection, sections, allPoems: poems || [] };
    }
);

// ── CATEGORY WITH CONTENT ──

export const getCategoryWithContent = (slug: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.categoryDetail(slug)],
        tags: [CACHE_TAGS.categoryDetail(slug)],
        revalidate: 3600,
        errorMessage: 'Database Error fetching category content:'
    },
    async (supabase) => {
        // 1. Fetch category directly by its unique slug
        const { data: category } = await supabase
            .from('categories')
            .select('id, name, description, slug, ornament_id, color')
            .eq('slug', slug)
            .maybeSingle()
            .throwOnError();

        if (!category) return null;

        // 2. Fetch explicitly linked poems, respecting editorial sort position
        const { data: poemLinks } = await supabase
            .from('poem_categories')
            .select('position, poems ( id, title, slug, average_review, reads_count, authors ( id, name, slug ) )')
            .eq('category_id', category.id)
            .order('position', { ascending: true })
            .throwOnError();

        const poems = (poemLinks || []).map((link: any) => link.poems).filter(Boolean);

        // 3. Extract implicitly linked authors from the poems
        const implicitAuthorsMap = new Map<string, any>();
        for (const poem of poems) {
            for (const author of (poem.authors || [])) {
                if (!implicitAuthorsMap.has(author.id)) {
                    implicitAuthorsMap.set(author.id, author);
                }
            }
        }

        // 4. Fetch explicitly linked authors, respecting editorial sort position
        const { data: authorLinks } = await supabase
            .from('author_categories')
            .select('position, authors ( id, name, slug, image_url )')
            .eq('category_id', category.id)
            .order('position', { ascending: true })
            .throwOnError();

        const explicitAuthors = (authorLinks || []).map((link: any) => link.authors).filter(Boolean);

        // Combine: Prioritize explicitly linked authors for order, then append implicitly linked ones
        const finalAuthorsMap = new Map<string, any>();
        for (const author of explicitAuthors) {
            finalAuthorsMap.set(author.id, author);
        }
        for (const [id, author] of implicitAuthorsMap.entries()) {
            if (!finalAuthorsMap.has(id)) {
                finalAuthorsMap.set(id, author);
            }
        }

        // 5. Fetch explicitly linked collections, respecting editorial sort position
        const { data: collectionLinks } = await supabase
            .from('collection_categories')
            .select('position, collections ( id, title, slug, publication_year, poems_count )')
            .eq('category_id', category.id)
            .order('position', { ascending: true })
            .throwOnError();

        const explicitCollections = (collectionLinks || []).map((link: any) => link.collections).filter(Boolean);

        // Fallback: Use featured collections if there are absolutely no explicit collections
        let collections = explicitCollections;
        if (collections.length === 0) {
            const { data: featuredCollections } = await supabase
                .from('featured_collections')
                .select('collections ( id, title, slug, publication_year, poems_count )')
                .order('position', { ascending: true })
                .limit(3)
                .throwOnError();
            collections = (featuredCollections || []).map((row: any) => row.collections).filter(Boolean);
        }

        return {
            ...category,
            poems,
            authors: Array.from(finalAuthorsMap.values()),
            collections,
        };
    }
);

// ── USER PROFILE ──

export const getUserProfileByUsername = (username: string) => executeCachedQuery(
    {
        keyParts: [CACHE_TAGS.profile(username)],
        tags: [CACHE_TAGS.profile(username)],
        revalidate: 300,
        errorMessage: 'Database Error fetching user profile:'
    },
    async (supabase) => {
        // 1. Fetch user profile
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle()
            .throwOnError();

        if (!user) return null;

        // 2. Fetch stats in parallel
        const [readsResult, reviewsResult, listsResult, followersResult, followingResult] = await Promise.all([
            supabase.from('reads').select('id', { count: 'exact', head: true }).eq('user_id', user.id).throwOnError(),
            supabase.from('poem_reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id).throwOnError(),
            supabase.from('lists').select('id', { count: 'exact', head: true }).eq('user_id', user.id).throwOnError(),
            supabase.from('followers').select('follower_id', { count: 'exact', head: true }).eq('following_id', user.id).throwOnError(),
            supabase.from('followers').select('following_id', { count: 'exact', head: true }).eq('follower_id', user.id).throwOnError(),
        ]);

        // 3. Fetch top poems
        const { data: topPoemLinks } = await supabase
            .from('user_top_poems')
            .select('position, poems ( id, title, slug, average_review, authors ( id, name, slug ) )')
            .eq('user_id', user.id)
            .order('position', { ascending: true })
            .throwOnError();

        const topPoems = (topPoemLinks || []).map((link: any) => ({ ...link.poems, position: link.position })).filter((p: any) => p.id);

        // 4. Fetch top authors
        const { data: topAuthorLinks } = await supabase
            .from('user_top_authors')
            .select('position, authors ( id, name, slug, image_url )')
            .eq('user_id', user.id)
            .order('position', { ascending: true })
            .throwOnError();

        const topAuthors = (topAuthorLinks || []).map((link: any) => ({ ...link.authors, position: link.position })).filter((a: any) => a.id);

        // 5. Fetch recent reviews
        const { data: recentReviews } = await supabase
            .from('poem_reviews')
            .select('id, score, review_text, created_at, poems ( id, title, slug, authors ( id, name, slug ) )')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3)
            .throwOnError();

        // 6. Fetch badges
        const { data: userBadges } = await supabase
            .from('user_badges')
            .select('unlocked_at, badges ( id, name, description, icon_url )')
            .eq('user_id', user.id)
            .throwOnError();

        const badges = (userBadges || []).map((link: any) => ({ ...link.badges, unlocked_at: link.unlocked_at })).filter((b: any) => b.id);

        // 7. Fetch review score distribution
        const { data: allReviews } = await supabase
            .from('poem_reviews')
            .select('score')
            .eq('user_id', user.id)
            .throwOnError();

        const reviewDistribution = [5, 4, 3, 2, 1].map(stars => ({
            stars,
            count: (allReviews || []).filter((r: any) => Math.round(r.score) === stars).length,
        }));

        return {
            ...user,
            stats: {
                reads: readsResult.count || 0,
                reviews: reviewsResult.count || 0,
                lists: listsResult.count || 0,
                followers: followersResult.count || 0,
                following: followingResult.count || 0,
            },
            topPoems,
            topAuthors,
            recentReviews: recentReviews || [],
            badges,
            reviewDistribution,
        };
    }
);

// ── POEM REVIEW DISTRIBUTION ──

export const getPoemReviewDistribution = (poemId: string) => executeCachedQuery(
    {
        keyParts: [`poem-reviews-dist-${poemId}`],
        tags: [CACHE_TAGS.poem(poemId)],
        revalidate: 3600,
        errorMessage: 'Database Error fetching poem review distribution:'
    },
    async (supabase) => {
        const { data: reviews } = await supabase
            .from('poem_reviews')
            .select('score')
            .eq('poem_id', poemId)
            .throwOnError();

        const total = (reviews || []).length;
        return [5, 4, 3, 2, 1].map(stars => {
            const count = (reviews || []).filter((r: any) => Math.round(r.score) === stars).length;
            return {
                stars,
                count,
                pct: total > 0 ? Math.round((count / total) * 100) : 0,
            };
        });
    }
);

