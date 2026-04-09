-- Safe migration for Free + Plus auth profile fields
-- Run in Supabase SQL Editor or via Supabase CLI migrations.

alter table if exists public.profiles
  add column if not exists username text;

alter table if exists public.profiles
  add column if not exists plan text default 'free';

alter table if exists public.profiles
  add column if not exists is_plus boolean default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_plan_check check (plan in ('free', 'plus'));
  end if;
end $$;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null and username <> '';

-- Backfill from previous fields/metadata if available
update public.profiles
set plan = case
  when coalesce(is_plus, false) = true or coalesce(is_pro, false) = true then 'plus'
  else 'free'
end
where plan is null or plan not in ('free', 'plus');

update public.profiles
set is_plus = (plan = 'plus')
where is_plus is distinct from (plan = 'plus');

-- Keep old is_pro compatible with new plan flag
update public.profiles
set is_pro = is_plus
where is_pro is distinct from is_plus;
