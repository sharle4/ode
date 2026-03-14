'use client'

import FeaturedManager from '@/components/admin/FeaturedManager'
import { type SearchResult } from '@/components/admin/SearchSelect'
import { type SortableItem } from '@/components/admin/SortableList'
import { searchAuthors, saveFeaturedAuthors } from '@/app/actions/admin'

interface FeaturedAuthorsClientProps {
    initialItems: SortableItem[]
}

export default function FeaturedAuthorsClient({ initialItems }: FeaturedAuthorsClientProps) {
    const handleSearch = async (query: string): Promise<SearchResult[]> => {
        const result = await searchAuthors({ query })
        if (result?.data?.success && result.data.data) {
            return result.data.data.map((author: any) => ({
                id: author.id,
                label: author.name,
                sublabel: author.slug,
            }))
        }
        return []
    }

    const handleSave = async (ids: string[]) => {
        const result = await saveFeaturedAuthors({ authorIds: ids })
        if (result?.data?.failure) {
            return { failure: result.data.failure }
        }
        return { success: true }
    }

    return (
        <FeaturedManager
            title="Auteurs à la une"
            description="Choisissez quels auteurs apparaissent dans la section « Auteurs à la une » de la page d'accueil."
            initialItems={initialItems}
            searchPlaceholder="Rechercher un auteur par nom…"
            onSearch={handleSearch}
            onSave={handleSave}
            emptyMessage="Aucun auteur sélectionné. Utilisez la barre de recherche ci-dessus."
        />
    )
}
