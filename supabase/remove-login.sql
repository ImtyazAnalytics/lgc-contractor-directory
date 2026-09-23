-- Run once in Supabase SQL Editor to allow the directory to work without login.
-- Anyone with the website link can view and change directory data.

drop policy if exists "public companies access" on public.companies;
drop policy if exists "public trades access" on public.trades;
drop policy if exists "public company trades access" on public.company_trades;
drop policy if exists "public contacts access" on public.contacts;

create policy "public companies access" on public.companies
for all to anon using (true) with check (true);

create policy "public trades access" on public.trades
for all to anon using (true) with check (true);

create policy "public company trades access" on public.company_trades
for all to anon using (true) with check (true);

create policy "public contacts access" on public.contacts
for all to anon using (true) with check (true);
