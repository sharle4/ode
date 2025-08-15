'use client'
import { useState } from 'react'
import AuthForm from '@/components/AuthForm'
import Header from '@/components/Header'

export default function LoginPage() {
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            {view === 'sign_in' ? 'Connexion' : 'Inscription'}
          </h1>
          <div className="bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <AuthForm view={view} />
          </div>
          {view === 'sign_in' ? (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Pas encore membre ?{' '}
              <button 
                onClick={() => setView('sign_up')} 
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
              >
                Inscrivez-vous
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Déjà membre ?{' '}
              <button 
                onClick={() => setView('sign_in')} 
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
              >
                Connectez-vous
              </button>
            </p>
          )}
        </div>
      </main>
    </>
  )
}
