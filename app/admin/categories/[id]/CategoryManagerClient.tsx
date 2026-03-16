'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FloppyDisk, Trash, ArrowLeft, Tag, Info, MagnifyingGlass, Plus } from '@phosphor-icons/react'
import { saveCategory, deleteCategory, saveCategoryPoems, saveCategoryAuthors, saveCategoryCollections } from '@/app/actions/admin-categories'
import { searchPoems, searchAuthors, searchCollections } from '@/app/actions/admin'
import SortableList, { type SortableItem } from '@/components/admin/SortableList'
import SearchSelect, { type SearchResult } from '@/components/admin/SearchSelect'
import { ORNAMENT_IDS, OrnamentIcon } from '@/components/ui/ornaments'

export default function CategoryManagerClient({ 
    initialCategory, 
    initialPoems = [], 
    initialAuthors = [], 
    initialCollections = [] 
}: {
    initialCategory: any | null,
    initialPoems: SortableItem[],
    initialAuthors: SortableItem[],
    initialCollections: SortableItem[]
}) {
    const router = useRouter()
    const isNew = !initialCategory
    
    // Form state
    const [name, setName] = useState(initialCategory?.name || '')
    const [description, setDescription] = useState(initialCategory?.description || '')
    const [color, setColor] = useState(initialCategory?.color || '')
    const [ornamentId, setOrnamentId] = useState(initialCategory?.ornament_id || '')
    
    const [isSavingInfo, setIsSavingInfo] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    
    // Tab state
    const [activeTab, setActiveTab] = useState<'poems' | 'authors' | 'collections'>('poems')
    
    // Content state
    const [poems, setPoems] = useState<SortableItem[]>(initialPoems)
    const [authors, setAuthors] = useState<SortableItem[]>(initialAuthors)
    const [collections, setCollections] = useState<SortableItem[]>(initialCollections)
    
    const [isSavingContent, setIsSavingContent] = useState(false)

    // Save Info (Details)
    const handleSaveInfo = async () => {
        setIsSavingInfo(true)
        const res = await saveCategory({
            id: initialCategory?.id,
            name,
            description,
            color,
            ornament_id: ornamentId,
            slug: initialCategory?.slug
        })
        setIsSavingInfo(false)
        if (res?.data?.success) {
            router.push('/admin/categories')
            router.refresh()
        } else {
            alert('Erreur lors de la sauvegarde : ' + (res?.data?.failure || '?'))
        }
    }

    const handleDelete = async () => {
        if (!initialCategory?.id) return
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Toutes les liaisons seront perdues.')) return
        setIsDeleting(true)
        const res = await deleteCategory({ id: initialCategory.id })
        setIsDeleting(false)
        if (res?.data?.success) {
            router.push('/admin/categories')
            router.refresh()
        }
    }

    // Handlers for Add/Remove
    const handleAdd = (item: SearchResult) => {
        if (activeTab === 'poems') setPoems(prev => [...prev, item])
        if (activeTab === 'authors') setAuthors(prev => [...prev, item])
        if (activeTab === 'collections') setCollections(prev => [...prev, item])
    }

    const handleRemove = (id: string) => {
        if (activeTab === 'poems') setPoems(prev => prev.filter(i => i.id !== id))
        if (activeTab === 'authors') setAuthors(prev => prev.filter(i => i.id !== id))
        if (activeTab === 'collections') setCollections(prev => prev.filter(i => i.id !== id))
    }

    const handleReorder = (items: SortableItem[]) => {
        if (activeTab === 'poems') setPoems(items)
        if (activeTab === 'authors') setAuthors(items)
        if (activeTab === 'collections') setCollections(items)
    }

    const handleSaveCurrentContent = async () => {
        if (isNew) return
        setIsSavingContent(true)
        let res;
        if (activeTab === 'poems') {
            res = await saveCategoryPoems({ categoryId: initialCategory.id, categorySlug: initialCategory.slug, poemIds: poems.map(p => p.id) })
        } else if (activeTab === 'authors') {
            res = await saveCategoryAuthors({ categoryId: initialCategory.id, categorySlug: initialCategory.slug, authorIds: authors.map(a => a.id) })
        } else {
            res = await saveCategoryCollections({ categoryId: initialCategory.id, categorySlug: initialCategory.slug, collectionIds: collections.map(c => c.id) })
        }
        setIsSavingContent(false)
        if (res?.data?.success) {
            alert('Contenu sauvegardé avec succès.')
            router.refresh()
        } else {
            alert('Erreur : ' + (res?.data?.failure || '?'))
        }
    }

    // Search functions wrap 
    const handleSearchPoems = async (q: string) => {
        const res = await searchPoems({ query: q })
        if (res?.data?.success) {
            return res.data.data.map((p: any) => ({
                id: p.id,
                label: p.title,
                sublabel: p.authors?.map((a: any) => a.name).join(', '),
            }))
        }
        return []
    }

    const handleSearchAuthors = async (q: string) => {
        const res = await searchAuthors({ query: q })
        if (res?.data?.success) {
            return res.data.data.map((a: any) => ({
                id: a.id,
                label: a.name,
            }))
        }
        return []
    }

    const handleSearchCollections = async (q: string) => {
        const res = await searchCollections({ query: q })
        if (res?.data?.success) {
            return res.data.data.map((c: any) => ({
                id: c.id,
                label: c.title,
                sublabel: c.authors?.map((a: any) => a.name).join(', '),
            }))
        }
        return []
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/categories"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif font-semibold text-zinc-100">
                            {isNew ? 'Créer une catégorie' : initialCategory.name}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            {isNew ? 'Renseignez les informations de base.' : `Slug: /${initialCategory.slug}`}
                        </p>
                    </div>
                </div>
                {!isNew && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                        <Trash weight="bold" />
                        Supprimer
                    </button>
                )}
            </div>

            {/* General Info Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="mb-6 font-medium text-zinc-100 flex items-center gap-2">
                    <Tag className="text-purple-400" />
                    Informations générales
                </h2>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-400">Nom *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex: Romantisme"
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-400">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Une brève description..."
                                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-400">Couleur (Hex) *</label>
                            <div className="flex gap-2 items-center">
                                <div 
                                   className="h-10 w-10 shrink-0 rounded-lg border border-zinc-700"
                                   style={{ backgroundColor: color || 'transparent' }} 
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="#AABBCC"
                                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm uppercase text-zinc-100 outline-none transition-colors focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-400 flex items-center gap-2">
                                Ornement
                                <span title="Sélectionnez un fleuron typographique pour cette catégorie.">
                                    <Info className="text-zinc-500" />
                                </span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ORNAMENT_IDS.map((oid) => (
                                    <button
                                        key={oid}
                                        type="button"
                                        onClick={() => setOrnamentId(ornamentId === oid ? '' : oid)}
                                        className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 transition-all ${
                                            ornamentId === oid
                                                ? 'border-purple-500 bg-purple-500/10 text-purple-300 scale-110'
                                                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                                        }`}
                                    >
                                        <OrnamentIcon id={oid} className="h-8 w-8" />
                                    </button>
                                ))}
                                {ORNAMENT_IDS.length === 0 && (
                                    <p className="text-xs text-zinc-600">Aucun ornement disponible.</p>
                                )}
                            </div>
                            {ornamentId && (
                                <p className="mt-2 text-xs text-zinc-500 font-mono">ID: {ornamentId}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end pt-6 border-t border-zinc-800/50">
                    <button
                        onClick={handleSaveInfo}
                        disabled={isSavingInfo || !name || !color}
                        className="flex items-center gap-2 rounded-lg bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
                    >
                        {isSavingInfo ? <span className="animate-spin">◓</span> : <FloppyDisk weight="bold" size={18} />}
                        {isNew ? 'Créer la catégorie' : 'Sauvegarder les infos'}
                    </button>
                </div>
            </div>

            {/* Content Manager (Hidden if New) */}
            {!isNew && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex border-b border-zinc-800 bg-zinc-950/50 px-4 pt-4">
                        {(['poems', 'authors', 'collections'] as const).map(tabKey => (
                            <button
                                key={tabKey}
                                onClick={() => setActiveTab(tabKey)}
                                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                                    activeTab === tabKey 
                                    ? 'border-purple-400 text-purple-400 bg-purple-500/5 -mt-px rounded-t-lg'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                {tabKey === 'poems' && 'Poèmes'}
                                {tabKey === 'authors' && 'Auteurs'}
                                {tabKey === 'collections' && 'Recueils'}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        <div className="mb-6 flex gap-4 flex-col lg:flex-row items-center justify-between">
                            <p className="text-sm text-zinc-400 max-w-xl">
                                Recherchez et liez des entités, puis glissez-déposez-les pour définir l'ordre éditorial officiel de la catégorie.
                            </p>
                            <button
                                onClick={handleSaveCurrentContent}
                                disabled={isSavingContent}
                                className="flex shrink-0 w-full lg:w-auto items-center justify-center gap-2 rounded-lg bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
                            >
                                {isSavingContent ? <span className="animate-spin">◓</span> : <FloppyDisk weight="bold" size={18} />}
                                Sauvegarder l'ordre
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
                            {/* Sortable List Area */}
                            <div>
                                <SortableList 
                                    items={activeTab === 'poems' ? poems : activeTab === 'authors' ? authors : collections}
                                    onRemove={handleRemove}
                                    onReorder={handleReorder}
                                    emptyMessage={`Aucun(e) ${activeTab} lié(e) explicitement.`}
                                />
                            </div>

                            {/* Search and Attach Area */}
                            <div className="lg:border-l lg:border-zinc-800 lg:pl-8">
                                <h3 className="mb-4 text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <Plus className="text-zinc-500" />
                                    Ajouter
                                </h3>
                                <SearchSelect 
                                    placeholder="Commencez à taper..."
                                    onSearch={
                                        activeTab === 'poems' ? handleSearchPoems :
                                        activeTab === 'authors' ? handleSearchAuthors : handleSearchCollections
                                    }
                                    onSelect={handleAdd}
                                    excludeIds={(activeTab === 'poems' ? poems : activeTab === 'authors' ? authors : collections).map(i => i.id)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
