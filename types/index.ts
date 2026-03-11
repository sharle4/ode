export interface Poem {
  id: string;
  title: string;
  originalTitle?: string;
  authors: { id: string; name: string; slug: string }[];
  originalLanguage: string;
  coverGradient: string;
  averageReview: number;
  totalLogs: number;
  snippet: {
    original: string;
    translation: string;
  };
  average_review?: number;
  reviews_count?: number;
}

export interface CommunityActivity {
  id: string;
  username: string;
  displayName: string;
  avatarGradient: string;
  initials: string;
  action: "logged" | "rated" | "added to list" | "reviewed";
  poemTitle: string;
  poemAuthors: { id: string; name: string; slug: string }[];
  review?: number;
  reviewText?: string;
  timestamp: string;
  likes: number;
  comments: number;
}
export interface Collection {
  id: string;
  title: string;
  slug: string;
  publication_year?: number;
  summary?: string;
  cover_url?: string;
  poems_count: number;
  average_review?: number;
  reviews_count?: number;
}
