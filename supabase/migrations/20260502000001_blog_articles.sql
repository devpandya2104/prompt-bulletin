-- Blog article columns
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'article' CHECK (post_type IN ('article', 'listicle')),
  ADD COLUMN IF NOT EXISTS author_role text,
  ADD COLUMN IF NOT EXISTS author_bio text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS body_blocks jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS list_items jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS related_tool_slug text;

-- Update post types
UPDATE blog_posts SET post_type = 'listicle' WHERE slug = 'best-ai-writing-tools-2026';
UPDATE blog_posts SET post_type = 'article'  WHERE slug = 'cursor-vs-github-copilot';
UPDATE blog_posts SET post_type = 'article'  WHERE slug = 'how-we-score-ai-tools';

-- Author details
UPDATE blog_posts SET
  author_role = 'Senior AI Editor',
  author_bio  = 'Sarah has reviewed 200+ AI tools over 4 years. Former product manager at HubSpot, now obsessed with the intersection of AI and marketing workflows.'
WHERE slug = 'best-ai-writing-tools-2026';

UPDATE blog_posts SET
  author_role = 'Developer Tools Editor',
  author_bio  = 'Marcus spent 6 years as a full-stack engineer before joining PromptBulletin. He tests every dev tool with real production code, not toy projects.'
WHERE slug = 'cursor-vs-github-copilot';

UPDATE blog_posts SET
  author_role = 'Editorial Team',
  author_bio  = 'The PromptBulletin editorial team is a group of AI researchers, engineers, and writers dedicated to unbiased, rigorous AI tool reviews.'
WHERE slug = 'how-we-score-ai-tools';

-- Tags
UPDATE blog_posts SET tags = ARRAY['AI Writing','Marketing','Content Tools','Copywriting','2026'] WHERE slug = 'best-ai-writing-tools-2026';
UPDATE blog_posts SET tags = ARRAY['Code Editors','AI Coding','Developer Tools','Productivity'] WHERE slug = 'cursor-vs-github-copilot';
UPDATE blog_posts SET tags = ARRAY['Editorial','Methodology','Transparency','Reviews'] WHERE slug = 'how-we-score-ai-tools';

-- Body blocks for "cursor-vs-github-copilot"
UPDATE blog_posts SET body_blocks = $$[
  {"type":"h2","id":"intro","text":"The Promise vs. The Reality"},
  {"type":"p","text":"Both Cursor and GitHub Copilot promise to make you dramatically more productive. Cursor markets itself as an AI-first IDE, while Copilot positions as a smart autocomplete layer on top of your existing editor. After three months of using both on real production code — not toy projects — here is what actually matters."},
  {"type":"p","text":"The short version: they are solving different problems. Copilot excels at line-by-line autocomplete. Cursor wins when you need to make large changes across files, understand an unfamiliar codebase, or have a conversation about architecture."},
  {"type":"h2","id":"copilot","text":"GitHub Copilot: Strengths & Weaknesses"},
  {"type":"callout","variant":"info","title":"Who it is for","text":"Developers who love their current editor (VS Code, JetBrains, Vim) and want AI assistance without switching tools. Teams already on GitHub Enterprise."},
  {"type":"p","text":"Copilot's autocomplete is genuinely impressive. It suggests full functions based on context, learns your patterns within a session, and rarely produces code that is outright wrong — just subtly off. The new Copilot Chat feature brings conversational AI into VS Code, but it feels bolted on compared to Cursor's deeply integrated approach."},
  {"type":"p","text":"The biggest limitation: Copilot has no real understanding of your project structure. It cannot refactor across five files simultaneously or explain why a bug is happening in the broader system context."},
  {"type":"h2","id":"cursor","text":"Cursor: Strengths & Weaknesses"},
  {"type":"callout","variant":"tip","title":"Cursor's killer feature","text":"Cmd+K lets you select any code block and describe a change in plain English. Cursor rewrites it, shows a diff, and you accept or reject. This workflow alone justifies the switch for many developers."},
  {"type":"p","text":"Cursor is built on VS Code, so your extensions and muscle memory transfer. The codebase-wide understanding is the real differentiator: add a context file with @ mentions and Cursor will reference your actual schemas, component patterns, and conventions when generating code."},
  {"type":"p","text":"Downsides: it is a separate app, so you are not in your existing IDE. Some enterprise teams will not allow it due to code being sent to Cursor servers. The free tier is limited; you will hit the ceiling quickly on real projects."},
  {"type":"h2","id":"comparison","text":"Head-to-Head Comparison"},
  {"type":"table","headers":["Feature","Cursor","GitHub Copilot"],"rows":[["Autocomplete","Very good","Excellent"],["Multi-file edits","Excellent","Limited"],["Codebase context","Deep (@ mentions)","Shallow"],["Chat integration","Native, seamless","Bolted on"],["Editor","Standalone (VS Code fork)","Plugin for any editor"],["Privacy","Code sent to Cursor","Code sent to GitHub/OpenAI"],["Free tier","500 completions/mo","Unlimited (students/OSS free)"],["Paid","$20/mo","$10/mo ($19 for Business)"]]},
  {"type":"h2","id":"verdict","text":"The Verdict"},
  {"type":"pullquote","text":"If you write code alone or in a small team and you are willing to switch editors, Cursor is the better tool in 2026. If your team lives in GitHub and needs something that just works everywhere, Copilot is the safer bet."},
  {"type":"p","text":"For most individual developers, Cursor is worth the $20/month and the editor switch. The productivity gains on complex tasks — understanding new codebases, large refactors, debugging across files — are substantial and real."},
  {"type":"p","text":"For teams, especially enterprise teams, Copilot's ecosystem integration, privacy controls, and lower per-seat cost make it the pragmatic choice. Copilot is also catching up fast; the gap may narrow significantly in the next 12 months."},
  {"type":"toolcta","tool_name":"Cursor","tool_slug":"cursor","cta_text":"Try Cursor free — 2,000 completions included"}
]$$::jsonb WHERE slug = 'cursor-vs-github-copilot';

