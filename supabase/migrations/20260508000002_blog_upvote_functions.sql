-- Blog post upvote RPCs (tools already have these — blog posts were missing)
create or replace function increment_blog_upvote(post_id uuid)
returns void language sql security definer as $$
  update blog_posts set upvote_count = upvote_count + 1 where id = post_id;
$$;

create or replace function decrement_blog_upvote(post_id uuid)
returns void language sql security definer as $$
  update blog_posts set upvote_count = greatest(upvote_count - 1, 0) where id = post_id;
$$;
