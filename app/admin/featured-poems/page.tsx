import FeaturedPoemsClient from './FeaturedPoemsClient'
import { getPublicClient } from '@/utils/supabase/queries'

export default async function FeaturedPoemsPage() {
    // Fetch current featured poems for initial state
    const supabase = getPublicClient()
    const { data } = await supabase
        .from('featured_poems')
        .select('position, poems:poem_id(id, title, slug, authors:poem_authors(authors(id, name, slug)))')
        .order('position', { ascending: true })

    const initialItems = (data || []).map((row: any) => ({
        id: row.poems?.id || '',
        label: row.poems?.title || '',
        sublabel: (row.poems?.authors || []).map((a: any) => a.authors?.name).filter(Boolean).join(', ') || undefined,
    })).filter((p: any) => p.id)

    return <FeaturedPoemsClient initialItems={initialItems} />
}
