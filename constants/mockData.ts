import type { Poem, CommunityActivity } from "@/types";

export const poems: Poem[] = [
  {
    id: "poem-001",
    title: "Tonight I Can Write",
    originalTitle: "Poema 20",
    author: "Pablo Neruda",
    originalLanguage: "Spanish",
    coverGradient: "from-stone-800 via-stone-700 to-amber-900/40",
    averageRating: 4.7,
    totalLogs: 12847,
    snippet: {
      original:
        "Puedo escribir los versos mas tristes esta noche.\nEscribir, por ejemplo: La noche esta estrellada,\ny tiritan, azules, los astros, a lo lejos.",
      translation:
        "Tonight I can write the saddest lines.\nWrite, for example: The night is starry,\nand the blue stars shiver in the distance.",
    },
  },
  {
    id: "poem-002",
    title: "Invitation to the Voyage",
    originalTitle: "L'Invitation au voyage",
    author: "Charles Baudelaire",
    originalLanguage: "French",
    coverGradient: "from-zinc-900 via-slate-800 to-rose-900/30",
    averageRating: 4.5,
    totalLogs: 9432,
    snippet: {
      original:
        "Mon enfant, ma soeur,\nSonge a la douceur\nD'aller la-bas vivre ensemble!",
      translation:
        "My child, my sister,\nThink of the sweetness\nOf going there to live together!",
    },
  },
  {
    id: "poem-003",
    title: "The Old Pond",
    originalTitle: "Furu ike ya",
    author: "Matsuo Basho",
    originalLanguage: "Japanese",
    coverGradient: "from-emerald-950 via-slate-800 to-stone-900",
    averageRating: 4.8,
    totalLogs: 15203,
    snippet: {
      original: "Furu ike ya\nkawazu tobikomu\nmizu no oto",
      translation: "An old silent pond\nA frog jumps into the pond\nSplash! Silence again",
    },
  },
  {
    id: "poem-004",
    title: "Because I could not stop for Death",
    author: "Emily Dickinson",
    originalLanguage: "English",
    coverGradient: "from-slate-900 via-zinc-800 to-neutral-700",
    averageRating: 4.6,
    totalLogs: 11876,
    snippet: {
      original:
        "Because I could not stop for Death --\nHe kindly stopped for me --\nThe Carriage held but just Ourselves --\nAnd Immortality.",
      translation:
        "Because I could not stop for Death --\nHe kindly stopped for me --\nThe Carriage held but just Ourselves --\nAnd Immortality.",
    },
  },
  {
    id: "poem-005",
    title: "The Guest House",
    originalTitle: "Mihman-khaneh",
    author: "Jalal al-Din Rumi",
    originalLanguage: "Persian",
    coverGradient: "from-amber-950 via-orange-900/60 to-stone-900",
    averageRating: 4.9,
    totalLogs: 18492,
    snippet: {
      original:
        "Har ruz sahar mihmani tazeh miresad.\nShadi, depress, badkhaahi.",
      translation:
        "Every morning a new arrival.\nA joy, a depression, a meanness.",
    },
  },
  {
    id: "poem-006",
    title: "Lady Lazarus",
    author: "Sylvia Plath",
    originalLanguage: "English",
    coverGradient: "from-red-950/80 via-zinc-900 to-slate-800",
    averageRating: 4.4,
    totalLogs: 8765,
    snippet: {
      original:
        "I have done it again.\nOne year in every ten\nI manage it --",
      translation:
        "I have done it again.\nOne year in every ten\nI manage it --",
    },
  },
  {
    id: "poem-007",
    title: "The Drunken Boat",
    originalTitle: "Le Bateau ivre",
    author: "Arthur Rimbaud",
    originalLanguage: "French",
    coverGradient: "from-blue-950/70 via-slate-800 to-zinc-900",
    averageRating: 4.3,
    totalLogs: 7298,
    snippet: {
      original:
        "Comme je descendais des Fleuves impassibles,\nJe ne me sentis plus guide par les haleurs.",
      translation:
        "As I descended impassive Rivers,\nI felt no longer guided by the haulers.",
    },
  },
  {
    id: "poem-008",
    title: "The Second Coming",
    author: "W.B. Yeats",
    originalLanguage: "English",
    coverGradient: "from-stone-900 via-neutral-800 to-zinc-800",
    averageRating: 4.7,
    totalLogs: 13456,
    snippet: {
      original:
        "Turning and turning in the widening gyre\nThe falcon cannot hear the falconer;\nThings fall apart; the centre cannot hold.",
      translation:
        "Turning and turning in the widening gyre\nThe falcon cannot hear the falconer;\nThings fall apart; the centre cannot hold.",
    },
  },
  {
    id: "poem-009",
    title: "Quiet Night Thought",
    originalTitle: "Jing Ye Si",
    author: "Li Bai",
    originalLanguage: "Chinese",
    coverGradient: "from-indigo-950/60 via-slate-900 to-stone-800",
    averageRating: 4.6,
    totalLogs: 10234,
    snippet: {
      original:
        "Chuang qian ming yue guang,\nYi shi di shang shuang.\nJu tou wang ming yue,\nDi tou si gu xiang.",
      translation:
        "Bright moonlight before my bed,\nI suspect it is frost on the ground.\nI raise my head to gaze at the bright moon,\nThen lower it, thinking of home.",
    },
  },
  {
    id: "poem-010",
    title: "Fragment 31",
    author: "Sappho",
    originalLanguage: "Ancient Greek",
    coverGradient: "from-rose-950/50 via-stone-800 to-zinc-900",
    averageRating: 4.5,
    totalLogs: 6543,
    snippet: {
      original:
        "Phainetai moi kenos isos theoisin\nemmen oner, ottis enantios toi\nisdanei.",
      translation:
        "He seems to me equal to the gods,\nthat man who sits across from you\nand listens.",
    },
  },
  {
    id: "poem-011",
    title: "Sleepwalking Ballad",
    originalTitle: "Romance sonambulo",
    author: "Federico Garcia Lorca",
    originalLanguage: "Spanish",
    coverGradient: "from-emerald-950/50 via-zinc-900 to-slate-800",
    averageRating: 4.8,
    totalLogs: 9871,
    snippet: {
      original:
        "Verde que te quiero verde.\nVerde viento. Verdes ramas.\nEl barco sobre la mar\ny el caballo en la montana.",
      translation:
        "Green, how I want you green.\nGreen wind. Green branches.\nThe ship upon the sea\nand the horse on the mountain.",
    },
  },
  {
    id: "poem-012",
    title: "Song of Myself",
    author: "Walt Whitman",
    originalLanguage: "English",
    coverGradient: "from-teal-950/40 via-stone-900 to-neutral-800",
    averageRating: 4.4,
    totalLogs: 14532,
    snippet: {
      original:
        "I celebrate myself, and sing myself,\nAnd what I assume you shall assume,\nFor every atom belonging to me as good belongs to you.",
      translation:
        "I celebrate myself, and sing myself,\nAnd what I assume you shall assume,\nFor every atom belonging to me as good belongs to you.",
    },
  },
  {
    id: "poem-013",
    title: "Ode to a Nightingale",
    author: "John Keats",
    originalLanguage: "English",
    coverGradient: "from-violet-950/40 via-slate-900 to-zinc-800",
    averageRating: 4.6,
    totalLogs: 11298,
    snippet: {
      original:
        "My heart aches, and a drowsy numbness pains\nMy sense, as though of hemlock I had drunk.",
      translation:
        "My heart aches, and a drowsy numbness pains\nMy sense, as though of hemlock I had drunk.",
    },
  },
  {
    id: "poem-014",
    title: "Requiem",
    originalTitle: "Rekviem",
    author: "Anna Akhmatova",
    originalLanguage: "Russian",
    coverGradient: "from-sky-950/40 via-zinc-900 to-stone-800",
    averageRating: 4.7,
    totalLogs: 7654,
    snippet: {
      original:
        "Net, i ne pod chuzhim nebesvodom,\nI ne pod zashchitoi chuzhikh kryl,--\nYa byla togda s moim narodom,\nTam, gde moi narod, k neschastyu, byl.",
      translation:
        "No, not under an alien sky,\nNot sheltered by alien wings --\nI was with my people then,\nThere, where my people, unhappily, were.",
    },
  },
  {
    id: "poem-015",
    title: "Tobacco Shop",
    originalTitle: "Tabacaria",
    author: "Fernando Pessoa",
    originalLanguage: "Portuguese",
    coverGradient: "from-yellow-950/30 via-stone-900 to-slate-800",
    averageRating: 4.3,
    totalLogs: 5432,
    snippet: {
      original:
        "Nao sou nada.\nNunca serei nada.\nNao posso querer ser nada.\nA parte isso, tenho em mim todos os sonhos do mundo.",
      translation:
        "I am nothing.\nI shall never be anything.\nI cannot wish to be anything.\nAside from that, I have within me all the dreams of the world.",
    },
  },
];

