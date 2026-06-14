-- Additional SEO and content fields for admin editors
alter table tools
  add column if not exists logo_url      text,
  add column if not exists canonical_url text;

alter table blog_posts
  add column if not exists focus_keyword text,
  add column if not exists canonical_url text;
