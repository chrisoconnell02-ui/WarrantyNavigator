Dealer Warranty Planner

## Local development

1. Open a terminal in the project folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Vercel

Deploy this folder as a `Next.js` project. In Vercel, leave the `Output Directory` blank.

## Supabase setup

This app currently ships with a front-end-only login screen. The database schema for a real Supabase backend is included in [supabase/schema.sql](/c:/Users/walki/OneDrive/Desktop/Save%20Me/chris-project/attachments/WarrantyNavigator/supabase/schema.sql).

Recommended setup:

1. Create a new Supabase project.
2. In the Supabase dashboard, open `SQL Editor`.
3. Run the SQL from [supabase/schema.sql](/c:/Users/walki/OneDrive/Desktop/Save%20Me/chris-project/attachments/WarrantyNavigator/supabase/schema.sql).
4. In `Authentication -> Providers`, keep `Email` enabled.
5. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Add the same environment variables in Vercel under `Settings -> Environment Variables`.

The schema creates:

- `profiles`: one row per authenticated dealer user
- `planner_snapshots`: saved warranty calculations tied to each user

## Next step

The database is now defined, but the UI is still using placeholder client-only auth. The next implementation step is wiring the login form and snapshot saving/loading to Supabase Auth and `planner_snapshots`.
