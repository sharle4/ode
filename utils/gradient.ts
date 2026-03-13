/**
 * Generates a deterministic Tailwind gradient class pair from a string seed (e.g., slug).
 * This replaces the hardcoded `coverColor` / `coverGradient` values that were previously
 * stored inline because they don't belong in the database.
 */

const GRADIENT_PALETTES = [
    'from-zinc-800 to-black',
    'from-indigo-900 to-zinc-900',
    'from-amber-900 to-zinc-900',
    'from-stone-700 to-zinc-900',
    'from-emerald-900 to-zinc-900',
    'from-red-900 to-zinc-900',
    'from-violet-900 to-zinc-900',
    'from-teal-900 to-zinc-900',
    'from-sky-900 to-zinc-900',
    'from-rose-900 to-zinc-900',
    'from-blue-950 to-zinc-900',
    'from-cyan-900 to-zinc-900',
    'from-stone-800 to-black',
    'from-slate-800 to-zinc-900',
    'from-orange-900 to-zinc-900',
    'from-fuchsia-900 to-zinc-900',
] as const;

const AVATAR_GRADIENTS = [
    'from-rose-400 to-amber-300',
    'from-emerald-400 to-teal-300',
    'from-violet-400 to-fuchsia-300',
    'from-sky-400 to-indigo-300',
    'from-lime-400 to-emerald-300',
    'from-orange-400 to-amber-300',
    'from-amber-400 to-yellow-300',
    'from-cyan-400 to-sky-300',
    'from-pink-400 to-rose-300',
    'from-blue-400 to-violet-300',
] as const;

const CATEGORY_COLORS: Record<string, string> = {
    'amour': 'from-rose-500 to-pink-600',
    'nature': 'from-emerald-500 to-teal-700',
    'spleen': 'from-slate-600 to-slate-900',
    'melancolie': 'from-blue-400 to-indigo-600',
    'temps': 'from-amber-600 to-orange-700',
    'mort': 'from-zinc-700 to-black',
    'romantisme': 'from-red-600 to-rose-900',
    'symbolisme': 'from-purple-500 to-indigo-800',
    'surrealisme': 'from-cyan-500 to-blue-700',
    'parnasse': 'from-emerald-600 to-cyan-900',
    'classicisme': 'from-yellow-600 to-amber-800',
};

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function getCoverGradient(seed: string): string {
    const index = hashString(seed) % GRADIENT_PALETTES.length;
    return GRADIENT_PALETTES[index];
}

export function getAvatarGradient(seed: string): string {
    const index = hashString(seed) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
}

export function getCategoryColor(slug: string): string {
    // Normalize: remove diacritics and lowercase
    const normalized = slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    return CATEGORY_COLORS[normalized] || getCoverGradient(slug);
}

export function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');
}

export function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
    return `il y a ${Math.floor(diffDays / 30)} mois`;
}

export function formatCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}
