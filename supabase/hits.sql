-- Page visit counter for suburbiapark.com and hbliving.com (one table, one row per site, page and day).
-- Stores no names, emails, IP addresses or cookies.  Run once in Supabase: SQL Editor, New query, paste, Run.
create table if not exists public.page_hits (
  site  text not null check (site in ('suburbiapark', 'hbliving')),
  path  text not null check (char_length(path) <= 120),
  day   date not null default ((now() at time zone 'America/Los_Angeles')::date),
  hits  integer not null default 0,
  primary key (site, path, day)
);
alter table public.page_hits enable row level security;   -- no one can read or edit the table directly

-- The websites can only call this to add one visit.
create or replace function public.count_hit(p_site text, p_path text)
returns void language sql security definer set search_path = public as $$
  insert into public.page_hits (site, path, day, hits)
  values (p_site, left(coalesce(nullif(p_path, ''), '/'), 120), (now() at time zone 'America/Los_Angeles')::date, 1)
  on conflict (site, path, day) do update set hits = public.page_hits.hits + 1;
$$;
revoke all on function public.count_hit(text, text) from public;
grant execute on function public.count_hit(text, text) to anon, authenticated;
