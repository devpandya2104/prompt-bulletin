-- ============================================================
-- PromptBulletin — Seed Data
-- Run AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

-- CATEGORIES
insert into categories (name, slug, icon, sort_order) values
  ('Writing & Copy',   'writing',      '✍️',  1),
  ('Image Generation', 'image',        '🎨',  2),
  ('Code & Dev',       'code',         '💻',  3),
  ('Video & Media',    'video',        '🎬',  4),
  ('Data & Analytics', 'data',         '📊',  5),
  ('Productivity',     'productivity', '⚡',  6),
  ('Research',         'research',     '🔍',  7),
  ('Audio & Voice',    'audio',        '🎙️', 8)
on conflict (slug) do nothing;

-- TOOLS (using category slugs via subquery)
insert into tools (name, slug, description, category_id, pricing, website_url, platforms, rating, upvote_count, review_count, badge, tag, tag_type, is_published)
values
  (
    'Perplexity AI', 'perplexity-ai',
    'AI-powered search engine that synthesizes real-time web information into cited, conversational answers.',
    (select id from categories where slug = 'research'),
    'Free / $20mo', 'https://perplexity.ai',
    array['Web', 'iOS', 'Android'], 4.8, 2841, 312, 'Trending', 'Editor''s Choice', 'editor', true
  ),
  (
    'Cursor', 'cursor',
    'AI-first code editor built on VS Code. Understands your codebase and writes, edits, and debugs alongside you.',
    (select id from categories where slug = 'code'),
    'Free / $20mo', 'https://cursor.com',
    array['Mac', 'Win', 'Linux'], 4.9, 2204, 198, 'Hot', 'Top Rated', 'top', true
  ),
  (
    'Midjourney', 'midjourney',
    'Industry-leading image generation model. Creates stunning, photorealistic or artistic visuals from text prompts.',
    (select id from categories where slug = 'image'),
    '$10–$60/mo', 'https://midjourney.com',
    array['Discord', 'Web'], 4.7, 1983, 445, null, 'Editor''s Choice', 'editor', true
  ),
  (
    'Copy.ai', 'copy-ai',
    'AI writing platform for marketing teams. Generate blog posts, ad copy, social content, and sales emails at scale.',
    (select id from categories where slug = 'writing'),
    'Free / $49mo', 'https://copy.ai',
    array['Web'], 4.4, 1456, 231, null, null, null, true
  ),
  (
    'ElevenLabs', 'elevenlabs',
    'Ultra-realistic AI voice synthesis and cloning. Used by podcasters, audiobook producers, and content creators.',
    (select id from categories where slug = 'audio'),
    'Free / $22mo', 'https://elevenlabs.io',
    array['Web', 'API'], 4.8, 1389, 167, 'New', 'Top Rated', 'top', true
  ),
  (
    'Notion AI', 'notion-ai',
    'AI built into Notion. Summarize docs, generate content, and answer questions about your workspace without leaving your notes.',
    (select id from categories where slug = 'productivity'),
    '$10/mo add-on', 'https://notion.so',
    array['Web', 'Mac', 'iOS', 'Android'], 4.3, 1244, 289, null, null, null, true
  ),
  (
    'RunwayML', 'runwayml',
    'Professional AI video generation and editing. Gen-3 Alpha creates cinematic video clips from text or images.',
    (select id from categories where slug = 'video'),
    'Free / $15mo', 'https://runwayml.com',
    array['Web'], 4.6, 1102, 143, 'Trending', 'Editor''s Choice', 'editor', true
  ),
  (
    'Julius AI', 'julius-ai',
    'AI data analyst. Upload CSV or connect databases; Julius writes Python/SQL, creates charts, and explains findings.',
    (select id from categories where slug = 'data'),
    'Free / $20mo', 'https://julius.ai',
    array['Web'], 4.5, 876, 94, 'New', null, null, true
  ),
  (
    'Descript', 'descript',
    'Edit video and audio like a doc. Remove filler words, add captions, clone your voice, and overdub mistakes.',
    (select id from categories where slug = 'video'),
    'Free / $12mo', 'https://descript.com',
    array['Mac', 'Win', 'Web'], 4.4, 743, 188, null, null, null, true
  )
on conflict (slug) do nothing;

-- BLOG POSTS
insert into blog_posts (title, slug, excerpt, author_name, author_initials, category, read_time, is_published, upvote_count, published_at)
values
  (
    'The 10 Best AI Writing Tools for Marketing Teams in 2026',
    'best-ai-writing-tools-2026',
    'We tested 40+ AI writing tools so you don''t have to. Here are the ones that actually deliver for marketing teams.',
    'Sarah Chen', 'SC', 'Roundup', '8 min', true, 234, now() - interval '3 days'
  ),
  (
    'Cursor vs GitHub Copilot: Which AI Code Editor Actually Wins?',
    'cursor-vs-github-copilot',
    'Both promise to make you 10x faster. After 3 months of daily use, here''s the honest verdict.',
    'Marcus Webb', 'MW', 'Deep Dive', '12 min', true, 189, now() - interval '7 days'
  ),
  (
    'How We Score AI Tools: Our Editorial Criteria Explained',
    'how-we-score-ai-tools',
    'Transparency matters. Here''s the exact 12-point rubric our editors use when reviewing every tool on PromptBulletin.',
    'PromptBulletin Editors', 'PE', 'Guide', '5 min', true, 97, now() - interval '12 days'
  )
on conflict (slug) do nothing;
