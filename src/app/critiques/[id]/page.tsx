import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ReviewPageContent from '@/components/ReviewPageContent'

export const dynamic = 'force-dynamic'

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params
  const { data: { user } } = await supabase.auth.getUser()

  const { data: pageData } = await supabase
    .rpc('get_review_details', {
      review_id_param: parseInt(id),
      user_id_param: user?.id,
    })
    .single()

  if (!pageData || !pageData.review_data || !pageData.poem_data) {
    notFound()
  }

  const { poem_data: poem } = pageData

  const [
    { data: stats },
    { data: distribution },
    { data: userLists }
  ] = await Promise.all([
    supabase.rpc('get_poem_stats', { poem_id_param: poem.id }).single(),
    supabase.rpc('get_poem_rating_distribution', { poem_id_param: poem.id }),
    supabase.rpc('get_user_lists_for_poem', { poem_id_param: poem.id })
  ])

  const fullPageData = { ...pageData, stats, distribution, userLists }

  return (
    <>
      <Header />
      <ReviewPageContent initialData={fullPageData} user={user} />
    </>
  )
}