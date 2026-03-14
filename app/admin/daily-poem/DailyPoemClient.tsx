'use client'

import { useState, useTransition, useCallback } from 'react'
import SearchSelect, { type SearchResult } from '@/components/admin/SearchSelect'
import { searchPoems, saveDailyPoem } from '@/app/actions/admin'
import { CalendarBlank, FloppyDisk, Check, Warning, Robot, UserCircle } from '@phosphor-icons/react'

interface DailyPoemEntry {
    date: string
    isManual: boolean
    id: string
    title: string
    slug: string
    authors: { id: string; name: string; slug: string }[]
}

interface DailyPoemClientProps {
    history: DailyPoemEntry[]
}

export default function DailyPoemClient({ history }: DailyPoemClientProps) {
    const today = new Date().toISOString().split('T')[0]
    const [selectedDate, setSelectedDate] = useState(today)
    const [selectedPoem, setSelectedPoem] = useState<SearchResult | null>(null)
    const [isPending, startTransition] = useTransition()
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const todayEntry = history.find(h => h.date === today)

    const handleSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
        const result = await searchPoems({ query })
        if (result?.data?.success && result.data.data) {
            return result.data.data.map((poem: any) => ({
                id: poem.id,
                label: poem.title,
                sublabel: poem.authors?.map((a: any) => a.name).join(', ') || undefined,
            }))
        }
        return []
    }, [])

    const handleSave = () => {
        if (!selectedPoem) return

        startTransition(async () => {
            setFeedback(null)
            const result = await saveDailyPoem({ date: selectedDate, poemId: selectedPoem.id })

            if (result?.data?.failure) {
                setFeedback({ type: 'error', message: result.data.failure })
            } else {
                setFeedback({ type: 'success', message: `Poème du jour défini pour le ${formatDateFR(selectedDate)}.` })
                setSelectedPoem(null)
            }
        })
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-serif font-semibold text-zinc-100">Poème du jour</h1>
                <p className="mt-1.5 text-sm text-zinc-400">
                    Définissez manuellement le poème du jour ou programmez-le à l&apos;avance.
                </p>
            </div>

            {/* Current daily poem */}
            {todayEntry && (
                <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Poème du jour — {formatDateFR(todayEntry.date)}
                        </span>
                        <SourceBadge isManual={todayEntry.isManual} />
                    </div>
                    <p className="text-lg font-serif font-medium text-zinc-100">{todayEntry.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                        {todayEntry.authors.map(a => a.name).join(', ')}
                    </p>
                </div>
            )}

            {/* Set new daily poem */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-sm font-medium text-zinc-300 mb-4">Définir un nouveau poème du jour</h2>

                {/* Date picker */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
                        <CalendarBlank size={14} />
                        Date cible
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/40"
                    />
                </div>

                {/* Search poem */}
                <div className="mb-4">
                    <label className="text-xs text-zinc-400 mb-1.5 block">Poème</label>
                    <SearchSelect
                        placeholder="Rechercher un poème…"
                        onSearch={handleSearch}
                        onSelect={setSelectedPoem}
                    />
                    {selectedPoem && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2">
                            <span className="text-sm text-zinc-100">{selectedPoem.label}</span>
                            {selectedPoem.sublabel && (
                                <span className="text-xs text-zinc-400">— {selectedPoem.sublabel}</span>
                            )}
                            <button
                                onClick={() => setSelectedPoem(null)}
                                className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
                            >
                                Retirer
                            </button>
                        </div>
                    )}
                </div>

                {/* Save */}
                <div className="flex items-center justify-between">
                    <div>
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
                        disabled={isPending || !selectedPoem}
                        className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <FloppyDisk size={18} weight="bold" />
                        {isPending ? 'Enregistrement…' : 'Définir'}
                    </button>
                </div>
            </div>

            {/* History */}
            <div className="mt-8">
                <h2 className="text-sm font-medium text-zinc-300 mb-4">Historique (7 derniers jours)</h2>
                {history.length === 0 ? (
                    <p className="text-sm text-zinc-500">Aucun historique disponible.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {history.map((entry) => (
                            <li
                                key={entry.date}
                                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs font-mono text-zinc-500 shrink-0">
                                        {formatDateFR(entry.date)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm text-zinc-100 truncate">{entry.title}</p>
                                        <p className="text-xs text-zinc-400 truncate">
                                            {entry.authors.map(a => a.name).join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <SourceBadge isManual={entry.isManual} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
}

function SourceBadge({ isManual }: { isManual: boolean }) {
    if (isManual) {
        return (
            <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent shrink-0">
                <UserCircle size={12} weight="bold" />
                Manuel
            </span>
        )
    }
    return (
        <span className="flex items-center gap-1 rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
            <Robot size={12} weight="bold" />
            Auto
        </span>
    )
}

function formatDateFR(dateStr: string): string {
    try {
        return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        })
    } catch {
        return dateStr
    }
}
