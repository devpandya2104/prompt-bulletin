-- Track which users found which reviews helpful (prevents double-voting)
create table if not exists review_helpful_votes (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references tool_reviews(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(review_id, user_id)
);

alter table review_helpful_votes enable row level security;
create policy "helpful_votes_read"   on review_helpful_votes for select using (true);
create policy "helpful_votes_insert" on review_helpful_votes for insert with check (auth.uid() = user_id);
create policy "helpful_votes_delete" on review_helpful_votes for delete using (auth.uid() = user_id);
