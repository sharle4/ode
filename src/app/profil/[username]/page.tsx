import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ProfileInteractiveContent from '@/components/ProfileInteractiveContent'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { username } = params

  const { data: { user: loggedInUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const followersCountQuery = supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', profile.id)
  const followingCountQuery = supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id)
  const listsQuery = supabase.rpc('get_lists_with_poem_count', { profile_id_param: profile.id })
  const reviewsQuery = supabase.from('reviews').select('*, poems(*, authors(name))').eq('user_id', profile.id).order('created_at', { ascending: false })
  const reviewsCountQuery = supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', profile.id)
  
  const followingStatusQuery = loggedInUser 
    ? supabase.from('followers').select().eq('follower_id', loggedInUser.id).eq('following_id', profile.id)
    : Promise.resolve({ data: [] })

  const [
    { count: followersCount },
    { count: followingCount },
    { data: followingStatus },
    { data: listsData },
    { data: reviews },
    { count: reviewsCount }
  ] = await Promise.all([
    followersCountQuery,
    followingCountQuery,
    followingStatusQuery,
    listsQuery,
    reviewsQuery,
    reviewsCountQuery
  ])

  const isOwnProfile = loggedInUser?.id === profile.id
  const isFollowing = followingStatus ? followingStatus.length > 0 : false
  const lists = isOwnProfile ? listsData : listsData?.filter(list => list.is_public)

  return (
    <>
      <Header />
      <ProfileInteractiveContent
        profile={profile}
        stats={{ 
          followers: followersCount || 0, 
          following: followingCount || 0,
          reviewsCount: reviewsCount || 0,
          listsCount: lists?.length || 0,
        }}
        isFollowing={isFollowing}
        isOwnProfile={isOwnProfile}
        reviews={reviews || []}
        lists={lists || []}
        loggedInUser={loggedInUser}
      />
    </>
  )
}