-- Add SEO meta fields to tools
alter table tools
  add column if not exists seo_title       text,
  add column if not exists seo_description text,
  add column if not exists seo_og_image    text;

-- Add SEO meta fields to blog_posts
alter table blog_posts
  add column if not exists seo_title       text,
  add column if not exists seo_description text,
  add column if not exists seo_og_image    text;
