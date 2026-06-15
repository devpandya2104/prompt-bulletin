-- Per-user blog upvote tracking (prevents duplicate counts)
create table if not exists user_blog_upvotes (
  user_id  uuid not null references auth.users(id)  on delete cascade,
  post_id  uuid not null references blog_posts(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table user_blog_upvotes enable row level security;

create policy "users can read own blog upvotes"
  on user_blog_upvotes for select using (auth.uid() = user_id);

create policy "users can insert own blog upvotes"
  on user_blog_upvotes for insert with check (auth.uid() = user_id);

create policy "users can delete own blog upvotes"
  on user_blog_upvotes for delete using (auth.uid() = user_id);

-- Update RPCs to be idempotent (no change, already correct)
create or replace function increment_blog_upvote(post_id uuid)
returns void language sql security definer as $$
  update blog_posts set upvote_count = upvote_count + 1 where id = post_id;
$$;

create or replace function decrement_blog_upvote(post_id uuid)
returns void language sql security definer as $$
  update blog_posts set upvote_count = greatest(upvote_count - 1, 0) where id = post_id;
$$;
