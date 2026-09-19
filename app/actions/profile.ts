'use server'

import { getUserLikesByUsername } from '@/utils/supabase/queries';

export async function fetchUserLikesAction(username: string) {
    if (!username) {
        return { likedPoems: [], likedCollections: [], likedAuthors: [] };
    }
    return await getUserLikesByUsername(username);
}
