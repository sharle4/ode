import AuthForm from '@/components/AuthForm'
import Header from '@/components/Header'

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">Connexion / Inscription</h1>
          <AuthForm />
        </div>
      </main>
    </>
  )
}