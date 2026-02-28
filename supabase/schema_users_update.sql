-- 1. Add provider column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS provider TEXT;

-- 2. Update the trigger function to capture the provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, provider)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider' -- Captures 'discord', 'google', etc.
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    provider = EXCLUDED.provider;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sync existing users' providers
-- Note: 'raw_app_meta_data' in auth.users contains the provider info
UPDATE public.profiles p
SET provider = u.raw_app_meta_data->>'provider'
FROM auth.users u
WHERE p.id = u.id AND p.provider IS NULL;
