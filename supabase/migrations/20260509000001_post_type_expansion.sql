-- Expand post_type to support comparison and best-for pages
-- Drop old constraint and recreate with new values
alter table blog_posts drop constraint if exists blog_posts_post_type_check;
alter table blog_posts add constraint blog_posts_post_type_check
  check (post_type in ('article', 'listicle', 'comparison', 'best'));
