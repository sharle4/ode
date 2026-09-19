import CategoryPage from '../[id]/page'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function NewCategoryPage() {
    return <CategoryPage params={Promise.resolve({ id: 'new' })} />
}
