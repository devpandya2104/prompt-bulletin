-- ============================================================
-- PromptBulletin — Tool Detail Migration
-- Run AFTER schema.sql and seed.sql in your Supabase SQL Editor
-- ============================================================

-- Add detail columns to tools table
alter table tools
  add column if not exists tagline        text,
  add column if not exists summary        text,
  add column if not exists pros           text[] default '{}',
  add column if not exists cons           text[] default '{}',
  add column if not exists best_for       text[] default '{}',
  add column if not exists company        text,
  add column if not exists founded        text,
  add column if not exists editor_rating  numeric(3,1) default 0,
  add column if not exists scores         jsonb default '[]',
  add column if not exists tool_features  jsonb default '[]',
  add column if not exists pricing_tiers  jsonb default '[]';

-- TOOL REVIEWS
create table if not exists tool_reviews (
  id              uuid default gen_random_uuid() primary key,
  tool_id         uuid references tools(id) on delete cascade not null,
  author_name     text not null,
  author_initials text not null,
  role            text not null default '',
  rating          integer not null check (rating between 1 and 5),
  date_text       text not null default '',
  review_text     text not null,
  helpful_count   integer default 0,
  created_at      timestamptz default now()
);

alter table tool_reviews enable row level security;
create policy "reviews_public_read"  on tool_reviews for select using (true);
create policy "reviews_auth_insert"  on tool_reviews for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- Seed Perplexity AI with full detail data
-- ============================================================

update tools set
  tagline       = 'The AI answer engine for the web',
  summary       = E'Perplexity AI is an AI-powered answer engine that goes beyond traditional search. Instead of returning a list of blue links, it synthesizes information from multiple web sources in real time, presenting a clear, cited answer. Think of it as a research assistant that reads the web for you.\n\nWhat sets Perplexity apart is its commitment to transparency: every claim is backed by inline citations so you can verify sources instantly. The Pro plan unlocks access to GPT-4o, Claude 3.5 Sonnet, and Gemini Ultra — making it a model-agnostic research powerhouse.',
  pros          = array[
    'Real-time web access with cited, verifiable sources',
    'Supports multiple frontier models (GPT-4o, Claude, Gemini)',
    'Follow-up question chaining keeps context alive',
    'Copilot mode for guided, iterative research',
    'Clean, fast interface with excellent mobile apps',
    'Free tier is genuinely useful'
  ],
  cons          = array[
    'Can occasionally hallucinate or misattribute sources',
    'Pro plan ($20/mo) required for advanced models',
    'No persistent memory or long-term project management',
    'Weaker for highly technical code generation vs Cursor'
  ],
  best_for      = array['Marketers', 'Researchers', 'Journalists', 'Students', 'Product managers'],
  company       = 'Perplexity AI, Inc.',
  founded       = '2022',
  editor_rating = 4.8,
  scores        = '[
    {"label": "Accuracy",         "score": 9.4},
    {"label": "Speed",            "score": 9.1},
    {"label": "Source quality",   "score": 8.8},
    {"label": "UX & Design",      "score": 8.5},
    {"label": "Value for money",  "score": 9.0}
  ]'::jsonb,
  tool_features = '[
    {"name": "Real-time web search",      "included": true},
    {"name": "Inline source citations",   "included": true},
    {"name": "GPT-4o access",             "included": "Pro"},
    {"name": "Claude 3.5 Sonnet",         "included": "Pro"},
    {"name": "Image search & generation", "included": "Pro"},
    {"name": "File upload & analysis",    "included": "Pro"},
    {"name": "API access",                "included": "Pro"},
    {"name": "Spaces (team collab)",      "included": false}
  ]'::jsonb,
  pricing_tiers = '[
    {
      "name": "Free", "price": "$0", "period": "forever", "highlight": false,
      "features": ["5 Pro searches/day", "Standard AI model", "Web citations", "Mobile apps", "Basic file upload"]
    },
    {
      "name": "Pro", "price": "$20", "period": "per month", "highlight": true,
      "features": ["Unlimited Pro searches", "GPT-4o, Claude, Gemini", "Unlimited file uploads", "Image generation", "API access (1,000 req/mo)"]
    },
    {
      "name": "Enterprise", "price": "Custom", "period": "per seat", "highlight": false,
      "features": ["SSO & admin controls", "Private data indexing", "Dedicated support", "SLA guarantees", "Custom integrations"]
    }
  ]'::jsonb
where slug = 'perplexity-ai';

