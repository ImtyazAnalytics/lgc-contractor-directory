# LGC Global Contractor Directory

Responsive Next.js contractor directory using Supabase. It prevents duplicate company records at both the interface and database levels, while allowing multiple contacts and trades per company.

## Setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key.
3. Run `npm install` and `npm run dev`.
4. Push the folder to GitHub, import the repository into Vercel, and add the same environment variables.

The included RLS rules allow everyone with the website link to view and add directory data. Add authentication and stricter policies later if access should be limited to LGC staff.
