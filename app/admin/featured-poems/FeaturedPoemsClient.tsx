'use client'

import FeaturedManager from '@/components/admin/FeaturedManager'
import { type SearchResult } from '@/components/admin/SearchSelect'
import { type SortableItem } from '@/components/admin/SortableList'
import { searchPoems, saveFeaturedPoems } from '@/app/actions/admin'

interface FeaturedPoemsClientProps {
    initialItems: SortableItem[]
}

export default function FeaturedPoemsClient({ initialItems }: FeaturedPoemsClientProps) {
    const handleSearch = async (query: string): Promise<SearchResult[]> => {
        const result = await searchPoems({ query })
        if (result?.data?.success && result.data.data) {
            return result.data.data.map((poem: any) => ({
                id: poem.id,
                label: poem.title,
                sublabel: poem.authors?.map((a: any) => a.name).join(', ') || undefined,
            }))
        }
        return []
    }

    const handleSave = async (ids: string[]) => {
        const result = await saveFeaturedPoems({ poemIds: ids })
        if (result?.data?.failure) {
            return { failure: result.data.failure }
        }
        return { success: true }
    }

    return (
        <FeaturedManager
            title="Poèmes à la une"
            description="Sélectionnez et ordonnez les poèmes mis en avant sur la page d'accueil."
            initialItems={initialItems}
            searchPlaceholder="Rechercher un poème par titre…"
            onSearch={handleSearch}
            onSave={handleSave}
            emptyMessage="Aucun poème sélectionné. Utilisez la barre de recherche ci-dessus."
        />
    )
}
