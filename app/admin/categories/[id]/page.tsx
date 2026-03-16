import { notFound } from 'next/navigation'
import CategoryManagerClient from './CategoryManagerClient'
import { createClient } from '@/utils/supabase/server'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CategoryPage({ params }: PageProps) {
    const { id } = await params
    const isNew = id === 'new'
    
    let category = null
    let explicitPoems: any[] = []
    let explicitAuthors: any[] = []
    let explicitCollections: any[] = []

    if (!isNew) {
        const supabase = await createClient()

        // 1. Fetch category
        const { data: cat } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .maybeSingle()
        
        if (!cat) notFound()
        category = cat

        // 2. Fetch explicit links
        const { data: pLinks } = await supabase
            .from('poem_categories')
            .select('position, poems(id, title, authors(name))')
            .eq('category_id', cat.id)
            .order('position')
        
        explicitPoems = (pLinks || []).map((l: any) => {
            const authorsList = Array.isArray(l.poems.authors) ? l.poems.authors : [l.poems.authors];
            return {
                id: l.poems.id,
                label: l.poems.title,
                sublabel: authorsList.map((a: any) => a?.name).filter(Boolean).join(', '),
            }
        })

        const { data: aLinks } = await supabase
            .from('author_categories')
            .select('position, authors(id, name)')
            .eq('category_id', cat.id)
            .order('position')
        
        explicitAuthors = (aLinks || []).map((l: any) => ({
            id: l.authors.id,
            label: l.authors.name,
        }))

        const { data: cLinks } = await supabase
            .from('collection_categories')
            .select('position, collections(id, title, authors(name))')
            .eq('category_id', cat.id)
            .order('position')
        
        explicitCollections = (cLinks || []).map((l: any) => {
            const authorsList = Array.isArray(l.collections.authors) ? l.collections.authors : [l.collections.authors];
            return {
                id: l.collections.id,
                label: l.collections.title,
                sublabel: authorsList.map((a: any) => a?.name).filter(Boolean).join(', '),
            }
        })
    }

    return (
        <CategoryManagerClient 
            initialCategory={category}
            initialPoems={explicitPoems}
            initialAuthors={explicitAuthors}
            initialCollections={explicitCollections}
        />
    )
}
