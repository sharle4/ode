'use client'

import { useState, useTransition } from 'react'
import { ArrowsClockwise, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { purgeAllPlatformCache } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'

export default function CacheSyncButton() {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const router = useRouter()

    const handleSync = () => {
        startTransition(async () => {
            setStatus('idle')
            setStatusMessage(null)
            try {
                const res = await purgeAllPlatformCache()
                if (res?.serverError) {
                    setStatus('error')
                    setStatusMessage(res.serverError)
                } else if (res?.data?.success) {
                    setStatus('success')
                    setStatusMessage('Cache purgé & synchronisé !')
                    router.refresh()
                    setTimeout(() => {
                        setStatus('idle')
                        setStatusMessage(null)
                    }, 4000)
                } else {
                    setStatus('error')
                    setStatusMessage('Impossible de purger le cache.')
                }
            } catch (err: any) {
                setStatus('error')
                setStatusMessage(err?.message || 'Erreur lors de la synchronisation.')
            }
        })
    }

    return (
        <div className="flex items-center gap-3">
            {status === 'success' && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 animate-fadeIn">
                    <CheckCircle size={15} weight="bold" />
                    {statusMessage}
                </span>
            )}
            {status === 'error' && (
                <span className="flex items-center gap-1.5 text-xs text-rose-400 animate-fadeIn">
                    <WarningCircle size={15} weight="bold" />
                    {statusMessage}
                </span>
            )}
            <button
                onClick={handleSync}
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Purger le cache et forcer la synchronisation avec la base Supabase"
            >
                <ArrowsClockwise
                    size={16}
                    weight="bold"
                    className={isPending ? 'animate-spin text-accent' : 'text-zinc-400'}
                />
                <span>{isPending ? 'Synchronisation…' : 'Synchroniser le cache'}</span>
            </button>
        </div>
    )
}
