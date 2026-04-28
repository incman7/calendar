// ─── Supabase credentials ────────────────────────────────────────────────────
// 1. Create a free project at https://supabase.com
// 2. Go to Settings → API and copy the values below
// 3. Run this SQL in the Supabase SQL editor to create the events table:
//
//   create table events (
//     id          text primary key,
//     user_id     uuid references auth.users not null,
//     title       text not null,
//     start       text not null,
//     "end"       text,
//     note        text,
//     color       text,
//     created_at  timestamptz default now()
//   );
//   alter table events enable row level security;
//   create policy "own rows only" on events
//     for all using (auth.uid() = user_id);
//
// ─────────────────────────────────────────────────────────────────────────────
export const SUPABASE_URL      = 'https://lidnrhnsgyeqymrhabwg.supabase.co';   // e.g. 'https://xyz.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_V8qZLE_lGkIYj3Q5Ri_7VA_P4ph2Vmj';   // your anon/public key
