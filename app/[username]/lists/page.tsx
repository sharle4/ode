import { redirect } from "next/navigation";

interface ListsDirectoryPageProps {
    params: Promise<{ username: string }>;
}

export default async function ListsDirectoryPage({ params }: ListsDirectoryPageProps) {
    const { username } = await params;
    redirect(`/profile/${encodeURIComponent(username)}?tab=lists`);
}
