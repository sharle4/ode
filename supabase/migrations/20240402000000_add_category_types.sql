-- Add a `type` column to the `categories` table with a check constraint
ALTER TABLE public.categories ADD COLUMN type text NOT NULL DEFAULT 'THEME';
ALTER TABLE public.categories ADD CONSTRAINT categories_type_check CHECK (type IN ('THEME', 'MOVEMENT', 'ERA'));

-- Add a `sort_order` integer column to allow custom ordering within categories
ALTER TABLE public.categories ADD COLUMN sort_order int NOT NULL DEFAULT 0;

-- Create an index on the `type` column to prevent Sequential Scans when grouping/filtering
CREATE INDEX idx_categories_type ON public.categories(type);
