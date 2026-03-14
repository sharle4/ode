import Link from 'next/link'
import { PenNib, UsersThree, Books, Sun, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { getFeaturedAuthors, getFeaturedCollections, getDailyPoem } from '@/utils/supabase/queries'

const sections = [
    {
        href: '/admin/featured-poems',
        label: 'Poèmes à la une',
        description: 'Sélectionnez et ordonnez les poèmes mis en avant sur la page d\'accueil.',
        icon: PenNib,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
    },
    {
        href: '/admin/featured-authors',
        label: 'Auteurs à la une',
        description: 'Choisissez quels auteurs apparaissent dans la section "Auteurs à la une".',
        icon: UsersThree,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
    },
    {
        href: '/admin/featured-collections',
        label: 'Recueils à la une',
        description: 'Gérez les recueils mis en avant et leur ordre d\'affichage.',
        icon: Books,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
    },
    {
        href: '/admin/daily-poem',
        label: 'Poème du jour',
        description: 'Définissez manuellement le poème du jour ou programmez-le à l\'avance.',
        icon: Sun,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
    },
]

export default async function AdminDashboard() {
    // Fetch current state for quick stats
    const [authorsResult, collectionsResult, dailyResult] = await Promise.allSettled([
        getFeaturedAuthors(),
        getFeaturedCollections(),
        getDailyPoem(),
    ])

    const featuredAuthorsCount = authorsResult.status === 'fulfilled' ? authorsResult.value.length : 0
    const featuredCollectionsCount = collectionsResult.status === 'fulfilled' ? collectionsResult.value.length : 0
    const dailyPoem = dailyResult.status === 'fulfilled' ? dailyResult.value : null

    return (
        <>
            <div className="mb-10">
                <h1 className="text-2xl font-serif font-semibold text-zinc-100">
                    Panneau d&apos;administration
                </h1>
                <p className="mt-1.5 text-sm text-zinc-400">
                    Gérez le contenu mis en avant sur la page d&apos;accueil d&apos;ode.
                </p>
            </div>

            {/* Quick stats */}
            <div className="mb-8 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Auteurs en avant</p>
                    <p className="mt-1 text-2xl font-semibold text-zinc-100">{featuredAuthorsCount}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Recueils en avant</p>
                    <p className="mt-1 text-2xl font-semibold text-zinc-100">{featuredCollectionsCount}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Poème du jour</p>
                    <p className="mt-1 text-sm font-medium text-zinc-100 truncate">
                        {dailyPoem?.title || <span className="text-zinc-500">Non défini</span>}
                    </p>
                </div>
            </div>

            {/* Section cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`rounded-lg ${section.bg} p-2.5`}>
                                <section.icon size={22} weight="duotone" className={section.color} />
                            </div>
                            <ArrowRight
                                size={18}
                                className="text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-zinc-400"
                            />
                        </div>
                        <div>
                            <h2 className="font-medium text-zinc-100">{section.label}</h2>
                            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{section.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    )
}
