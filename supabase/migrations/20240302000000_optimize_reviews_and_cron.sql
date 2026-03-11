-- Optimization of Reviews Triggers and Daily Poem Selection Cron

-- 1. DROPPING OLD TRIGGERS & FUNCTIONS TO AVOID ROW LOCKS ON HEAVY WRITES
DROP TRIGGER IF EXISTS on_poem_review_change ON public.poem_reviews;
DROP TRIGGER IF EXISTS on_poem_review_delete ON public.poem_reviews;

DROP TRIGGER IF EXISTS on_collection_review_change ON public.collection_reviews;
DROP TRIGGER IF EXISTS on_collection_review_delete ON public.collection_reviews;

DROP FUNCTION IF EXISTS public.update_poem_review_stats();
DROP FUNCTION IF EXISTS public.update_collection_review_stats();


-- 2. PG_CRON JOBS FOR AGGREGATING REVIEWS
-- Calculate poem review stats periodically without deadlocks
CREATE OR REPLACE FUNCTION public.aggregate_poem_review_stats()
RETURNS void AS $$
BEGIN
    WITH review_stats AS (
        SELECT poem_id, 
               COALESCE(ROUND(AVG(score), 2), 0.00) as new_average, 
               COUNT(*) as new_count
        FROM public.poem_reviews
        GROUP BY poem_id
    )
    UPDATE public.poems p
    SET average_review = rs.new_average,
        reviews_count = rs.new_count
    FROM review_stats rs
    WHERE p.id = rs.poem_id
      AND (p.average_review != rs.new_average OR p.reviews_count != rs.new_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate collection review stats periodically
CREATE OR REPLACE FUNCTION public.aggregate_collection_review_stats()
RETURNS void AS $$
BEGIN
    WITH review_stats AS (
        SELECT collection_id, 
               COALESCE(ROUND(AVG(score), 2), 0.00) as new_average, 
               COUNT(*) as new_count
        FROM public.collection_reviews
        GROUP BY collection_id
    )
    UPDATE public.collections c
    SET average_review = rs.new_average,
        reviews_count = rs.new_count
    FROM review_stats rs
    WHERE c.id = rs.collection_id
      AND (c.average_review != rs.new_average OR c.reviews_count != rs.new_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule both aggregation jobs every 5 minutes
SELECT cron.schedule('aggregate-poem-reviews', '*/5 * * * *', 'SELECT public.aggregate_poem_review_stats();');
SELECT cron.schedule('aggregate-collection-reviews', '*/5 * * * *', 'SELECT public.aggregate_collection_review_stats();');


-- 3. OPTIMIZING DAILY POEM CRON JOB
CREATE OR REPLACE FUNCTION public.select_daily_poem()
RETURNS void AS $$
DECLARE
  random_poem_id uuid;
  today date := current_date;
  total_poems int;
  offset_val int;
BEGIN
  -- First, count the poems eligible for the daily selection using an optimized EXISTS check
  SELECT COUNT(*) INTO total_poems 
  FROM public.poems p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.daily_poems dp 
    WHERE dp.poem_id = p.id AND dp.date >= current_date - interval '30 days'
  );

  IF total_poems > 0 THEN
      -- Pick a random offset
      offset_val := floor(random() * total_poems);

      -- Fetch using the dynamic offset instead of a sequential table sorting
      SELECT p.id INTO random_poem_id
      FROM public.poems p
      WHERE NOT EXISTS (
        SELECT 1 FROM public.daily_poems dp 
        WHERE dp.poem_id = p.id AND dp.date >= current_date - interval '30 days'
      )
      LIMIT 1 OFFSET offset_val;

      IF random_poem_id IS NOT NULL THEN
        INSERT INTO public.daily_poems (date, poem_id)
        VALUES (today, random_poem_id)
        ON CONFLICT (date) DO NOTHING;
      END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
