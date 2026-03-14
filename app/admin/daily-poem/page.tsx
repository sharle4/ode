import { getPublicClient } from '@/utils/supabase/queries'
import DailyPoemClient from './DailyPoemClient'

export default async function DailyPoemPage() {
    const supabase = getPublicClient()

    const { data } = await supabase
        .from('daily_poems')
        .select('date, is_manual, poems:poem_id(id, title, slug, authors:poem_authors(authors(id, name, slug)))')
        .order('date', { ascending: false })
        .limit(7)

    const history = (data || []).map((row: any) => ({
        date: row.date,
        isManual: row.is_manual ?? false,
        id: row.poems?.id || '',
        title: row.poems?.title || '',
        slug: row.poems?.slug || '',
        authors: (row.poems?.authors || []).map((a: any) => a.authors).filter(Boolean),
    })).filter((p: any) => p.id)

    return <DailyPoemClient history={history} />
}
