import { getPublicClient } from '@/utils/supabase/queries'
import FeaturedCollectionsClient from './FeaturedCollectionsClient'

export default async function FeaturedCollectionsPage() {
    const supabase = getPublicClient()
    const { data } = await supabase
        .from('featured_collections')
        .select('position, collections:collection_id(id, title, slug, authors:collection_authors(authors(id, name, slug)))')
        .order('position', { ascending: true })

    const initialItems = (data || []).map((row: any) => ({
        id: row.collections?.id || '',
        label: row.collections?.title || '',
        sublabel: (row.collections?.authors || []).map((a: any) => a.authors?.name).filter(Boolean).join(', ') || undefined,
    })).filter((c: any) => c.id)

    return <FeaturedCollectionsClient initialItems={initialItems} />
}
