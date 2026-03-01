-- Update tournaments table for manual editing
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update existing records to false
UPDATE public.tournaments SET is_custom = false WHERE is_custom IS NULL;
