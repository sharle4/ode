import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/utils/supabase/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = (searchParams.get("q") || "").trim();

        if (!query) {
            return NextResponse.json({
                poems: [],
                authors: [],
                collections: [],
                categories: [],
                total: 0
            });
        }

        const results = await searchCatalog(query, {
            limit: 8,
            includeVerses: true
        });

        return NextResponse.json(results, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180"
            }
        });
    } catch (error) {
        console.error("Error in /api/search:", error);
        return NextResponse.json(
            {
                poems: [],
                authors: [],
                collections: [],
                categories: [],
                total: 0,
                error: "Search query failed"
            },
            { status: 500 }
        );
    }
}
