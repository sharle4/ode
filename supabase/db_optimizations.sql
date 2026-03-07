-- ==========================================
-- OPTIMISATIONS BASE DE DONNÉES (SUPABASE)
-- ==========================================

-- 1. Index pour les recherches par clés étrangères (Jointures bidirectionnelles)
-- La clé primaire (poem_id, category_id) ou (category_id, poem_id) indexe seulement la première colonne efficacement.
-- On ajoute des index inversés pour éviter les Full Table Scans.
CREATE INDEX IF NOT EXISTS idx_poem_categories_category_id ON public.poem_categories(category_id);

-- 2. Tâche de nettoyage pour la table `reads`
-- Evite que la table de tracking ne croisse à l'infini et ralentisse les inserts.
-- A exécuter dans un cron job (soit via pg_cron, soit via un appel Webhook Edge Function).
/*
DELETE FROM public.reads 
WHERE processed = true 
AND created_at < NOW() - INTERVAL '7 days';
*/

-- Exemple avec pg_cron (Si activé sur Supabase) :
/*
SELECT cron.schedule(
  'cleanup-processed-reads',
  '0 3 * * *', -- Tous les jours à 3h du matin
  $$ DELETE FROM public.reads WHERE processed = true AND created_at < NOW() - INTERVAL '7 days'; $$
);
*/

-- 3. Stratégie de Soft Deletes (Alternative à ON DELETE CASCADE)
-- L'utilisation d'ON DELETE CASCADE pour les utilisateurs/auteurs est dangereuse en production (Table Locks).
-- Il est recommandé d'ajouter une colonne deleted_at :
/*
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Les requêtes de l'application devront ensuite inclure le filtre:
-- WHERE deleted_at IS NULL
*/

-- 4. Recommandation : Table de Reviews
-- Plutôt que la contrainte Exclusive Arc actuelle (CHECK poem_id IS NOT NULL OR collection_id IS NOT NULL),
-- L'architecture optimale selon le volume serait de séparer en deux tables : `poem_reviews` et `collection_reviews`.
