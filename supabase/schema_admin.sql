-- Run this in your Supabase SQL Editor to add Blog and Admin capabilities

-- 1. Create the Blogs table
create table public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null, -- Stores the HTML or Markdown content
  author_id uuid references auth.users(id) not null,
  cover_image_url text,
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Create the Profiles table (to map Auth Users to Admin Roles)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  is_admin boolean default false, -- VERY IMPORTANT: Sets Admin Status
  created_at timestamp with time zone default now()
);

-- 3. Trigger to instantly create a profile when a user logs in via OAuth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Set up Row Level Security (RLS) to protect content

-- Enable RLS
alter table public.blogs enable row level security;
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Blogs Policies
create policy "Published blogs are viewable by everyone."
  on blogs for select
  using ( is_published = true );

create policy "Admins can view all blogs"
  on blogs for select
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admins can insert blogs"
  on blogs for insert
  with check ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admins can update blogs"
  on blogs for update
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "Admins can delete blogs"
  on blogs for delete
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );
