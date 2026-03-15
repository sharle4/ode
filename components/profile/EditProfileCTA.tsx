"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Pen } from "@phosphor-icons/react";

interface EditProfileCTAProps {
    profileUsername: string;
}

export default function EditProfileCTA({ profileUsername }: EditProfileCTAProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isOwner, setIsOwner] = useState<boolean | null>(null);
    const supabase = createClient();

    useEffect(() => {
        setIsMounted(true);
        let isSubscribed = true;

        async function checkOwnership() {
            try {
                // Get the current user session
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) {
                    if (isSubscribed) setIsOwner(false);
                    return;
                }

                // Check if the connected user's meta data matches the profile username
                // Or fetch their public.users record
                const { data } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', user.id)
                    .maybeSingle();

                if (isSubscribed) {
                     // Careful: we decode the URL username before comparing just in case
                     setIsOwner(data?.username === decodeURIComponent(profileUsername));
                }
            } catch (error) {
                console.error("Error checking profile ownership:", error);
                if (isSubscribed) setIsOwner(false);
            }
        }

        checkOwnership();

        return () => {
             isSubscribed = false;
        };
    }, [profileUsername, supabase]);

    // Don't render anything during SSR or while loading or if not the owner
    if (!isMounted || isOwner === null || !isOwner) {
        return null;
    }

    return (
        <Link 
            href="/settings"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2 rounded-full border border-soft-border text-charcoal hover:bg-soft-border/50 hover:border-charcoal/20 transition-all font-medium text-sm"
        >
            <Pen size={16} />
            Modifier mon profil
        </Link>
    );
}
