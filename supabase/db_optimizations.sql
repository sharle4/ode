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

-- 5. Rate Limiting Backend (RPC Postgres)
-- Table et fonction basiques pour du Rate Limiting sans Redis (Option B)
/*
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_count INT DEFAULT 1,
    UNIQUE(user_id, action_type)
);

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action_type TEXT,
    p_limit INT,
    p_window_seconds INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_count INT;
BEGIN
    -- Nettoie les vieilles fenêtres
    DELETE FROM public.rate_limits 
    WHERE user_id = p_user_id 
      AND action_type = p_action_type 
      AND window_start < NOW() - (p_window_seconds || ' seconds')::INTERVAL;

    -- Upsert le compteur
    INSERT INTO public.rate_limits (user_id, action_type, request_count, window_start)
    VALUES (p_user_id, p_action_type, 1, NOW())
    ON CONFLICT (user_id, action_type) 
    DO UPDATE SET request_count = public.rate_limits.request_count + 1
    RETURNING request_count INTO v_count;

    IF v_count > p_limit THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
