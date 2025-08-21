"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// --- Icônes ---
const SunIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
);
const MoonIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);
const UserIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const SearchIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
        setUsername(profile?.username || null);
      }
    };
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUser();
      else setUsername(null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length > 1) {
        setIsSearching(true);
        const { data } = await supabase.rpc('search_poems', { search_term: debouncedSearchQuery }).limit(5);
        setSearchResults(data || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };
    performSearch();
  }, [debouncedSearchQuery, supabase]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/recherche?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Ode</Link>
          
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            <div className="relative max-w-md w-full lg:max-w-lg">
              <form onSubmit={handleSearchSubmit}>
                <label htmlFor="search" className="sr-only">Rechercher</label>
                <div className="relative text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <SearchIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full bg-white dark:bg-gray-800 py-2 pl-10 pr-3 border border-gray-300 dark:border-gray-700 rounded-md leading-5 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Rechercher un poème, un auteur..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </form>
              {searchResults.length > 0 && (
                <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <ul>
                    {searchResults.map((result) => (
                      <li key={`${result.type}-${result.id}`}>
                        <Link 
                          href={result.type === 'author' ? `/profil/${result.title}` : `/poemes/${result.id}`}
                          className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setSearchQuery('')}
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">{result.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{result.type === 'author' ? 'Artiste' : `par ${result.author_name}`}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && username ? (
              <Link href={`/profil/${username}`} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <UserIcon className="h-6 w-6" />
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Connexion
              </Link>
            )}
            <button onClick={toggleTheme} aria-label="Changer de thème" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
              {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}