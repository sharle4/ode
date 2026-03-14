'use client';

import { MagnifyingGlass } from '@phosphor-icons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ExploreSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams?.get('q') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
        } else {
            router.push(`/explore`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative max-w-2xl w-full">
            <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-white overflow-hidden border border-soft-border transition-shadow">
                <div className="grid place-items-center h-full w-14 text-warm-gray">
                    <MagnifyingGlass size={24} />
                </div>
                <input
                    className="peer h-full w-full outline-none text-lg text-charcoal pr-4 bg-transparent font-sans"
                    type="text"
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Chercher auteurs, recueils, poèmes..."
                />
            </div>
        </form>
    );
}
