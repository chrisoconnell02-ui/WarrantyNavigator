create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  dealer_name text not null default 'Dealer Account',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, dealer_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'dealer_name', 'Dealer Account')
  )
  on conflict (id) do update
    set dealer_name = excluded.dealer_name,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.planner_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_name text not null,
  vin text,
  vehicle_year integer not null,
  make text not null,
  model text not null,
  vehicle_name text not null,
  miles_at_origination integer not null default 0,
  factory_years numeric(4, 1) not null,
  factory_miles integer not null,
  powertrain_years numeric(4, 1) not null,
  powertrain_miles integer not null,
  loan_term_months integer not null,
  annual_mileage integer not null,
  ownership_years integer not null,
  show_vsc_overlay boolean not null default true,
  vsc_years numeric(4, 1) not null,
  vsc_miles integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint planner_snapshots_snapshot_name_check check (char_length(trim(snapshot_name)) > 0)
);

create index if not exists planner_snapshots_user_id_created_at_idx
  on public.planner_snapshots (user_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists planner_snapshots_set_updated_at on public.planner_snapshots;
create trigger planner_snapshots_set_updated_at
before update on public.planner_snapshots
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.planner_snapshots enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "planner_snapshots_select_own" on public.planner_snapshots;
create policy "planner_snapshots_select_own"
on public.planner_snapshots
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "planner_snapshots_insert_own" on public.planner_snapshots;
create policy "planner_snapshots_insert_own"
on public.planner_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "planner_snapshots_update_own" on public.planner_snapshots;
create policy "planner_snapshots_update_own"
on public.planner_snapshots
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "planner_snapshots_delete_own" on public.planner_snapshots;
create policy "planner_snapshots_delete_own"
on public.planner_snapshots
for delete
to authenticated
using (auth.uid() = user_id);
