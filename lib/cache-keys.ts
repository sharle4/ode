// lib/cache-keys.ts
export const CACHE_TAGS = {
    poem: (slug: string) => `poem-${slug}`,
    author: (identifier: string) => `author-${identifier}`,
    collection: (identifier: string) => `collection-${identifier}`,
    list: (listId: string) => `list-${listId}`,
    userList: (username: string, slug: string) => `user-list-${username}-${slug}`,
    userLists: (username: string) => `user-lists-${username}`,
    poemListsMembership: (userId: string, poemId: string) => `poem-lists-${userId}-${poemId}`,
    profile: (username: string) => `profile-${username}`,
    trending: 'trending-poems',
    daily: 'daily-poem',
    featured: 'featured-content',
    community: 'community-feed',
    categories: 'categories',
    stats: 'platform-stats',
    categoryDetail: (slug: string) => `category-${slug}`,
} as const;
