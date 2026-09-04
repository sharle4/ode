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
  rothko_params?: import("@/types/generative").RothkoParams;
}

export interface BaseActivity {
  id: string;
  username: string;
  displayName: string;
  avatarGradient: string;
  initials: string;
  poemTitle: string;
  poemAuthors: { id: string; name: string; slug: string }[];
  timestamp: string;
  likes: number;
  comments: number;
}

export interface RatedActivity extends BaseActivity {
  action: "rated";
  review: number;
}

export interface ReviewedActivity extends BaseActivity {
  action: "reviewed";
  review: number;
  reviewText: string;
}

export interface LoggedActivity extends BaseActivity {
  action: "logged";
}

export interface AddedToListActivity extends BaseActivity {
  action: "added to list";
}

export type CommunityActivity =
  | RatedActivity
  | ReviewedActivity
  | LoggedActivity
  | AddedToListActivity;
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

export type CategoryType = 'THEME' | 'MOVEMENT' | 'ERA';

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  color?: string;
  ornament_id?: string;
  type: CategoryType;
  sort_order: number;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  date_of_birth?: string;
  date_of_death?: string;
  biography?: string;
  movement?: string[];
  nationality?: string;
}

export interface SearchResults {
  poems: any[];
  authors: Author[];
  collections: any[];
  categories: Category[];
  total: number;
}
