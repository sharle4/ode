-- ==========================================
-- OPTIMISATIONS BASE DE DONNÉES (SUPABASE)
-- ==========================================

-- 1. Stratégie de Soft Deletes (Alternative à ON DELETE CASCADE)
-- L'utilisation d'ON DELETE CASCADE pour les utilisateurs/auteurs est dangereuse en production (Table Locks).
-- Il est recommandé d'ajouter une colonne deleted_at :
/*
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.poems ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Les requêtes de l'application devront ensuite inclure le filtre:
-- WHERE deleted_at IS NULL
*/

-- 2. Rate Limiting Backend (RPC Postgres)
-- Utiliser upstash redis pour le rate limiting
*/