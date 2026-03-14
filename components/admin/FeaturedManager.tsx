'use client'

import { useState, useTransition, useCallback } from 'react'
import SearchSelect, { type SearchResult } from '@/components/admin/SearchSelect'
import SortableList, { type SortableItem } from '@/components/admin/SortableList'
import { FloppyDisk, Check, Warning } from '@phosphor-icons/react'

interface FeaturedManagerProps {
    title: string
    description: string
    initialItems: SortableItem[]
    searchPlaceholder: string
    onSearch: (query: string) => Promise<SearchResult[]>
    onSave: (ids: string[]) => Promise<{ success?: boolean; failure?: string }>
    emptyMessage?: string
}

export default function FeaturedManager({
    title,
    description,
    initialItems,
    searchPlaceholder,
    onSearch,
    onSave,
    emptyMessage,
}: FeaturedManagerProps) {
    const [items, setItems] = useState<SortableItem[]>(initialItems)
    const [isPending, startTransition] = useTransition()
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    const handleSelect = useCallback((result: SearchResult) => {
        setItems(prev => {
            if (prev.some(i => i.id === result.id)) return prev
            return [...prev, { id: result.id, label: result.label, sublabel: result.sublabel }]
        })
        setHasChanges(true)
        setFeedback(null)
    }, [])

    const handleReorder = useCallback((newItems: SortableItem[]) => {
        setItems(newItems)
        setHasChanges(true)
        setFeedback(null)
    }, [])

    const handleRemove = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
        setHasChanges(true)
        setFeedback(null)
    }, [])

    const handleSave = () => {
        startTransition(async () => {
            setFeedback(null)
            const ids = items.map(i => i.id)
            const result = await onSave(ids)

            if (result.failure) {
                setFeedback({ type: 'error', message: result.failure })
            } else {
                setFeedback({ type: 'success', message: 'Modifications enregistrées avec succès.' })
                setHasChanges(false)
            }
        })
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-serif font-semibold text-zinc-100">{title}</h1>
                <p className="mt-1.5 text-sm text-zinc-400">{description}</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <SearchSelect
                    placeholder={searchPlaceholder}
                    onSearch={onSearch}
                    onSelect={handleSelect}
                    excludeIds={items.map(i => i.id)}
                />
            </div>

            {/* Sortable list */}
            <SortableList
                items={items}
                onReorder={handleReorder}
                onRemove={handleRemove}
                emptyMessage={emptyMessage}
            />

            {/* Save bar */}
            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {feedback?.type === 'success' && (
                        <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                            <Check size={16} weight="bold" />
                            {feedback.message}
                        </span>
                    )}
                    {feedback?.type === 'error' && (
                        <span className="flex items-center gap-1.5 text-sm text-red-400">
                            <Warning size={16} weight="bold" />
                            {feedback.message}
                        </span>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    disabled={isPending || !hasChanges}
                    className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <FloppyDisk size={18} weight="bold" />
                    {isPending ? 'Enregistrement…' : 'Sauvegarder'}
                </button>
            </div>

            {hasChanges && !feedback && (
                <p className="mt-3 text-xs text-zinc-500 italic">
                    Vous avez des modifications non enregistrées.
                </p>
            )}
        </>
    )
}
