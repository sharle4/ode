import CategoryPage from '../[id]/page'

export default function NewCategoryPage() {
    return <CategoryPage params={Promise.resolve({ id: 'new' })} />
}
