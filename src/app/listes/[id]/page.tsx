import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ListInteractiveContent from '@/components/ListInteractiveContent'

export const dynamic = 'force-dynamic'

export default async function ListPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

  const { data: { user } } = await supabase.auth.getUser()
  const { data: list } = await supabase
    .from('lists')
    .select('*, profiles(username)')
    .eq('id', id)
    .single()

  if (!list || (!list.is_public && user?.id !== list.user_id)) {
    notFound()
  }

  const orderBy = list.is_ranked ? 'position' : 'added_at'

  const { data: listItems } = await supabase
    .from('list_items')
    .select('poems(*, authors(name))')
    .eq('list_id', id)
    .order(orderBy, { ascending: true, nulls: 'last' })
  
  const poems = listItems?.map(item => item.poems).filter(Boolean) || []

  return (
    <>
      <Header />
      <ListInteractiveContent
        initialList={list}
        initialPoems={poems as any}
        initialUser={user}
      />
    </>
  )
}