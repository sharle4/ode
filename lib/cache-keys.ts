// lib/cache-keys.ts
export const CACHE_TAGS = {
    poem: (slug: string) => `poem-${slug}`,
    author: (identifier: string) => `author-${identifier}`,
    collection: (identifier: string) => `collection-${identifier}`,
    profile: (username: string) => `profile-${username}`,
    trending: 'trending-poems',
    daily: 'daily-poem',
} as const;