-- Body blocks for "how-we-score-ai-tools"
UPDATE blog_posts SET body_blocks = $$[
  {"type":"h2","id":"why","text":"Why Methodology Transparency Matters"},
  {"type":"p","text":"Most AI tool directories are pay-to-rank. A tool's position in a list correlates more with its affiliate commission rate than its actual quality. We built PromptBulletin because we were frustrated with that. Our editorial scores are completely independent from commercial relationships."},
  {"type":"p","text":"Every tool reviewed on PromptBulletin goes through the same 12-point rubric. We score across four categories: Output Quality, Ease of Use, Value, and Reliability. Each category has three sub-criteria, each scored 1-10, and the final score is a weighted average."},
  {"type":"h2","id":"output","text":"Output Quality (35% of score)"},
  {"type":"callout","variant":"info","title":"What we test","text":"We run every tool through a standardized set of test prompts specific to its category. Writing tools get 20 prompts ranging from simple blog intros to complex technical copy. Code tools get 15 real debugging tasks from open-source repos."},
  {"type":"datapoints","items":[{"value":"35%","label":"Output Quality weight"},{"value":"30%","label":"Ease of Use weight"},{"value":"25%","label":"Value weight"},{"value":"10%","label":"Reliability weight"}]},
  {"type":"h2","id":"ease","text":"Ease of Use (30% of score)"},
  {"type":"p","text":"Onboarding speed, interface clarity, and learning curve are tested by having three team members with varying technical backgrounds use the tool for the first time. We measure time-to-first-useful-output, number of support docs consulted, and subjective confusion rating."},
  {"type":"h2","id":"value","text":"Value for Money (25% of score)"},
  {"type":"p","text":"We compare the tool's pricing against comparable alternatives and against the value delivered at each tier. A tool that costs $100/mo but saves a full-time employee 10 hours/week scores better on value than a $10/mo tool that saves 30 minutes."},
  {"type":"h2","id":"reliability","text":"Reliability (10% of score)"},
  {"type":"p","text":"Uptime, consistency of outputs between sessions, and customer support responsiveness. We test tools for at least 30 days before publishing a review. Any tool that changes its pricing or features dramatically after review will have its score updated."},
  {"type":"h2","id":"updates","text":"Score Updates & Re-Reviews"},
  {"type":"pullquote","text":"AI tools move fast. A 9/10 tool today might be a 7/10 in six months. We schedule re-reviews for every major tool at least once per year, and immediately when a tool makes significant changes."},
  {"type":"p","text":"Community upvotes and reviews factor into the displayed rating but are kept separate from the editor score. Both are shown transparently so you can weigh them appropriately."}
]$$::jsonb WHERE slug = 'how-we-score-ai-tools';

