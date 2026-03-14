import { getPublicClient } from '@/utils/supabase/queries'
import FeaturedAuthorsClient from './FeaturedAuthorsClient'

export default async function FeaturedAuthorsPage() {
    const supabase = getPublicClient()
    const { data } = await supabase
        .from('featured_authors')
        .select('position, authors:author_id(id, name, slug, image_url)')
        .order('position', { ascending: true })

    const initialItems = (data || []).map((row: any) => ({
        id: row.authors?.id || '',
        label: row.authors?.name || '',
        sublabel: row.authors?.slug || undefined,
    })).filter((a: any) => a.id)

    return <FeaturedAuthorsClient initialItems={initialItems} />
}
