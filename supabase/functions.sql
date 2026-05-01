-- Run this in Supabase SQL Editor AFTER schema.sql and seed.sql

-- Increment upvote count safely
create or replace function increment_upvote(tool_id uuid)
returns void language sql security definer as $$
  update tools set upvote_count = upvote_count + 1 where id = tool_id;
$$;

-- Decrement upvote count safely (never go below 0)
create or replace function decrement_upvote(tool_id uuid)
returns void language sql security definer as $$
  update tools set upvote_count = greatest(upvote_count - 1, 0) where id = tool_id;
$$;
