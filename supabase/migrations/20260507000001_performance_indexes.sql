-- Performance indexes — every public query was doing a full sequential scan

-- tools: homepage loads sorted by upvote_count, detail page by slug (unique already), admin filters
create index if not exists idx_tools_published_upvotes   on tools (is_published, upvote_count desc);
create index if not exists idx_tools_published_rating    on tools (is_published, rating desc);
create index if not exists idx_tools_published_created   on tools (is_published, created_at desc);
create index if not exists idx_tools_category            on tools (category_id);

-- blog_posts: index page + sitemap both filter is_published and sort published_at
create index if not exists idx_blog_published_date on blog_posts (is_published, published_at desc);

-- tool_reviews: fetched by tool_id, sorted by helpful_count
create index if not exists idx_reviews_tool_helpful on tool_reviews (tool_id, helpful_count desc);

-- upvotes: ToolCard deletes by (tool_id, user_id), Discover loads by user_id
-- unique(user_id, tool_id) constraint already covers user_id-first lookups
create index if not exists idx_upvotes_tool_id on upvotes (tool_id);

-- review_helpful_votes: queried by (user_id, review_id) and by review_id for counts
create index if not exists idx_helpful_votes_user_review on review_helpful_votes (user_id, review_id);
create index if not exists idx_helpful_votes_review      on review_helpful_votes (review_id);

-- site_config: tiny table, but key lookup used on every render
create index if not exists idx_site_config_key on site_config (key);
