'use client'

import { useState, useTransition } from 'react'
import { followUser, unfollowUser } from '@/app/actions'
import ReviewCard from './ReviewCard'
import ListCard from './ListCard'
import AvatarUploader from './AvatarUploader'
import { UserIcon } from '@heroicons/react/24/solid'
import type { User } from '@supabase/supabase-js'

interface ProfileData { id: string; username: string | null; avatar_url: string | null; }
interface StatsData { followers: number; following: number; reviewsCount: number; listsCount: number; }
interface ReviewData { rating: number | null; content: string | null; poems: any; }
interface ListData { id: number; name: string; description: string | null; is_public: boolean; poem_count: number; }

interface ProfileInteractiveContentProps {
  profile: ProfileData
  stats: StatsData
  isFollowing: boolean
  isOwnProfile: boolean
  reviews: ReviewData[]
  lists: ListData[]
  loggedInUser: User | null
}

export default function ProfileInteractiveContent({ profile, stats, isFollowing, isOwnProfile, reviews, lists, loggedInUser }: ProfileInteractiveContentProps) {
  const [isPending, startTransition] = useTransition()
  
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useState(isFollowing)
  const [optimisticFollowers, setOptimisticFollowers] = useState(stats.followers)

  const handleFollow = () => {
    setOptimisticIsFollowing(true)
    setOptimisticFollowers(count => count + 1)
    startTransition(() => {
      followUser(profile.id)
    })
  }

  const handleUnfollow = () => {
    setOptimisticIsFollowing(false)
    setOptimisticFollowers(count => count - 1)
    startTransition(() => {
      unfollowUser(profile.id)
    })
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header du Profil */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="flex-shrink-0">
          {isOwnProfile && loggedInUser ? (
            <AvatarUploader user={loggedInUser} initialAvatarUrl={profile.avatar_url} />
          ) : (
            profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username || ''} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-gray-500" />
              </div>
            )
          )}
        </div>
        <div className="flex-grow flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
          {!isOwnProfile && (
            optimisticIsFollowing ? (
              <button onClick={handleUnfollow} disabled={isPending} className="mt-2 sm:mt-0 w-full sm:w-auto bg-transparent border border-gray-400 text-gray-600 dark:border-gray-500 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm">
                Abonné
              </button>
            ) : (
              <button onClick={handleFollow} disabled={isPending} className="mt-2 sm:mt-0 w-full sm:w-auto bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 text-sm">
                S'abonner
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex items-center space-x-6 border-y border-gray-200 dark:border-gray-700 py-4 mb-12">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.reviewsCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Critiques</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.listsCount}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Listes</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{optimisticFollowers}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Abonnés</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.following}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Abonnements</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Dernières critiques</h2>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => <ReviewCard key={index} review={review as any} />)}
          </div>
        ) : <p className="text-gray-500 dark:text-gray-400">{profile.username} n'a pas encore écrit de critique.</p>}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Listes</h2>
        {lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lists.map((list) => <ListCard key={list.id} list={list} />)}
          </div>
        ) : <p className="text-gray-500 dark:text-gray-400">{profile.username} n'a pas encore créé de liste.</p>}
      </div>
    </main>
  )
}