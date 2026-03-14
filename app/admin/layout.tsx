import type { Metadata } from 'next'
import Link from 'next/link'
import { House, PenNib, UsersThree, Books, Sun } from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
    title: 'Admin — ode.',
    robots: 'noindex, nofollow',
}

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: House },
    { href: '/admin/featured-poems', label: 'Poèmes', icon: PenNib },
    { href: '/admin/featured-authors', label: 'Auteurs', icon: UsersThree },
    { href: '/admin/featured-collections', label: 'Recueils', icon: Books },
    { href: '/admin/daily-poem', label: 'Poème du jour', icon: Sun },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-[100dvh] bg-zinc-950">
            {/* Sidebar */}
            <aside className="sticky top-0 flex h-[100dvh] w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
                {/* Logo */}
                <div className="flex h-16 items-center px-6 border-b border-zinc-800">
                    <Link href="/" className="text-lg font-serif font-semibold text-zinc-100 tracking-tight">
                        ode<span className="text-accent">.</span>
                    </Link>
                    <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        Admin
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
                                >
                                    <item.icon size={20} weight="duotone" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="border-t border-zinc-800 px-6 py-4">
                    <Link
                        href="/"
                        className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                        ← Retour au site
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-4xl px-8 py-10">
                    {children}
                </div>
            </main>
        </div>
    )
}
