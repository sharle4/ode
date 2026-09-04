# 📜 Ode.

**Ode** est une plateforme web moderne et épurée dédiée à la lecture et à l'exploration de poésie classique et contemporaine, construite avec **Next.js 16**, **Supabase** (PostgreSQL + RLS), **TailwindCSS**, et enrichie par un moteur d'illustration générative déterministe (style Rothko).

---

## ⚡ Démarrage Rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration des variables d'environnement

Créez ou vérifiez le fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL = http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY = votre_cle_anon_publique
SUPABASE_SERVICE_ROLE_KEY = votre_cle_service_role_secrete
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

> **Note Windows (Turbopack)** : Si vous rencontrez l'erreur `Accès refusé. (os error 5)` au lancement de Turbopack sous Windows, supprimez le dossier `.next/` ou démarrez avec le flag Webpack :
> ```bash
> npx next dev --webpack
> ```

---

## 🗄️ Base de Données Supabase (Local vs Cloud)

Pour faire fonctionner la base de données et l'API d'Ode, deux approches sont possibles :

### Option A : Supabase en Local (Nécessite Docker Desktop & WSL2)

La CLI Supabase orchestre en local l'ensemble des conteneurs (PostgreSQL, PostgREST, Auth GoTrue, Kong, Studio).

1. **Prérequis sous Windows** :
   - Avoir **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** installé et lancé.
   - Avoir activé le backend **WSL 2** (`wsl --install` si non configuré).
2. **Démarrer les services** :
   ```bash
   npx supabase start
   ```
