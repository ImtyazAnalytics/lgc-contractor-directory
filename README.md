# LGC Global Contractor Directory

Responsive Next.js contractor directory using Supabase. It prevents duplicate company records at both the interface and database levels, while allowing multiple contacts and trades per company.

## Setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key.
3. Run `npm install` and `npm run dev`.
4. Push the folder to GitHub, import the repository into Vercel, and add the same environment variables.

## Enable employee login on an existing database

1. Run `supabase/add-auth.sql` once in the Supabase SQL Editor.
2. In Supabase, open Authentication > Users and create one shared LGC directory account.
3. Public access is blocked. The shared account can add, edit, deactivate, and delete contractors and contacts.
