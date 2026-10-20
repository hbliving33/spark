-- Suburbia Park community app: database setup for Supabase.
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run.
-- It is safe to run again; it only creates what is missing.

-- ---------- Streets in Suburbia Park (sign-up is limited to these) ----------
create table if not exists public.streets (
  id serial primary key,
  name text not null unique,          -- for example 'Suburbia Ln'
  low_number int,                     -- lowest house number allowed (leave empty for any)
  high_number int                     -- highest house number allowed (leave empty for any)
);
-- Starter entry.  Add the rest of the neighborhood's streets here, or in Table Editor > streets.
insert into public.streets (name) values ('Suburbia Ln') on conflict (name) do nothing;

-- ---------- Neighbor profiles ----------
-- status: pending (waiting for approval), approved, denied, suspended
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_initial text not null,
  house_number int,
  street_id int references public.streets (id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied', 'suspended')),
  is_admin boolean not null default false,
  address_ok boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helper checks used by the security rules below
create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'approved');
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin and status = 'approved');
$$;

-- When someone signs up, create their profile from the sign-up form and check the address.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  st public.streets%rowtype;
  num int;
  ok boolean := false;
begin
  num := nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'house_number', ''), '[^0-9]', '', 'g'), '')::int;
  select * into st from public.streets where id = nullif(new.raw_user_meta_data ->> 'street_id', '')::int;
  if found and num is not null
     and (st.low_number is null or num >= st.low_number)
     and (st.high_number is null or num <= st.high_number) then
    ok := true;
  end if;
  insert into public.profiles (id, first_name, last_initial, house_number, street_id, address_ok, status)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'first_name', 'Neighbor'), 40),
    upper(left(coalesce(new.raw_user_meta_data ->> 'last_initial', ''), 1)),
    num,
    st.id,
    ok,
    case when ok then 'pending' else 'denied' end
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Posts on the bulletin board ----------
create table if not exists public.posts (
  id bigserial primary key,
  author uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('news', 'lost', 'sale', 'free', 'recommend', 'help')),
  title text not null check (char_length(title) between 3 and 80),
  body text not null check (char_length(body) between 3 and 600),
  status text not null default 'live' check (status in ('live', 'hidden', 'removed')),
  created_at timestamptz not null default now()
);

-- ---------- Calendar events ----------
create table if not exists public.events (
  id bigserial primary key,
  author uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  date date not null,
  time text check (char_length(time) <= 20),
  place text check (char_length(place) <= 80),
  note text check (char_length(note) <= 300),
  kind text not null default 'social' check (kind in ('social', 'volunteer', 'market', 'beach', 'sports')),
  status text not null default 'live' check (status in ('live', 'hidden', 'removed')),
  created_at timestamptz not null default now()
);

