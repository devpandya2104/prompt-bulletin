export const CATEGORIES = [
  { id: 'writing',      label: 'Writing & Copy',    count: 142, icon: '✍️' },
  { id: 'image',        label: 'Image Generation',  count: 98,  icon: '🎨' },
  { id: 'code',         label: 'Code & Dev',         count: 87,  icon: '💻' },
  { id: 'video',        label: 'Video & Media',      count: 64,  icon: '🎬' },
  { id: 'data',         label: 'Data & Analytics',   count: 53,  icon: '📊' },
  { id: 'productivity', label: 'Productivity',       count: 119, icon: '⚡' },
  { id: 'research',     label: 'Research',           count: 41,  icon: '🔍' },
  { id: 'audio',        label: 'Audio & Voice',      count: 38,  icon: '🎙️' },
];

export const TOOLS = [
  { id: 1,  name: 'Perplexity AI', category: 'research',     tag: "Editor's Choice", tagType: 'editor', desc: 'AI-powered search engine that synthesizes real-time web information into cited, conversational answers.',          pricing: 'Free / $20mo',   upvotes: 2841, rating: 4.8, badge: 'Trending' as const, reviews: 312, platforms: ['Web', 'iOS', 'Android'] },
  { id: 2,  name: 'Cursor',        category: 'code',         tag: 'Top Rated',       tagType: 'top',    desc: 'AI-first code editor built on VS Code. Understands your codebase and writes, edits, and debugs alongside you.', pricing: 'Free / $20mo',   upvotes: 2204, rating: 4.9, badge: 'Hot' as const,      reviews: 198, platforms: ['Mac', 'Win', 'Linux'] },
  { id: 3,  name: 'Midjourney',    category: 'image',        tag: "Editor's Choice", tagType: 'editor', desc: 'Industry-leading image generation model. Creates stunning, photorealistic or artistic visuals from text prompts.', pricing: '$10–$60/mo',    upvotes: 1983, rating: 4.7, badge: null,                reviews: 445, platforms: ['Discord', 'Web'] },
  { id: 4,  name: 'Copy.ai',       category: 'writing',      tag: null,              tagType: null,     desc: 'AI writing platform for marketing teams. Generate blog posts, ad copy, social content, and sales emails at scale.', pricing: 'Free / $49mo',  upvotes: 1456, rating: 4.4, badge: null,                reviews: 231, platforms: ['Web'] },
  { id: 5,  name: 'ElevenLabs',    category: 'audio',        tag: 'Top Rated',       tagType: 'top',    desc: 'Ultra-realistic AI voice synthesis and cloning. Used by podcasters, audiobook producers, and content creators.',  pricing: 'Free / $22mo',  upvotes: 1389, rating: 4.8, badge: 'New' as const,      reviews: 167, platforms: ['Web', 'API'] },
  { id: 6,  name: 'Notion AI',     category: 'productivity', tag: null,              tagType: null,     desc: 'AI built into Notion. Summarize docs, generate content, and answer questions about your workspace without leaving your notes.', pricing: '$10/mo add-on', upvotes: 1244, rating: 4.3, badge: null, reviews: 289, platforms: ['Web', 'Mac', 'iOS', 'Android'] },
  { id: 7,  name: 'RunwayML',      category: 'video',        tag: "Editor's Choice", tagType: 'editor', desc: 'Professional AI video generation and editing. Gen-3 Alpha creates cinematic video clips from text or images.',     pricing: 'Free / $15mo',  upvotes: 1102, rating: 4.6, badge: 'Trending' as const, reviews: 143, platforms: ['Web'] },
  { id: 8,  name: 'Julius AI',     category: 'data',         tag: null,              tagType: null,     desc: 'AI data analyst. Upload CSV or connect databases; Julius writes Python/SQL, creates charts, and explains findings.', pricing: 'Free / $20mo', upvotes: 876,  rating: 4.5, badge: 'New' as const,      reviews: 94,  platforms: ['Web'] },
  { id: 9,  name: 'Descript',      category: 'video',        tag: null,              tagType: null,     desc: 'Edit video and audio like a doc. Remove filler words, add captions, clone your voice, and overdub mistakes.',      pricing: 'Free / $12mo',  upvotes: 743,  rating: 4.4, badge: null,                reviews: 188, platforms: ['Mac', 'Win', 'Web'] },
];

export const BLOG_POSTS = [
  { id: 1, category: 'Roundup',   title: 'The 10 Best AI Writing Tools for Marketing Teams in 2026',      author: 'Sarah Chen',             date: 'Apr 28, 2026', readTime: '8 min',  upvotes: 234 },
  { id: 2, category: 'Deep Dive', title: 'Cursor vs GitHub Copilot: Which AI Code Editor Actually Wins?', author: 'Marcus Webb',            date: 'Apr 24, 2026', readTime: '12 min', upvotes: 189 },
  { id: 3, category: 'Guide',     title: 'How We Score AI Tools: Our Editorial Criteria Explained',        author: 'PromptBulletin Editors', date: 'Apr 19, 2026', readTime: '5 min',  upvotes: 97 },
];

export const FAQS = [
  { q: 'How are tools selected and reviewed?',                   a: 'Every tool on PromptBulletin goes through our editorial review process. Editors test each tool hands-on, using a standardized rubric covering performance, value, documentation quality, and support. Community upvotes surface additional signals, but editorial scores are always independent.' },
  { q: 'Can I submit a tool I built or use?',                    a: "Yes! Use the Submit a Tool form and our team will review it within 5 business days. We accept submissions from developers, vendors, and regular users. We'll notify you by email about the status of your submission." },
  { q: 'Are rankings influenced by advertising or sponsorships?',a: 'No. Sponsored listings are always clearly labeled with a "Sponsored" badge and never appear in organic ranked results. Our editorial ratings and community upvotes are entirely independent from commercial relationships.' },
  { q: 'How do community upvotes work?',                         a: 'Registered members get one upvote per tool. Upvotes factor into our Trending and Top Rated sorts alongside a time-decay formula, so recency matters. We use rate limiting and behavioral analysis to prevent vote manipulation.' },
  { q: "What does the Editor's Choice badge mean?",              a: "Editor's Choice tools have been tested extensively and scored in the top tier for their category. They represent our strongest recommendations and are updated quarterly as the landscape evolves." },
];

export const TEAM = [
  { name: 'Sarah Chen',  role: 'Editor-in-Chief', bio: 'Former tech journalist, 8 years covering AI and developer tools.',   initials: 'SC' },
  { name: 'Marcus Webb', role: 'Lead Reviewer',   bio: 'Full-stack dev turned content creator. Tests 30+ tools per month.',  initials: 'MW' },
  { name: 'Priya Nair',  role: 'SEO & Growth',    bio: 'Built three content sites to 1M+ organic. Obsessed with structure.', initials: 'PN' },
  { name: 'James Park',  role: 'Community Lead',  bio: 'Manages submissions, moderation, and contributor relations.',        initials: 'JP' },
];
