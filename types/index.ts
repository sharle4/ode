export interface Poem {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  originalLanguage: string;
  coverGradient: string;
  averageRating: number;
  totalLogs: number;
  snippet: {
    original: string;
    translation: string;
  };
}

export interface CommunityActivity {
  id: string;
  username: string;
  displayName: string;
  avatarGradient: string;
  initials: string;
  action: "logged" | "rated" | "added to list" | "reviewed";
  poemTitle: string;
  poemAuthor: string;
  rating?: number;
  reviewText?: string;
  timestamp: string;
  likes: number;
  comments: number;
}
