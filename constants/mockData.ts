import type { Poem, CommunityActivity } from "@/types";

export const poems: Poem[] = [
  {
    id: "poem-001",
    title: "Tonight I Can Write",
    originalTitle: "Poema 20",
    author: "Pablo Neruda",
    originalLanguage: "Espagnol",
    coverGradient: "from-stone-800 via-stone-700 to-amber-900/40",
    averageReview: 4.7,
    totalLogs: 12847,
    snippet: {
      original:
        "Puedo escribir los versos mas tristes esta noche.\nEscribir, por ejemplo: La noche esta estrellada,\ny tiritan, azules, los astros, a lo lejos.",
      translation:
        "Ce soir, je peux écrire les vers les plus tristes.\nÉcrire, par exemple : La nuit est étoilée,\net les étoiles bleues frissonnent au loin.",
    },
  },
  {
    id: "poem-002",
    title: "Invitation to the Voyage",
    originalTitle: "L'Invitation au voyage",
    author: "Charles Baudelaire",
    originalLanguage: "Français",
    coverGradient: "from-zinc-900 via-slate-800 to-rose-900/30",
    averageReview: 4.5,
    totalLogs: 9432,
    snippet: {
      original:
        "Mon enfant, ma soeur,\nSonge a la douceur\nD'aller la-bas vivre ensemble!",
      translation:
        "Mon enfant, ma sœur,\nSonge à la douceur\nD'aller là-bas vivre ensemble !",
    },
  },
  {
    id: "poem-003",
    title: "The Old Pond",
    originalTitle: "Furu ike ya",
    author: "Matsuo Basho",
    originalLanguage: "Japonais",
    coverGradient: "from-emerald-950 via-slate-800 to-stone-900",
    averageReview: 4.8,
    totalLogs: 15203,
    snippet: {
      original: "Furu ike ya\nkawazu tobikomu\nmizu no oto",
      translation: "Un vieil étang silencieux\nUne grenouille y plonge\nPlouf ! De nouveau le silence",
    },
  },
  {
    id: "poem-004",
    title: "Because I could not stop for Death",
    author: "Emily Dickinson",
    originalLanguage: "Anglais",
    coverGradient: "from-slate-900 via-zinc-800 to-neutral-700",
    averageReview: 4.6,
    totalLogs: 11876,
    snippet: {
      original:
        "Because I could not stop for Death --\nHe kindly stopped for me --\nThe Carriage held but just Ourselves --\nAnd Immortality.",
      translation:
        "Parce que je ne pouvais m'arrêter pour la Mort --\nElle s'est gentiment arrêtée pour moi --\nLa diligence ne contenait que Nous --\nEt l'Immortalité.",
    },
  },
  {
    id: "poem-005",
    title: "The Guest House",
    originalTitle: "Mihman-khaneh",
    author: "Jalal al-Din Rumi",
    originalLanguage: "Persan",
    coverGradient: "from-amber-950 via-orange-900/60 to-stone-900",
    averageReview: 4.9,
    totalLogs: 18492,
    snippet: {
      original:
        "Har ruz sahar mihmani tazeh miresad.\nShadi, depress, badkhaahi.",
      translation:
        "Chaque matin un nouvel arrivant.\nUne joie, une dépression, une mesquinerie.",
    },
  },
  {
    id: "poem-006",
    title: "Lady Lazarus",
    author: "Sylvia Plath",
    originalLanguage: "Anglais",
    coverGradient: "from-red-950/80 via-zinc-900 to-slate-800",
    averageReview: 4.4,
    totalLogs: 8765,
    snippet: {
      original:
        "I have done it again.\nOne year in every ten\nI manage it --",
      translation:
        "Je l'ai encore fait.\nUne année sur dix\nJ'y arrive --",
    },
  },
  {
    id: "poem-007",
    title: "The Drunken Boat",
    originalTitle: "Le Bateau ivre",
    author: "Arthur Rimbaud",
    originalLanguage: "Français",
    coverGradient: "from-blue-950/70 via-slate-800 to-zinc-900",
    averageReview: 4.3,
    totalLogs: 7298,
    snippet: {
      original:
        "Comme je descendais des Fleuves impassibles,\nJe ne me sentis plus guide par les haleurs.",
      translation:
        "Comme je descendais des Fleuves impassibles,\nJe ne me sentis plus guidé par les haleurs.",
    },
  },
  {
    id: "poem-008",
    title: "The Second Coming",
    author: "W.B. Yeats",
    originalLanguage: "Anglais",
    coverGradient: "from-stone-900 via-neutral-800 to-zinc-800",
    averageReview: 4.7,
    totalLogs: 13456,
    snippet: {
      original:
        "Turning and turning in the widening gyre\nThe falcon cannot hear the falconer;\nThings fall apart; the centre cannot hold.",
      translation:
        "Tournant et tournant dans la spirale grandissante\nLe faucon ne peut entendre le fauconnier ;\nLes choses s'effondrent ; le centre ne peut plus tenir.",
    },
  },
  {
    id: "poem-009",
    title: "Quiet Night Thought",
    originalTitle: "Jing Ye Si",
    author: "Li Bai",
    originalLanguage: "Chinois",
    coverGradient: "from-indigo-950/60 via-slate-900 to-stone-800",
    averageReview: 4.6,
    totalLogs: 10234,
    snippet: {
      original:
        "Chuang qian ming yue guang,\nYi shi di shang shuang.\nJu tou wang ming yue,\nDi tou si gu xiang.",
      translation:
        "Brillante lumière de lune devant mon lit,\nJe soupçonne que ce soit du givre sur le sol.\nJe lève la tête pour contempler la lune brillante,\nPuis je la baisse, en pensant à mon foyer.",
    },
  },
  {
    id: "poem-010",
    title: "Fragment 31",
    author: "Sappho",
    originalLanguage: "Grec Ancien",
    coverGradient: "from-rose-950/50 via-stone-800 to-zinc-900",
    averageReview: 4.5,
    totalLogs: 6543,
    snippet: {
      original:
        "Phainetai moi kenos isos theoisin\nemmen oner, ottis enantios toi\nisdanei.",
      translation:
        "Il me semble égal aux dieux,\ncet homme qui s'assied en face de toi\net t'écoute.",
    },
  },
  {
    id: "poem-011",
    title: "Sleepwalking Ballad",
    originalTitle: "Romance sonambulo",
    author: "Federico Garcia Lorca",
    originalLanguage: "Espagnol",
    coverGradient: "from-emerald-950/50 via-zinc-900 to-slate-800",
    averageReview: 4.8,
    totalLogs: 9871,
    snippet: {
      original:
        "Verde que te quiero verde.\nVerde viento. Verdes ramas.\nEl barco sobre la mar\ny el caballo en la montana.",
      translation:
        "Vert, comme je te veux vert.\nVent vert. Branches vertes.\nLe bateau sur la mer\net le cheval dans la moncategoryne.",
    },
  },
  {
    id: "poem-012",
    title: "Song of Myself",
    author: "Walt Whitman",
    originalLanguage: "Anglais",
    coverGradient: "from-teal-950/40 via-stone-900 to-neutral-800",
    averageReview: 4.4,
    totalLogs: 14532,
    snippet: {
      original:
        "I celebrate myself, and sing myself,\nAnd what I assume you shall assume,\nFor every atom belonging to me as good belongs to you.",
      translation:
        "Je me célèbre et je me chante,\net ce que j'assume vous devrez l'assumer,\ncar chaque atome m'appartenant vous appartient aussi bien.",
    },
  },
  {
    id: "poem-013",
    title: "Ode to a Nightingale",
    author: "John Keats",
    originalLanguage: "Anglais",
    coverGradient: "from-violet-950/40 via-slate-900 to-zinc-800",
    averageReview: 4.6,
    totalLogs: 11298,
    snippet: {
      original:
        "My heart aches, and a drowsy numbness pains\nMy sense, as though of hemlock I had drunk.",
      translation:
        "Mon cœur souffre, et une torpeur endormie fait mal\nÀ mes sens, comme si de la pruche j'avais bu.",
    },
  },
  {
    id: "poem-014",
    title: "Requiem",
    originalTitle: "Rekviem",
    author: "Anna Akhmatova",
    originalLanguage: "Russe",
    coverGradient: "from-sky-950/40 via-zinc-900 to-stone-800",
    averageReview: 4.7,
    totalLogs: 7654,
    snippet: {
      original:
        "Net, i ne pod chuzhim nebesvodom,\nI ne pod zashchitoi chuzhikh kryl,--\nYa byla togda s moim narodom,\nTam, gde moi narod, k neschastyu, byl.",
      translation:
        "Non, pas sous un ciel étranger,\nNi à l'abri d'ailes étrangères --\nJ'étais avec mon peuple alors,\nLà où mon peuple, par malheur, se trouvait.",
    },
  },
  {
    id: "poem-015",
    title: "Tobacco Shop",
    originalTitle: "Tabacaria",
    author: "Fernando Pessoa",
    originalLanguage: "Portugais",
    coverGradient: "from-yellow-950/30 via-stone-900 to-slate-800",
    averageReview: 4.3,
    totalLogs: 5432,
    snippet: {
      original:
        "Nao sou nada.\nNunca serei nada.\nNao posso querer ser nada.\nA parte isso, tenho em mim todos os sonhos do mundo.",
      translation:
        "Je ne suis rien.\nJe ne serai jamais rien.\nJe ne peux vouloir être rien.\nÀ part ça, j'ai en moi tous les rêves du monde.",
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
    review: 4.5,
    reviewText:
      "Une descente hypnotique vers la fragmentation. Yeats capture l'effondrement de la civilisation avec des images si précises qu'elles se gravent dans votre mémoire. La métaphore du faucon porte à elle seule le poids d'une philosophie entière.",
    timestamp: "il y a 2h",
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
    timestamp: "il y a 3h",
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
    review: 5,
    reviewText:
      "Plath écrit avec une férocité qui vous fait ressentir la chaleur du four. Chaque strophe est une explosion contrôlée. Ce n'est pas de la poésie -- c'est une reddition de comptes.",
    timestamp: "il y a 4h",
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
    timestamp: "il y a 5h",
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
    review: 4,
    reviewText:
      "Le vert imprègne tout. Lorca peint avec un seul mot et construit un tout nouveau paysage onirique autour de lui. La répétition est hypnotique, chaque vers vous plongeant plus profondément dans une transe qui ne vous lâche jamais.",
    timestamp: "il y a 6h",
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
    review: 4.5,
    timestamp: "il y a 7h",
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
    review: 5,
    reviewText:
      "Rûmî distille des siècles de sagesse soufie dans une seule métaphore. La maison d'hôtes n'est pas juste un poème -- c'est une pratique. J'y reviens chaque semaine et chaque lecture dévoile une nouvelle couche de signification.",
    timestamp: "il y a 9h",
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
    review: 4.5,
    reviewText:
      "Pessoa regarde dans le vide et le vide lui tend une cigarette. Les premiers vers comptent parmi les plus honnêtes et les plus dévastateurs de toute la littérature. Un monument à la clarté existentielle.",
    timestamp: "il y a 11h",
    likes: 68,
    comments: 22,
  },
];

export const spotlightPoem = poems[0];

export const trendingPoems = poems.slice(0, 8);
export const curatedHaikus = [poems[2], poems[8], poems[9], poems[3], poems[4], poems[14], poems[12]];
