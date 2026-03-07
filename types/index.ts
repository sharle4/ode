export interface Poem {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  originalLanguage: string;
  coverGradient: string;
  averageReview: number;
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
  review?: number;
  reviewText?: string;
  timestamp: string;
  likes: number;
  comments: number;
}