3. **Accéder à Supabase Studio local** :
   - Interface web : [http://127.0.0.1:54323](http://127.0.0.1:54323)
   - API URL : `http://127.0.0.1:54321`
4. **Appliquer les migrations SQL** (si première installation) :
   ```bash
   npx supabase db reset
   ```

### Option B : Supabase Cloud (Recommandé si vous n'avez pas Docker)

Le plan gratuit hébergé sur [supabase.com](https://supabase.com) est parfait pour héberger le projet sans consommer de ressources locales.

1. Créez un projet sur **[supabase.com](https://supabase.com)**.
2. Dans **Project Settings > API**, copiez l'URL du projet, l'`anon public key` et la `service_role key` dans votre `.env.local`.
3. Appliquez les migrations depuis votre terminal avec la CLI liée :
   ```bash
   npx supabase link --project-ref votre-project-ref
   npx supabase db push
   ```
   *(Ou copiez-collez les fichiers de `supabase/migrations/` directement dans le SQL Editor du dashboard web Supabase).*

---

## 🔄 Pipeline de Données : Importer ses propres poèmes

Si vous extrayez un nouveau corpus (par exemple via **Scriptorium**) ou possédez votre propre archive, suivez cette chaîne de traitement dans le dossier `scripts/` :

```
Archive JSONL brute
     │
     ▼
[scripts/clean_authors.py]        ──> Nettoyage & déduplication des auteurs
     │
     ▼
[scripts/enrich_authors.py]       ──> Résolution Wikidata (portraits, dates, lieux, mouvements)
     │
     ▼
[scripts/generate_rothko_genome.py]──> Analyse NLP du texte & création du génome visuel Rothko
     │
     ▼
[scripts/ingest.js]               ──> Ingestion optimisée par lots dans Supabase
```

### Étape 1 : Placer le fichier source

Placez votre archive de poèmes compressée sous le chemin :
`scripts/poems.jsonl.gz` *(format NDJSON compressé avec métadonnées d'auteurs et recueils)*.

### Étape 2 : Nettoyer les auteurs

Normalise les noms d'auteurs, traite les pseudonymes et corrige les scories de formatage :

```bash
python scripts/clean_authors.py
```
*Sortie générée : `scripts/poems.cleaned.jsonl.gz` et `scripts/cleaned_report.json`.*

### Étape 3 : Enrichir les auteurs via Wikidata

Interroge l'API Wikidata en asynchrone pour collecter les photos, signatures, dates de naissance/mort, nationalités et mouvements littéraires :

```bash
python scripts/enrich_authors.py
```
*Sortie générée : `scripts/enriched_authors.jsonl` et `scripts/enrichmed_report.json`.*

### Étape 4 : Générer les génomes d'illustration Rothko

Analyse la polarité, le rythme et la structure de chaque poème pour produire une empreinte graphique unique et déterministe (palette de couleurs, complexité, grain) :

```bash
python scripts/generate_rothko_genome.py
```
*Sortie générée : `scripts/rothko_genomes.json`.*

### Étape 5 : Ingestion dans Supabase

Assurez-vous que Supabase est en ligne (local ou cloud) et lancez l'ingestion par lots :

```bash
npm run ingest
```
*(ou `node scripts/ingest.js`)*.  
Ce script insère et déduplique automatiquement les auteurs (`authors`), les recueils (`collections`), les poèmes avec découpage en strophes/vers (`poems`) et les illustrations (`rothko_params`).

---

## 👑 Créer et Gérer un Compte Administrateur

Le tableau de bord d'administration (`/admin`) permet de gérer les poèmes mis en avant, le poème du jour, les recueils vedettes et les catégories.

L'accès est protégé à la fois par le middleware Next.js (vérification du claim JWT `app_metadata.is_admin`) et par les politiques RLS de PostgreSQL.

### Méthode 1 : Inscription Web + Promotion SQL (Recommandée)

1. Inscrivez-vous sur l'interface : [http://localhost:3000/signup](http://localhost:3000/signup).
2. Dans l'éditeur SQL de votre Dashboard Supabase (Cloud ou Studio local), promouvez votre utilisateur :
   ```sql
   UPDATE public.users 
   SET is_admin = true 
   WHERE username = 'votre_pseudo';
   ```
   *(Un trigger PostgreSQL synchronise automatiquement le rôle dans `auth.users.raw_app_meta_data`).*
3. Déconnectez-vous puis reconnectez-vous sur `/login` pour régénérer votre token de session avec les droits administrateur.

### Méthode 2 : Création directe via Node.js CLI

Grâce à la clé `SUPABASE_SERVICE_ROLE_KEY` présente dans `.env.local`, exécutez directement dans votre terminal :

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@ode.com',
    password: 'VotreMotDePasse123!',
    email_confirm: true,
    user_metadata: { username: 'admin', onboarding_status: 'completed' },
    app_metadata: { is_admin: true }
  });
  if (error) { console.error('Erreur:', error.message); return; }
  await supabase.from('users').update({ is_admin: true }).eq('id', data.user.id);
  console.log('✅ Compte admin créé avec succès !');
}
run();
"
```

---

## 📁 Architecture du Projet

```
ode/
├── app/                  # Routes Next.js App Router
│   ├── (auth)/           # Pages login, signup
│   ├── admin/            # Panneau d'administration (/admin, daily-poem, featured, etc.)
│   ├── author/[slug]/    # Fiche poète (bio, dates, recueils, poèmes)
│   ├── collection/[slug]/# Fiche recueil (sommaire et lecture séquentielle)
│   ├── explore/          # Exploration filtrable par catégories / mouvements
│   ├── poem/[slug]/      # Page de lecture du poème avec illustration Rothko
│   └── profile/          # Profil utilisateur, favoris, annotations
├── components/           # Composants UI réutilisables (Navbar, Card, Rothko, etc.)
├── scripts/              # Pipeline de traitement et ingestion des données
│   ├── clean_authors.py
│   ├── enrich_authors.py
│   ├── generate_rothko_genome.py
│   └── ingest.js
├── supabase/             # Schémas et migrations PostgreSQL
│   └── migrations/
└── utils/supabase/       # Clients Supabase (client, server, middleware, queries avec cache)
```

---

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
- [ ] ajouter inspiration / inspiré
- [ ] ajouter carte et frise
- [ ] ajouter proposition modification 
- [ ] ajouter infos enrich authors
- [ ] ajouter lien clicable pour date et lieu => lien vers frise et carte
- [ ] ajouter onboarding utilisateur (poète, poèmes, recueils, mouvements favoris + performances style (couleur, taille, journuit, police))
- [ ] remplacer section à propos auteur par metadata (dates, lieux, période, ...)
- [ ] ajouter bouton suggestion modification visiteur
- [ ] appliquer settings onboarding utilisateur
- [ ] ajouter différent style (inclus ddiférent style illustration poème (bauhaus))
- [ ] ajouter skeleton loading
- [ ] corriger bug stanzas (ligne seule avec "&#160;<br />" ou "<br />" pas reconnue comme saut de ligne) (<i> reconnu comme saut de ligne alors que ca ne devrait pas être le cas)
- [ ] réduire une ligne par catégories page explore + bouton étendre ou voir plus
- [ ] ajouter fonctionnalité ajouter ses propres poèmes (ex poèmes non public ou poèmes persos)