export const communityActivities: CommunityActivity[] = [
  {
    id: "activity-001",
    username: "versecollector",
    displayName: "Marguerite Lefebvre",
    avatarGradient: "from-rose-400 to-amber-300",
    initials: "ML",
    action: "reviewed",
    poemTitle: "The Second Coming",
    poemAuthor: "W.B. Yeats",
    rating: 4.5,
    reviewText:
      "A mesmerizing descent into fragmentation. Yeats captures the collapse of civilization with imagery so precise it brands itself into your memory. The falcon metaphor alone carries the weight of an entire philosophy.",
    timestamp: "2h ago",
    likes: 47,
    comments: 12,
  },
  {
    id: "activity-002",
    username: "haiku_wanderer",
    displayName: "Kenji Takahashi",
    avatarGradient: "from-emerald-400 to-teal-300",
    initials: "KT",
    action: "logged",
    poemTitle: "The Old Pond",
    poemAuthor: "Matsuo Basho",
    timestamp: "3h ago",
    likes: 23,
    comments: 4,
  },
  {
    id: "activity-003",
    username: "ink_and_ash",
    displayName: "Soraya Delgado",
    avatarGradient: "from-violet-400 to-fuchsia-300",
    initials: "SD",
    action: "reviewed",
    poemTitle: "Lady Lazarus",
    poemAuthor: "Sylvia Plath",
    rating: 5,
    reviewText:
      "Plath writes with a ferocity that makes you feel the heat of the oven. Every stanza is a controlled explosion. This is not poetry -- it is a reckoning.",
    timestamp: "4h ago",
    likes: 89,
    comments: 31,
  },
  {
    id: "activity-004",
    username: "moonlit_pages",
    displayName: "Eleni Papadimitriou",
    avatarGradient: "from-sky-400 to-indigo-300",
    initials: "EP",
    action: "added to list",
    poemTitle: "Fragment 31",
    poemAuthor: "Sappho",
    timestamp: "5h ago",
    likes: 15,
    comments: 2,
  },
  {
    id: "activity-005",
    username: "flordelorca",
    displayName: "Camilo Ruiz-Herrera",
    avatarGradient: "from-lime-400 to-emerald-300",
    initials: "CR",
    action: "reviewed",
    poemTitle: "Sleepwalking Ballad",
    poemAuthor: "Federico Garcia Lorca",
    rating: 4,
    reviewText:
      "Green pervades everything. Lorca paints with a single word and builds an entire dreamscape around it. The repetition is hypnotic, each verse pulling you deeper into a trance that never fully releases.",
    timestamp: "6h ago",
    likes: 56,
    comments: 18,
  },
  {
    id: "activity-006",
    username: "baudelaire_nocturne",
    displayName: "Ines Caron",
    avatarGradient: "from-orange-400 to-amber-300",
    initials: "IC",
    action: "rated",
    poemTitle: "Invitation to the Voyage",
    poemAuthor: "Charles Baudelaire",
    rating: 4.5,
    timestamp: "7h ago",
    likes: 34,
    comments: 8,
  },
  {
    id: "activity-007",
    username: "silkroad_verses",
    displayName: "Dara Khorasani",
    avatarGradient: "from-amber-400 to-yellow-300",
    initials: "DK",
    action: "reviewed",
    poemTitle: "The Guest House",
    poemAuthor: "Jalal al-Din Rumi",
    rating: 5,
    reviewText:
      "Rumi distills centuries of Sufi wisdom into a single metaphor. The guest house is not just a poem -- it is a practice. I return to it weekly and each reading peels back a new layer of meaning.",
    timestamp: "9h ago",
    likes: 112,
    comments: 42,
  },
  {
    id: "activity-008",
    username: "atlantic_quill",
    displayName: "Rafael Mendes-Costa",
    avatarGradient: "from-cyan-400 to-sky-300",
    initials: "RM",
    action: "reviewed",
    poemTitle: "Tobacco Shop",
    poemAuthor: "Fernando Pessoa",
    rating: 4.5,
    reviewText:
      "Pessoa stares into the void and the void hands him a cigarette. The opening lines are among the most devastatingly honest in all of literature. A monument to existential clarity.",
    timestamp: "11h ago",
    likes: 68,
    comments: 22,
  },
];

export const spotlightPoem = poems[0];

export const trendingPoems = poems.slice(0, 8);
export const curatedHaikus = [poems[2], poems[8], poems[9], poems[3], poems[4], poems[14], poems[12]];
