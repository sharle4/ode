import { createClient } from "@/utils/supabase/server";
import PoemActions from "./PoemActions";

interface PoemActionsWrapperProps {
    poemId: string;
}

export default async function PoemActionsWrapper({ poemId }: PoemActionsWrapperProps) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    let hasLiked = false;

    if (userData?.user) {
        const { data: likeData } = await supabase
            .from('poem_likes')
            .select('user_id')
            .eq('user_id', userData.user.id)
            .eq('poem_id', poemId)
            .maybeSingle();

        if (likeData) hasLiked = true;
    }

    return <PoemActions poemId={poemId} initialIsLiked={hasLiked} />;
}
