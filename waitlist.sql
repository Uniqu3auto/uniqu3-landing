create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  role text not null check (role in ('customer', 'mechanic')),
  zip text,
  joined_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Anonymous visitors can join, but cannot read, change, or delete signups.
revoke all on public.waitlist from anon, authenticated;
grant insert on public.waitlist to anon;
drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist for insert to anon with check (true);
