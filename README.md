Dealer Warranty Planner

## Local development

1. Open a terminal in the project folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Vercel

Deploy this folder as a `Next.js` project. In Vercel, leave the `Output Directory` blank.

## Supabase setup

This app now uses Supabase for email authentication and saved planner snapshots. The database schema is included in `supabase/schema.sql`.

Recommended setup:

1. Create a new Supabase project.
2. In the Supabase dashboard, open `SQL Editor`.
3. Run the SQL from `supabase/schema.sql`.
4. In `Authentication -> Providers`, keep `Email` enabled.
5. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Add the same environment variables in Vercel under `Settings -> Environment Variables`.

The schema creates:

- `profiles`: one row per authenticated dealer user
- `planner_snapshots`: saved warranty calculations tied to each user

## Application behavior

- Sign up creates a Supabase auth user and stores `dealer_name` in `profiles`
- Sign in uses Supabase email/password auth
- Saved snapshots are loaded from `planner_snapshots` for the signed-in user only

## Notes

- Run `npm install` after pulling these changes so `@supabase/supabase-js` is installed
- If email confirmation is enabled in Supabase Auth, new users must confirm their email before signing in
