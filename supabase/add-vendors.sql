-- Run this once in Supabase SQL Editor to add vendor support.
alter table public.companies
  add column if not exists company_type text not null default 'Contractor';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'companies_company_type_check'
      and conrelid = 'public.companies'::regclass
  ) then
    alter table public.companies
      add constraint companies_company_type_check
      check (company_type in ('Contractor', 'Vendor', 'Both'));
  end if;
end $$;
