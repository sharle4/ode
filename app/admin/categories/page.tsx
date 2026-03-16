import Link from 'next/link'
import { getCategories } from '@/utils/supabase/queries'
import { Plus, Tag } from '@phosphor-icons/react/dist/ssr'

export default async function CategoriesAdminPage() {
    const categories = await getCategories()

    return (
        <>
            <div className="mb-10 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-semibold text-zinc-100 flex items-center gap-2">
                        <Tag weight="duotone" className="text-purple-400" />
                        Catégories
                    </h1>
                    <p className="mt-1.5 text-sm text-zinc-400">
                        Gérez les catégories éditoriales et leurs contenus associés.
                    </p>
                </div>
                <Link
                    href={'/admin/categories/new'}
                    className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
                >
                    <Plus weight="bold" />
                    Créer
                </Link>
            </div>

            {categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
                    <p className="text-sm text-zinc-500">Aucune catégorie existante.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat: any) => (
                        <Link
                            key={cat.id}
                            href={`/admin/categories/${cat.id}`}
                            className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                        >
                            <div>
                                <div className="mb-3 flex items-center gap-3">
                                    <div 
                                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950"
                                      style={cat.color ? { borderColor: `${cat.color}40`, color: cat.color } : {}}
                                    >
                                        <Tag size={20} weight="duotone" />
                                    </div>
                                    <h2 className="font-medium text-zinc-100 group-hover:text-purple-400 transition-colors truncate">
                                        {cat.name}
                                    </h2>
                                </div>
                                <p className="text-xs text-zinc-400 line-clamp-2">
                                    {cat.description || "Aucune description"}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                                <span className="text-xs font-mono text-zinc-500">/{cat.slug || cat.id.split('-')[0]}</span>
                                <span className="text-xs font-semibold text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">Éditer &rarr;</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    )
}
