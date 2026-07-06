-- Run this in your Supabase SQL Editor to create the Reviews table

create table public.site_reviews (
  id uuid default gen_random_uuid() primary key,
  rating integer not null check (rating >= 1 and rating <= 5),
  feedback_text text,
  user_type text not null check (user_type in ('guest', 'registered')),
  user_id uuid references auth.users(id),
  name text,
  email text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.site_reviews enable row level security;

-- Allow anonymous and authenticated users to insert reviews
create policy "Anyone can insert reviews"
  on public.site_reviews for insert
  with check (true);

-- Only admins can view reviews
create policy "Admins can view reviews"
  on public.site_reviews for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );
