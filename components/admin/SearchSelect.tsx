'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { MagnifyingGlass, Spinner, X } from '@phosphor-icons/react'

export interface SearchResult {
    id: string
    label: string
    sublabel?: string
}

interface SearchSelectProps {
    placeholder?: string
    onSearch: (query: string) => Promise<SearchResult[]>
    onSelect: (item: SearchResult) => void
    excludeIds?: string[]
}

export default function SearchSelect({ placeholder = 'Rechercher…', onSearch, onSelect, excludeIds = [] }: SearchSelectProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const debouncedSearch = useDebouncedCallback(async (q: string) => {
        if (q.length < 1) {
            setResults([])
            setIsOpen(false)
            return
        }
        setIsLoading(true)
        try {
            const data = await onSearch(q)
            const filtered = data.filter(item => !excludeIds.includes(item.id))
            setResults(filtered)
            setIsOpen(filtered.length > 0)
        } catch {
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }, 300)

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
        debouncedSearch(value)
    }, [debouncedSearch])

    const handleSelect = useCallback((item: SearchResult) => {
        onSelect(item)
        setQuery('')
        setResults([])
        setIsOpen(false)
    }, [onSelect])

    // Close dropdown on outside click
    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [])

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <MagnifyingGlass
                    weight="bold"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray"
                    size={18}
                />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-soft-border bg-paper py-2.5 pl-10 pr-10 text-sm text-charcoal placeholder:text-warm-gray/50 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/40"
                />
                {isLoading && (
                    <Spinner
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-warm-gray"
                        size={18}
                    />
                )}
                {query && !isLoading && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-soft-border bg-paper shadow-xl">
                    {results.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => handleSelect(item)}
                                className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-cream"
                            >
                                <span className="text-sm font-medium text-charcoal">{item.label}</span>
                                {item.sublabel && (
                                    <span className="text-xs text-warm-gray">{item.sublabel}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
