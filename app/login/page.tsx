import { login } from '../auth/actions'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
    const { error, message } = await searchParams

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-950">
            <div className="w-full max-w-sm p-8 space-y-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">ode.</h1>
                    <p className="text-zinc-400 text-sm">Sign in to your account</p>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="baudelaire@spleen.fr"
                            required
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-zinc-300" htmlFor="password">Password</label>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white transition-colors"
                        />
                    </div>

                    {error && <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
                    {message && <div className="text-sm text-green-500 bg-green-500/10 p-3 rounded-lg border border-green-500/20">{message}</div>}

                    <button
                        formAction={login}
                        className="w-full py-2 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all active:scale-[0.98]"
                    >
                        Log in
                    </button>
                </form>

                <div className="text-center text-sm text-zinc-500">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-white hover:underline underline-offset-4">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}