-- List items for "best-ai-writing-tools-2026"
UPDATE blog_posts SET list_items = $$[
  {
    "rank": 1,
    "tool_name": "Jasper AI",
    "tool_slug": null,
    "category": "Long-form Content",
    "rating": 4.8,
    "pricing": "$49/mo",
    "has_free_tier": false,
    "verdict": "Best Overall",
    "description": "Jasper remains the gold standard for marketing teams that need consistent, on-brand long-form content at scale. Its Brand Voice feature is genuinely impressive — train it on your existing content and outputs stay tonally consistent even across different writers and templates.",
    "pros": ["Best-in-class Brand Voice training","50+ templates covering every marketing format","Excellent team collaboration features","Integrates with Surfer SEO for optimized content"],
    "cons": ["Expensive — $49/mo is steep for solo creators","Outputs still need editing, especially for technical topics","No native image generation"]
  },
  {
    "rank": 2,
    "tool_name": "Copy.ai",
    "tool_slug": "copy-ai",
    "category": "Marketing Copy",
    "rating": 4.4,
    "pricing": "Free / $49/mo",
    "has_free_tier": true,
    "verdict": "Best Free Tier",
    "description": "Copy.ai's free tier is genuinely useful, not a crippled demo. You get access to most templates and the chat interface without a credit card. For teams, the Workflows feature automates multi-step content pipelines — brief in, full campaign out.",
    "pros": ["Generous free tier with no credit card required","Workflows automate repetitive content tasks","Strong short-form copy (ads, social, emails)","Good for teams with shared workspaces"],
    "cons": ["Long-form content less polished than Jasper","Workflow builder has a learning curve","SEO features are basic"]
  },
  {
    "rank": 3,
    "tool_name": "Notion AI",
    "tool_slug": "notion-ai",
    "category": "Productivity + Writing",
    "rating": 4.3,
    "pricing": "$10/mo add-on",
    "has_free_tier": false,
    "verdict": "Best for Existing Notion Users",
    "description": "If your team already lives in Notion, the AI add-on is a no-brainer. Summarize meeting notes, turn bullet points into blog drafts, ask questions about your project wiki — all without leaving the tool you already use for everything.",
    "pros": ["Seamlessly integrated into existing workflow","Can reference and summarize your own Notion docs","Cheap if you already pay for Notion","Great for drafts and summaries"],
    "cons": ["Not useful if you are not already on Notion","Output quality lags behind dedicated writing tools","Limited templates compared to specialized tools"]
  },
  {
    "rank": 4,
    "tool_name": "Writesonic",
    "tool_slug": null,
    "category": "SEO Content",
    "rating": 4.2,
    "pricing": "Free / $16/mo",
    "has_free_tier": true,
    "verdict": "Best for SEO Content",
    "description": "Writesonic punches above its price with built-in Surfer SEO integration, real-time search grounding via Google, and a surprisingly capable long-form editor. The Chatsonic feature adds web search to the chat interface so outputs reference current information.",
    "pros": ["Built-in SEO optimization with Surfer integration","Real-time web search for current information","Affordable starting price","Good factual accuracy compared to competitors"],
    "cons": ["UI feels cluttered","Brand voice features less refined than Jasper","Some templates produce generic outputs"]
  },
  {
    "rank": 5,
    "tool_name": "Rytr",
    "tool_slug": null,
    "category": "Budget Writing",
    "rating": 4.0,
    "pricing": "Free / $9/mo",
    "has_free_tier": true,
    "verdict": "Best Budget Pick",
    "description": "At $9/mo, Rytr is the most affordable paid AI writing tool worth recommending. It is not trying to be Jasper — it is a fast, simple tool for writers who need quick drafts and short-form content without a complex interface.",
    "pros": ["Cheapest credible paid option at $9/mo","Simple, fast interface — no learning curve","Good for short-form content and quick drafts","40+ use case templates"],
    "cons": ["Long-form content is noticeably weaker","No SEO integration","Limited customization for brand voice","Not suitable for high-volume content teams"]
  }
]$$::jsonb WHERE slug = 'best-ai-writing-tools-2026';
