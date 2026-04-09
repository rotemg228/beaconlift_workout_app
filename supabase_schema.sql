-- ─── BEACONLIFT DATABASE SCHEMA ─────────────────────────────────

-- 1. Profiles Table (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'plus')),
  is_plus boolean default false,
  is_pro boolean default false,
  pro_until timestamptz,
  updated_at timestamptz default now()
);

-- 2. Workouts Table
create table workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  template_id text,
  name text not null,
  date date not null,
  start_time timestamptz not null,
  end_time timestamptz,
  exercises jsonb not null,
  notes text,
  total_volume numeric default 0,
  pump_pictures jsonb default '[]'::jsonb,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- 3. Templates Table
create table templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text,
  exercises jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Measurements Table
create table measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  weight numeric,
  body_fat numeric,
  measurements jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- RLS (Row Level Security) - Basic Setup
alter table profiles enable row level security;
alter table workouts enable row level security;
alter table templates enable row level security;
alter table measurements enable row level security;

-- Policies (Users can only see/edit their own data)
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can manage own workouts" on workouts for all using (auth.uid() = user_id);
create policy "Users can manage own templates" on templates for all using (auth.uid() = user_id);
create policy "Users can manage own measurements" on measurements for all using (auth.uid() = user_id);

-- 6. Storage Buckets (Run These in Supabase Dashboard SQL Editor)
/*
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('pump-pics', 'pump-pics', true);

create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload their own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() = (storage.foldername(name))[1]::uuid);
create policy "Users can update their own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid() = (storage.foldername(name))[1]::uuid);

create policy "Pump pics are publicly accessible" on storage.objects for select using (bucket_id = 'pump-pics');
create policy "Users can upload their own pump pics" on storage.objects for insert with check (bucket_id = 'pump-pics' and auth.uid() = (storage.foldername(name))[1]::uuid);
create policy "Users can delete their own pump pics" on storage.objects for delete using (bucket_id = 'pump-pics' and auth.uid() = (storage.foldername(name))[1]::uuid);
*/
