This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Todo
- [ ] Section à propos de poème du jour : ajouter lien clicable pour date, langue => créer une option de recherche par date et par langue
- [ ] Vérifier longueur extrait poème du jour
- [ ] Titre header accueil défilant
- [ ] Faut-il aligner le haut du panneau d'informations du poème du jour avec le titre "poème du jour" ?
- [ ] Faut-il aligner le haut de la lettrine avec le haut du premier vers ?
- [ ] Récupérer photos auteurs et signatures
- [ ] Réfléchir à l'impact du choix de la couleur de surlignage
- [ ] Ajouter bannière utilisateur ?
- [ ] Ajouter description / infobulles aux badges
- [ ] Ajouter une barre de recherche sur onglet page profile (arg de recherche profile:username)
- [ ] Supprimer animation navbar si changement d'onglet uniquement
- [ ] onglets page profile doivent prendre toute la largeur
- [ ] marquer poeme comme lu
- [ ] page poème / recueil : ajouter note émotion et date
- [ ] centrer les onglets de la page profile ?
- [ ] rendre graphique de note interactif
- [ ] scrap wikipedia date naissance/mort auteur + lieu 
- [ ] utiliser llm local résumé bio auteur et recueil (dans toutes les langues), et attribution catégories
- [ ] remplacer lien copié partage poème par vrai partage
- [ ] changer titre onglet