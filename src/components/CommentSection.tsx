'use client'

import { useState, useTransition } from 'react'
import { addCommentToReview } from '@/app/actions'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { UserIcon } from '@heroicons/react/24/solid'

interface Comment {
  id: number
  content: string
  created_at: string
  profiles: {
    username: string | null
    avatar_url: string | null
  } | null
}

interface CommentSectionProps {
  reviewId: number
  initialComments: Comment[]
  user: User | null
}

export default function CommentSection({ reviewId, initialComments, user }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newComment.trim() === '') return

    startTransition(async () => {
      const result = await addCommentToReview(reviewId, newComment.trim())
      if (!result.error) {
        setNewComment('')
      } else {
        alert(result.error)
      }
    })
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Commentaires ({comments.length})
      </h2>

      {/* Liste des commentaires */}
      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="flex space-x-4">
            <Link href={`/profil/${comment.profiles?.username}`} className="flex-shrink-0">
              {comment.profiles?.avatar_url ? (
                <img src={comment.profiles.avatar_url} alt={comment.profiles.username || ''} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                </div>
              )}
            </Link>
            <div className="flex-grow">
              <div className="flex items-baseline space-x-2">
                <Link href={`/profil/${comment.profiles?.username}`}>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 hover:underline">
                    {comment.profiles?.username}
                  </p>
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(comment.created_at)}
                </p>
              </div>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez votre commentaire..."
            className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isPending}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isPending || newComment.trim() === ''}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isPending ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-8">
          <Link href="/login" className="underline">Connectez-vous</Link> pour laisser un commentaire.
        </p>
      )}
    </div>
  )
}