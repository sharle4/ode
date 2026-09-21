-- Optimization for trending poems and popular queries
-- Index on reads_count and id for fast ordering without full table scan
CREATE INDEX IF NOT EXISTS idx_poems_reads_count_id 
ON public.poems (reads_count DESC NULLS LAST, id DESC NULLS LAST);

-- Also add index on average_review for high-rated queries
CREATE INDEX IF NOT EXISTS idx_poems_average_review 
ON public.poems (average_review DESC NULLS LAST, reviews_count DESC NULLS LAST);
