"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { toggleFollow } from "@/app/actions/poetry";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
    profileId: string;
}

export default function FollowButton({ profileId }: FollowButtonProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Optimistic state for immediate UI feedback
    const [optimisticIsFollowing, setOptimisticIsFollowing] = useOptimistic(
        isFollowing,
        (state, newFollowingState: boolean) => newFollowingState
    );

    useEffect(() => {
        setIsMounted(true);
        let isSubscribed = true;

        async function checkFollowStatus() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    if (isSubscribed) {
                        setIsLoading(false);
                        setIsFollowing(false);
                    }
                    return;
                }

                // Disallow following oneself (though backend prevents it too, good UX to not show it)
                if (user.id === profileId) {
                     if (isSubscribed) {
                        setIsLoading(false);
                        setIsFollowing(false);
                     }
                     return;
                }

                const { data } = await supabase
                    .from('followers')
                    .select('follower_id')
                    .eq('follower_id', user.id)
                    .eq('following_id', profileId)
                    .maybeSingle();

                if (isSubscribed) {
                    setIsFollowing(!!data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error checking follow status:", error);
                if (isSubscribed) {
                    setIsLoading(false);
                }
            }
        }

        checkFollowStatus();

        return () => {
            isSubscribed = false;
        };
    }, [profileId, supabase]);

    const handleToggle = async () => {
        // Prevent action if not logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
             router.push('/login');
             return;
        }

        startTransition(async () => {
             // 1. Instantly update UI optimistically
             setOptimisticIsFollowing(!isFollowing);

             // 2. Perform server action
             const result = await toggleFollow({ followingId: profileId });

             // 3. Update truth state
             if (result?.data?.success) {
                 setIsFollowing(result.data.isFollowing);
             } else {
                 // On failure, optimistic state automatically reverts to `isFollowing` truth
                 console.error("Failed to toggle follow:", result?.serverError || result?.validationErrors);
                 alert(result?.data?.failure || "Une erreur est survenue.");
             }
        });
    };

    if (!isMounted) {
         // Prevent hydration mismatch by rendering a skeleton
         return (
             <button disabled className="h-9 min-w-[110px] flex items-center justify-center rounded-full border border-soft-border text-transparent bg-soft-border/20 animate-pulse font-medium text-sm">
                 Chargement
             </button>
         );
    }

    if (isLoading) {
         return (
             <button disabled className="h-9 min-w-[110px] flex items-center justify-center rounded-full border border-soft-border text-transparent bg-soft-border/20 animate-pulse font-medium text-sm">
                 Chargement
             </button>
         );
    }

    return (
        <button 
            onClick={handleToggle}
            disabled={isPending}
            className={`h-9 min-w-[110px] flex items-center justify-center rounded-full font-medium text-sm transition-colors ${
                optimisticIsFollowing 
                ? "bg-white border text-charcoal shadow-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" 
                : "bg-charcoal text-cream hover:bg-charcoal/90"
            }`}
        >
            {optimisticIsFollowing ? "Abonné" : "Suivre"}
        </button>
    );
}
