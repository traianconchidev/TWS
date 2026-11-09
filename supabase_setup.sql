-- ============================================================
-- Timeless Wardrobe Studio — accounts + wishlist schema
-- Run this once in the NEW TWS Supabase project → SQL Editor → Run.
-- Safe to re-run (idempotent).
-- ============================================================

-- 1) Profiles: one row per user — this is your email / marketing list + consent
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  marketing_consent boolean default true,
  source text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles self read"   on public.profiles;
drop policy if exists "profiles self insert" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row on sign-up (captures email + consent for marketing)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, marketing_consent, source)
  values (new.id, new.email,
          coalesce((new.raw_user_meta_data->>'marketing_consent')::boolean, true),
          coalesce(new.raw_user_meta_data->>'source', 'tws-hub'))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Wishlist: saved looks + products per user
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('look','product')),
  item_id text not null,
  item_data jsonb,
  created_at timestamptz default now(),
  unique (user_id, item_type, item_id)
);
alter table public.wishlist enable row level security;

drop policy if exists "wishlist owner all" on public.wishlist;
create policy "wishlist owner all" on public.wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- After running this:
--  • Authentication → Providers → Email: enable "Confirm email".
--  • Authentication → URL Configuration:
--      Site URL         = https://timelesswardrobestudio.com
--      Redirect URLs    = https://timelesswardrobestudio.com/**
--                         https://tws-hub.petcu-raluca.workers.dev/**
--  • Project Settings → API: copy the Project URL + the anon/publishable key
--    into tws-config.js in the hub repo (both are safe to expose in the browser).
-- ============================================================