-- ---------- Reports: a report hides the post or event until a moderator reviews it ----------
create table if not exists public.reports (
  id bigserial primary key,
  reporter uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  post_id bigint references public.posts (id) on delete cascade,
  event_id bigint references public.events (id) on delete cascade,
  reason text check (char_length(reason) <= 200),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create or replace function public.hide_reported() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.post_id is not null then update public.posts set status = 'hidden' where id = new.post_id and status = 'live'; end if;
  if new.event_id is not null then update public.events set status = 'hidden' where id = new.event_id and status = 'live'; end if;
  return new;
end;
$$;
drop trigger if exists on_report on public.reports;
create trigger on_report after insert on public.reports for each row execute function public.hide_reported();

-- ---------- Ads (local sponsors) ----------
create table if not exists public.ads (
  id bigserial primary key,
  business text not null,
  headline text not null,
  blurb text,
  link text,
  image_url text,
  slot text not null default 'strip' check (slot in ('banner', 'strip', 'directory')),
  starts_on date not null default current_date,
  ends_on date,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Public view of posts and events with the author's first name and last initial only (never the address)
create or replace view public.posts_public with (security_invoker = false) as
  select p.id, p.kind, p.title, p.body, p.created_at, pr.first_name || ' ' || pr.last_initial || '.' as author_name
  from public.posts p join public.profiles pr on pr.id = p.author where p.status = 'live';
create or replace view public.events_public with (security_invoker = false) as
  select e.id, e.title, e.date, e.time, e.place, e.note, e.kind, pr.first_name || ' ' || pr.last_initial || '.' as author_name
  from public.events e join public.profiles pr on pr.id = e.author where e.status = 'live';
grant select on public.posts_public, public.events_public to anon, authenticated;

-- ---------- Security rules (row level security) ----------
alter table public.streets enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.events enable row level security;
alter table public.reports enable row level security;
alter table public.ads enable row level security;

-- Streets: anyone can read the list (for the sign-up form); only admins change it.
drop policy if exists streets_read on public.streets;
create policy streets_read on public.streets for select using (true);
drop policy if exists streets_admin on public.streets;
create policy streets_admin on public.streets for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: you can see your own; admins can see and update everyone.
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- Posts: approved neighbors post; authors and admins can change; everyone reads through posts_public.
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert with check (public.is_approved() and author = auth.uid() and status = 'live');
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts for select using (author = auth.uid() or public.is_admin());
drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update using (public.is_admin() or author = auth.uid()) with check (public.is_admin() or (author = auth.uid() and status = 'removed'));

-- Events: same rules as posts.
drop policy if exists events_insert on public.events;
create policy events_insert on public.events for insert with check (public.is_approved() and author = auth.uid() and status = 'live');
drop policy if exists events_select on public.events;
create policy events_select on public.events for select using (author = auth.uid() or public.is_admin());
drop policy if exists events_update on public.events;
create policy events_update on public.events for update using (public.is_admin() or author = auth.uid()) with check (public.is_admin() or (author = auth.uid() and status = 'removed'));

-- Reports: approved neighbors can report; admins read and resolve.
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert with check (public.is_approved() and reporter = auth.uid());
drop policy if exists reports_admin on public.reports;
create policy reports_admin on public.reports for select using (public.is_admin());
drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update on public.reports for update using (public.is_admin()) with check (public.is_admin());

-- Ads: everyone sees active ads in their date range; only admins manage them.
drop policy if exists ads_read on public.ads;
create policy ads_read on public.ads for select using ((active and starts_on <= current_date and (ends_on is null or ends_on >= current_date)) or public.is_admin());
drop policy if exists ads_admin on public.ads;
create policy ads_admin on public.ads for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Make yourself the first admin ----------
-- After you sign up on the site, run this once with your email:
--   update public.profiles set status = 'approved', is_admin = true
--   where id = (select id from auth.users where email = 'YOUR EMAIL HERE');

-- ============================================================
-- Neighbors helping neighbors: requests for help and offers to help
-- ============================================================
create table if not exists public.help (
  id bigserial primary key,
  author uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  type text not null check (type in ('ask', 'offer')),
  category text not null check (category in ('groceries', 'errands', 'rides', 'meals', 'yard', 'pets', 'tech', 'checkin', 'other')),
  title text not null check (char_length(title) between 3 and 80),
  body text check (char_length(body) <= 500),
  when_text text check (char_length(when_text) <= 60),
  status text not null default 'open' check (status in ('open', 'matched', 'closed', 'hidden', 'removed')),
  created_at timestamptz not null default now()
);
-- "I can help" replies.  Only the person who asked (and admins) can read them.
create table if not exists public.help_replies (
  id bigserial primary key,
  help_id bigint not null references public.help (id) on delete cascade,
  helper uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  note text check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  unique (help_id, helper)
);
alter table public.reports add column if not exists help_id bigint references public.help (id) on delete cascade;

create or replace function public.hide_reported() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.post_id is not null then update public.posts set status = 'hidden' where id = new.post_id and status = 'live'; end if;
  if new.event_id is not null then update public.events set status = 'hidden' where id = new.event_id and status = 'live'; end if;
  if new.help_id is not null then update public.help set status = 'hidden' where id = new.help_id and status in ('open', 'matched'); end if;
  return new;
end;
$$;

create or replace view public.help_public with (security_invoker = false) as
  select h.id, h.type, h.category, h.title, h.body, h.when_text, h.status, h.created_at,
         pr.first_name || ' ' || pr.last_initial || '.' as author_name, (h.author = auth.uid()) as mine,
         (select count(*) from public.help_replies r where r.help_id = h.id) as replies
  from public.help h join public.profiles pr on pr.id = h.author where h.status in ('open', 'matched');
grant select on public.help_public to anon, authenticated;

-- Replies on my own requests, with the helper's first name and last initial
create or replace view public.my_help_replies with (security_invoker = false) as
  select r.id, r.help_id, r.note, r.created_at, pr.first_name || ' ' || pr.last_initial || '.' as helper_name
  from public.help_replies r join public.help h on h.id = r.help_id join public.profiles pr on pr.id = r.helper
  where h.author = auth.uid() or public.is_admin();
grant select on public.my_help_replies to authenticated;

alter table public.help enable row level security;
alter table public.help_replies enable row level security;
drop policy if exists help_insert on public.help;
create policy help_insert on public.help for insert with check (public.is_approved() and author = auth.uid() and status = 'open');
drop policy if exists help_select on public.help;
create policy help_select on public.help for select using (author = auth.uid() or public.is_admin());
drop policy if exists help_update on public.help;
create policy help_update on public.help for update using (public.is_admin() or (author = auth.uid() and status in ('open', 'matched', 'closed')))
  with check (public.is_admin() or (author = auth.uid() and status in ('open', 'matched', 'closed')));
create or replace function public.help_is_open_for_me(hid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.help h where h.id = hid and h.status in ('open', 'matched') and h.author <> auth.uid());
$$;
drop policy if exists help_replies_insert on public.help_replies;
create policy help_replies_insert on public.help_replies for insert with check (
  public.is_approved() and helper = auth.uid() and public.help_is_open_for_me(help_id));
drop policy if exists help_replies_select on public.help_replies;
create policy help_replies_select on public.help_replies for select using (helper = auth.uid() or public.is_admin());