-- Seed detail for Cursor
update tools set
  tagline       = 'The AI-first code editor',
  summary       = E'Cursor is an AI-first fork of VS Code that brings your entire codebase into context. It understands your project structure, reads relevant files automatically, and writes code that fits your existing patterns.\n\nThe Tab autocomplete is eerily good — it predicts multi-line edits before you finish typing. The Chat sidebar lets you ask questions about your code, refactor functions, or generate entire features. For professional developers, Cursor has become an essential daily tool.',
  pros          = array[
    'Best-in-class Tab autocomplete with multi-line prediction',
    'Full codebase context — it reads all your files',
    'Composer mode for generating entire features at once',
    'Familiar VS Code interface, all your extensions work',
    'Agent mode can run terminal commands automatically',
    'Works with any language or framework'
  ],
  cons          = array[
    'Subscription required for best models (GPT-4o, Claude)',
    'Can make confident but incorrect suggestions',
    'Heavy on resources — slower on older machines',
    'Privacy: code is sent to AI providers'
  ],
  best_for      = array['Software engineers', 'Full-stack developers', 'Data scientists', 'DevOps engineers'],
  company       = 'Anysphere',
  founded       = '2023',
  editor_rating = 4.9,
  scores        = '[
    {"label": "Code quality",    "score": 9.6},
    {"label": "Speed",           "score": 9.2},
    {"label": "Context depth",   "score": 9.5},
    {"label": "UX & Design",     "score": 8.9},
    {"label": "Value for money", "score": 9.1}
  ]'::jsonb,
  tool_features = '[
    {"name": "Tab autocomplete",         "included": true},
    {"name": "Chat sidebar",             "included": true},
    {"name": "GPT-4o access",            "included": "Pro"},
    {"name": "Claude Sonnet access",     "included": "Pro"},
    {"name": "Composer / Agent mode",    "included": "Pro"},
    {"name": "Codebase indexing",        "included": true},
    {"name": "Terminal integration",     "included": "Pro"},
    {"name": "Team workspace",           "included": "Business"}
  ]'::jsonb,
  pricing_tiers = '[
    {
      "name": "Hobby", "price": "$0", "period": "forever", "highlight": false,
      "features": ["2,000 code completions/mo", "50 slow premium requests", "VS Code compatible", "All languages"]
    },
    {
      "name": "Pro", "price": "$20", "period": "per month", "highlight": true,
      "features": ["Unlimited completions", "500 fast premium requests", "GPT-4o & Claude", "Composer & Agent mode"]
    },
    {
      "name": "Business", "price": "$40", "period": "per seat/mo", "highlight": false,
      "features": ["Centralized billing", "Admin dashboard", "Privacy mode", "SSO support"]
    }
  ]'::jsonb
where slug = 'cursor';

-- ============================================================
-- Sample reviews for Perplexity AI
-- ============================================================
insert into tool_reviews (tool_id, author_name, author_initials, role, rating, date_text, review_text, helpful_count)
select
  t.id,
  r.author_name, r.author_initials, r.role, r.rating, r.date_text, r.review_text, r.helpful_count
from tools t
cross join (values
  ('Ana R.',   'AR', 'Product Manager',    5, 'Apr 22, 2026', 'Replaced Google for 90% of my research. The cited sources are the killer feature — I can actually trust the answers.', 48),
  ('Dev K.',   'DK', 'Software Engineer',  4, 'Apr 15, 2026', 'Great for quick research lookups. Occasionally gets confused with very recent events. Pro is worth it for Claude access alone.', 31),
  ('Maria T.', 'MT', 'Content Strategist', 5, 'Apr 10, 2026', 'My go-to for competitor research and market overviews. The follow-up chaining is insanely useful — you can drill 5 levels deep on any topic.', 27),
  ('James L.', 'JL', 'Journalist',         4, 'Apr 2, 2026',  'Solid tool. The source quality varies — sometimes it pulls from low-authority sites. But the speed is unmatched for initial research.', 19)
) as r(author_name, author_initials, role, rating, date_text, review_text, helpful_count)
where t.slug = 'perplexity-ai'
on conflict do nothing;

-- Sample reviews for Cursor
insert into tool_reviews (tool_id, author_name, author_initials, role, rating, date_text, review_text, helpful_count)
select
  t.id,
  r.author_name, r.author_initials, r.role, r.rating, r.date_text, r.review_text, r.helpful_count
from tools t
cross join (values
  ('Priya S.', 'PS', 'Full-Stack Dev',    5, 'Apr 28, 2026', 'I genuinely cannot go back to VS Code without Cursor. The Tab autocomplete alone saves me an hour a day.', 62),
  ('Tom W.',   'TW', 'Backend Engineer',  5, 'Apr 20, 2026', 'Composer mode is a game changer for scaffolding. I built a full CRUD API in 15 minutes. Highly recommend.', 44),
  ('Lisa K.',  'LK', 'Data Scientist',    4, 'Apr 8, 2026',  'Works great for Python and data pipelines. Occasionally overwrites code I wanted to keep — you still need to review everything.', 28)
) as r(author_name, author_initials, role, rating, date_text, review_text, helpful_count)
where t.slug = 'cursor'
on conflict do nothing;
