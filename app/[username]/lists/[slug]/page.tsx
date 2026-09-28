import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getListByUsernameAndSlug } from "@/utils/supabase/queries";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListDetailView from "@/components/lists/ListDetailView";
import { WithContext, ItemList } from "schema-dts";

interface ListPageProps {
    params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: ListPageProps): Promise<Metadata> {
    const { username, slug } = await params;
    const decodedUsername = decodeURIComponent(username);
    const decodedSlug = decodeURIComponent(slug);
    const list = await getListByUsernameAndSlug(decodedUsername, decodedSlug);

    if (!list) {
        return { title: "Liste introuvable - ode" };
    }

    const title = `${list.title} — par ${decodedUsername} | ode`;
    const description =
        list.description ||
        `Découvrez la sélection poétique « ${list.title} » (${list.poems_count} poèmes) organisée par ${decodedUsername} sur ode.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default async function ListPage({ params }: ListPageProps) {
    const { username, slug } = await params;
    const decodedUsername = decodeURIComponent(username);
    const decodedSlug = decodeURIComponent(slug);

    const [list, authUser] = await Promise.all([
        getListByUsernameAndSlug(decodedUsername, decodedSlug),
        (async () => {
            const supabase = await createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            return user;
        })(),
    ]);

    if (!list) {
        notFound();
    }

    const isOwner = authUser?.id === list.user_id;

    // If list is private, only owner can view it
    if (!list.is_public && !isOwner) {
        notFound();
    }

    // Check if authenticated user has liked this list
    let initialHasLiked = false;
    if (authUser) {
        const supabase = await createClient();
        const { data: likeData } = await supabase
            .from("list_likes")
            .select("user_id")
            .eq("user_id", authUser.id)
            .eq("list_id", list.id)
            .maybeSingle();

        initialHasLiked = !!likeData;
    }

    // JSON-LD structured data for SEO
    const jsonLd: WithContext<ItemList> = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: list.title,
        description: list.description || undefined,
        numberOfItems: list.items?.length || 0,
        itemListElement: (list.items || []).filter(Boolean).map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item?.poem?.title || "Poème",
        })),
    };

    return (
        <div className="min-h-[100dvh] bg-cream flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

            <main className="flex-grow pt-24 md:pt-28 pb-16">
                <ListDetailView
                    list={list as any}
                    isOwner={isOwner}
                    initialHasLiked={initialHasLiked}
                />
            </main>

            <Footer />
        </div>
    );
}
