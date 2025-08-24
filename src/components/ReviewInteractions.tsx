'use client'

import { useState, useTransition } from 'react'
import { likeReview, unlikeReview } from '@/app/actions'
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid'
import { HeartIcon as OutlineHeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ReviewInteractionsProps {
  reviewId: number
  initialLikesCount: number
  initialCommentsCount: number
  isLikedByUser: boolean
  isLoggedIn: boolean
}

export default function ReviewInteractions({ reviewId, initialLikesCount, initialCommentsCount, isLikedByUser, isLoggedIn }: ReviewInteractionsProps) {
  const [isPending, startTransition] = useTransition()
  
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(isLikedByUser)
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(initialLikesCount)

  const handleLike = () => {
    if (!isLoggedIn) return
    
    if (optimisticIsLiked) {
      setOptimisticIsLiked(false)
      setOptimisticLikesCount(count => count - 1)
      startTransition(() => { unlikeReview(reviewId) })
    } else {
      setOptimisticIsLiked(true)
      setOptimisticLikesCount(count => count + 1)
      startTransition(() => { likeReview(reviewId) })
    }
  }

  return (
    <div className="flex items-center space-x-4 mt-3">
      <button 
        onClick={handleLike} 
        disabled={isPending || !isLoggedIn}
        className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50"
      >
        {optimisticIsLiked ? (
          <SolidHeartIcon className="w-5 h-5 text-red-500" />
        ) : (
          <OutlineHeartIcon className="w-5 h-5" />
        )}
        <span>{optimisticLikesCount}</span>
      </button>
      <Link href={`/critiques/${reviewId}`} className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
        <ChatBubbleOvalLeftIcon className="w-5 h-5" />
        <span>{initialCommentsCount}</span>
      </Link>
    </div>
  )
}