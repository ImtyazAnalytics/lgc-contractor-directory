create extension if not exists pg_trgm;

create or replace function normalize_company_name(value text)
returns text language sql immutable as $$
  select regexp_replace(regexp_replace(lower(trim(value)), '\m(incorporated|corporation|company|limited|inc|corp|co|llc|ltd)\M', '', 'g'), '[^a-z0-9]', '', 'g');
$$;

create table public.companies (
 id uuid primary key default gen_random_uuid(), name text not null,
 normalized_name text generated always as (normalize_company_name(name)) stored,
 city text, state text default 'MI', website text, notes text,
 status text not null default 'Active' check (status in ('Active','Inactive')),
 created_at timestamptz not null default now(), created_by uuid references auth.users(id), updated_at timestamptz not null default now(),
 constraint companies_normalized_name_unique unique(normalized_name)
);
create table public.trades (id uuid primary key default gen_random_uuid(),name text not null unique,description text,created_at timestamptz not null default now(),created_by uuid references auth.users(id));
create table public.company_trades (company_id uuid references public.companies(id) on delete cascade,trade_id uuid references public.trades(id) on delete cascade,primary key(company_id,trade_id));
create table public.contacts (id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id) on delete cascade,name text not null,job_title text,phone text,email text,created_at timestamptz not null default now(),created_by uuid references auth.users(id));
create unique index contacts_company_email_unique on public.contacts(company_id,lower(email)) where email is not null and email<>'';
create unique index contacts_company_phone_unique on public.contacts(company_id,regexp_replace(phone,'[^0-9]','','g')) where phone is not null and phone<>'';
create index companies_name_search on public.companies using gin(name gin_trgm_ops);
alter table public.companies enable row level security; alter table public.trades enable row level security; alter table public.company_trades enable row level security; alter table public.contacts enable row level security;
create policy "users view companies" on public.companies for select to anon, authenticated using(true);
create policy "users add companies" on public.companies for insert to anon, authenticated with check(true);
create policy "users update companies" on public.companies for update to anon, authenticated using(true);
create policy "users view trades" on public.trades for select to anon, authenticated using(true);
create policy "users add trades" on public.trades for insert to anon, authenticated with check(true);
create policy "users view company trades" on public.company_trades for select to anon, authenticated using(true);
create policy "users add company trades" on public.company_trades for insert to anon, authenticated with check(true);
create policy "users view contacts" on public.contacts for select to anon, authenticated using(true);
create policy "users add contacts" on public.contacts for insert to anon, authenticated with check(true);
insert into public.trades(name) values ('Water Main Installation'),('Sewer'),('Water Main Services'),('Hydrovac'),('Concrete Restoration'),('Asphalt Restoration'),('Traffic Control'),('Directional Drilling'),('Soft Restoration'),('Trucking') on conflict do nothing;
