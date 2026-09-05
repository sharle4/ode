export interface AuthorItem {
  id?: string;
  name: string;
  slug?: string;
}

export interface FormattedAuthors {
  /** Liste normalisée des auteurs */
  authors: AuthorItem[];
  /** Nombre total d'auteurs */
  count: number;
  /** Texte pour l'affichage en ligne ou le sous-titre (ex: "Auteur 1 & Auteur 2" ou "Auteurs multiples") */
  displayText: string;
  /** Texte pour la couverture du recueil (ex: "Auteur 1 & Auteur 2" ou "Auteurs multiples") */
  coverText: string;
  /** Indique s'il y a strictement plus de 2 auteurs (déclenchant le regroupement 'Auteurs multiples') */
  isMultiple: boolean;
}

/**
 * Normalise n'importe quelle entrée d'auteurs (tableau, objet unique, chaîne, jointure Supabase)
 * en un tableau d'objets `AuthorItem` propres.
 */
export function normalizeAuthors(rawAuthors: any): AuthorItem[] {
  if (!rawAuthors) return [];

  // Si c'est déjà un tableau
  if (Array.isArray(rawAuthors)) {
    const list: AuthorItem[] = [];
    for (const item of rawAuthors) {
      if (!item) continue;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) list.push({ name: trimmed });
        continue;
      }
      // Jointure Supabase possible : item.authors ou item directement
      const actual = item.authors || item;
      const name = (actual.name || '').trim();
      if (name) {
        list.push({
          id: actual.id,
          name,
          slug: actual.slug || actual.id,
        });
      }
    }
    return list;
  }

  // Si c'est un objet unique
  if (typeof rawAuthors === 'object') {
    const actual = rawAuthors.authors || rawAuthors;
    const name = (actual.name || '').trim();
    if (name) {
      return [{
        id: actual.id,
        name,
        slug: actual.slug || actual.id,
      }];
    }
  }

  // Si c'est une chaîne directe
  if (typeof rawAuthors === 'string') {
    const trimmed = rawAuthors.trim();
    if (trimmed) {
      return [{ name: trimmed }];
    }
  }

  return [];
}

/**
 * Règle métier centrale :
 * - 0 auteur : "Auteur inconnu"
 * - 1 auteur : Nom de l'auteur
 * - 2 auteurs : "Auteur 1 & Auteur 2" (chacun conservé et cliquable séparément dans l'UI)
 * - > 2 auteurs : "Auteurs multiples" (isMultiple = true)
 */
export function formatAuthors(rawAuthors: any): FormattedAuthors {
  const authors = normalizeAuthors(rawAuthors);
  const count = authors.length;

  if (count === 0) {
    return {
      authors: [],
      count: 0,
      displayText: 'Auteur inconnu',
      coverText: 'Auteur inconnu',
      isMultiple: false,
    };
  }

  if (count === 1) {
    const name = authors[0].name;
    return {
      authors,
      count: 1,
      displayText: name,
      coverText: name,
      isMultiple: false,
    };
  }

  if (count === 2) {
    const text = `${authors[0].name} & ${authors[1].name}`;
    return {
      authors,
      count: 2,
      displayText: text,
      coverText: text,
      isMultiple: false,
    };
  }

  // Strictement plus de 2 auteurs (> 2 auteurs)
  return {
    authors,
    count,
    displayText: 'Auteurs multiples',
    coverText: 'Auteurs multiples',
    isMultiple: true,
  };
}
