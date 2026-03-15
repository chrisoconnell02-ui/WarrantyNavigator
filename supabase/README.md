# Supabase notes

Use [schema.sql](/c:/Users/walki/OneDrive/Desktop/Save%20Me/chris-project/attachments/WarrantyNavigator/supabase/schema.sql) in the Supabase SQL Editor.

What it creates:

- `profiles`: dealer profile row linked to `auth.users`
- `planner_snapshots`: saved warranty planner scenarios
- row-level security so users can only access their own rows
- an auth trigger that creates a `profiles` row when a user signs up

The current frontend does not yet call Supabase. This schema is the backend foundation for that integration.
