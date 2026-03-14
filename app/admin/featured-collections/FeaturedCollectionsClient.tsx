'use client'

import FeaturedManager from '@/components/admin/FeaturedManager'
import { type SearchResult } from '@/components/admin/SearchSelect'
import { type SortableItem } from '@/components/admin/SortableList'
import { searchCollections, saveFeaturedCollections } from '@/app/actions/admin'

interface FeaturedCollectionsClientProps {
    initialItems: SortableItem[]
}

export default function FeaturedCollectionsClient({ initialItems }: FeaturedCollectionsClientProps) {
    const handleSearch = async (query: string): Promise<SearchResult[]> => {
        const result = await searchCollections({ query })
        if (result?.data?.success && result.data.data) {
            return result.data.data.map((col: any) => ({
                id: col.id,
                label: col.title,
                sublabel: col.authors?.map((a: any) => a.name).join(', ') || undefined,
            }))
        }
        return []
    }

    const handleSave = async (ids: string[]) => {
        const result = await saveFeaturedCollections({ collectionIds: ids })
        if (result?.data?.failure) {
            return { failure: result.data.failure }
        }
        return { success: true }
    }

    return (
        <FeaturedManager
            title="Recueils à la une"
            description="Gérez les recueils mis en avant et leur ordre d'affichage sur la page d'accueil."
            initialItems={initialItems}
            searchPlaceholder="Rechercher un recueil par titre…"
            onSearch={handleSearch}
            onSave={handleSave}
            emptyMessage="Aucun recueil sélectionné. Utilisez la barre de recherche ci-dessus."
        />
    )
}
