// ── Types ─────────────────────────────────────────────────────────────────────

export type HeroConfig = {
  badge: string;
  headline1: string;
  headline2: string;
  subheading: string;
  searchPlaceholder: string;
  stats: { value: string; label: string }[];
  quickFilters: string[];
};

export type DiscoverConfig = {
  eyebrow: string;
  heading: string;
};

export type CategoriesConfig = {
  eyebrow: string;
  heading: string;
  viewAllLabel: string;
  viewAllHref: string;
};

export type FeaturesConfig = {
  eyebrow: string;
  heading: string;
  subheading: string;
  items: { icon: string; title: string; desc: string }[];
};

export type BlogSectionConfig = {
  eyebrow: string;
  heading: string;
  viewAllLabel: string;
  viewAllHref: string;
};

export type SubmitConfig = {
  eyebrow: string;
  heading: string;
  subheading: string;
  description: string;
  perks: string[];
};

export type AboutConfig = {
  eyebrow: string;
  heading: string;
  para1: string;
  para2: string;
  stats: { value: string; label: string }[];
  teamHeading: string;
  team: { name: string; role: string; bio: string; initials: string }[];
};

export type FAQConfig = {
  eyebrow: string;
  heading: string;
  items: { q: string; a: string }[];
};

export type NewsletterConfig = {
  heading: string;
  subheading: string;
  placeholder: string;
};

export type NavbarConfig = {
  logoName: string;
  links: { label: string; href: string }[];
};

export type FooterConfig = {
  description: string;
  columns: { title: string; links: { label: string; href: string }[] }[];
  copyright: string;
  legalLinks: { label: string; href: string }[];
};

export type SiteConfig = {
  hero: HeroConfig;
  discover: DiscoverConfig;
  categories: CategoriesConfig;
  features: FeaturesConfig;
  blog: BlogSectionConfig;
  submit: SubmitConfig;
  about: AboutConfig;
  faq: FAQConfig;
  newsletter: NewsletterConfig;
  navbar: NavbarConfig;
  footer: FooterConfig;
};

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_HERO: HeroConfig = {
  badge: "1,200+ AI tools curated by real editors",
  headline1: "Find the right AI tool.",
  headline2: "Trust the review.",
  subheading: "Editorial reviews, real upvotes, and structured comparisons — so you can discover the best AI tools in under 3 minutes.",
  searchPlaceholder: "Search tools, categories, or use cases…",
  stats: [
    { value: "1,200+", label: "Tools reviewed" },
    { value: "48K",    label: "Community members" },
    { value: "4.8★",   label: "Avg editor score" },
  ],
  quickFilters: ["Writing", "Image Gen", "Coding", "Video", "Productivity"],
};

export const DEFAULT_DISCOVER: DiscoverConfig = {
  eyebrow: "Featured tools",
  heading: "Top-rated this month",
};

export const DEFAULT_CATEGORIES: CategoriesConfig = {
  eyebrow: "Browse by category",
  heading: "Every use case, covered",
  viewAllLabel: "View all",
  viewAllHref: "#",
};

export const DEFAULT_FEATURES: FeaturesConfig = {
  eyebrow: "Why PromptBulletin",
  heading: "Built for people who hate noise",
  subheading: "We do the research. You get the shortlist.",
  items: [
    { icon: "◎", title: "Editorial Reviews",    desc: "Every tool reviewed hands-on using a standardized 12-point rubric. No sponsored rankings in organic results — ever." },
    { icon: "▲", title: "Community Upvoting",   desc: "One vote per member, with anti-fraud detection. Rankings reflect real user enthusiasm, not astroturfing." },
    { icon: "⊞", title: "Side-by-Side Compare", desc: "Pick any two tools in the same category and see pricing, features, and ratings in a structured comparison table." },
    { icon: "◈", title: "Structured Data",      desc: "Every listing includes pricing tiers, platforms, pros/cons, and \"best for\" use cases — not just fluffy prose." },
    { icon: "◆", title: "Save & Collect",       desc: "Bookmark tools and organize them into private or shareable collections for your team." },
    { icon: "⚡", title: "Fast Search",          desc: "Keyword search with autocomplete, filters by category, price, and platform. Results in under 200ms." },
  ],
};

export const DEFAULT_BLOG: BlogSectionConfig = {
  eyebrow: "From the editors",
  heading: "Latest articles",
  viewAllLabel: "All articles",
  viewAllHref: "/blog",
};

export const DEFAULT_SUBMIT: SubmitConfig = {
  eyebrow: "Submit your tool",
  heading: "Built something great?",
  subheading: "Get in front of 48K professionals.",
  description: "Submit your AI tool and our editors will review it within 5 business days. Listings are free and always will be.",
  perks: [
    "Free to list — always",
    "Editorial review in 5 business days",
    "Status updates via email",
    "Update your listing at any time",
  ],
};

export const DEFAULT_ABOUT: AboutConfig = {
  eyebrow: "Our mission",
  heading: "Unbiased. Thorough. Built for trust.",
  para1: "PromptBulletin was founded by a team of journalists, developers, and marketers who were exhausted by listicles stuffed with affiliate links and zero editorial integrity.",
  para2: "We built the platform we wished existed — one where a 4.8★ score means something, and where \"Editor's Choice\" is earned, not purchased.",
  stats: [
    { value: "2024",   label: "Founded" },
    { value: "1,200+", label: "Tools indexed" },
    { value: "48K",    label: "Members" },
    { value: "100%",   label: "Editorial independence" },
  ],
  teamHeading: "The team",
  team: [
    { name: "Sarah Chen",  role: "Editor-in-Chief", bio: "Former tech journalist, 8 years covering AI and developer tools.",   initials: "SC" },
    { name: "Marcus Webb", role: "Lead Reviewer",   bio: "Full-stack dev turned content creator. Tests 30+ tools per month.",  initials: "MW" },
    { name: "Priya Nair",  role: "SEO & Growth",    bio: "Built three content sites to 1M+ organic. Obsessed with structure.", initials: "PN" },
    { name: "James Park",  role: "Community Lead",  bio: "Manages submissions, moderation, and contributor relations.",        initials: "JP" },
  ],
};

export const DEFAULT_FAQ: FAQConfig = {
  eyebrow: "FAQ",
  heading: "Frequently asked questions",
  items: [
    { q: "How are tools selected and reviewed?",                    a: "Every tool on PromptBulletin goes through our editorial review process. Editors test each tool hands-on, using a standardized rubric covering performance, value, documentation quality, and support. Community upvotes surface additional signals, but editorial scores are always independent." },
    { q: "Can I submit a tool I built or use?",                     a: "Yes! Use the Submit a Tool form and our team will review it within 5 business days. We accept submissions from developers, vendors, and regular users. We'll notify you by email about the status of your submission." },
    { q: "Are rankings influenced by advertising or sponsorships?", a: "No. Sponsored listings are always clearly labeled with a \"Sponsored\" badge and never appear in organic ranked results. Our editorial ratings and community upvotes are entirely independent from commercial relationships." },
    { q: "How do community upvotes work?",                          a: "Registered members get one upvote per tool. Upvotes factor into our Trending and Top Rated sorts alongside a time-decay formula, so recency matters. We use rate limiting and behavioral analysis to prevent vote manipulation." },
    { q: "What does the Editor's Choice badge mean?",               a: "Editor's Choice tools have been tested extensively and scored in the top tier for their category. They represent our strongest recommendations and are updated quarterly as the landscape evolves." },
  ],
};

export const DEFAULT_NEWSLETTER: NewsletterConfig = {
  heading: "Stay ahead of the AI curve",
  subheading: "Weekly roundups of new tools, editor picks, and community trends. No fluff.",
  placeholder: "your@email.com",
};

export const DEFAULT_NAVBAR: NavbarConfig = {
  logoName: "PromptBulletin",
  links: [
    { label: "Discover",      href: "/#discover" },
    { label: "Categories",    href: "/#categories" },
    { label: "Blog",          href: "/blog" },
    { label: "About",         href: "/#about" },
    { label: "Submit a Tool", href: "/#submit" },
  ],
};

export const DEFAULT_FOOTER: FooterConfig = {
  description: "Curated AI tool reviews and comparisons for marketers, developers, and creators. Independent. Thorough. Trustworthy.",
  columns: [
    { title: "Discover",  links: [{ label: "Writing & Copy", href: "#" }, { label: "Image Generation", href: "#" }, { label: "Code & Dev", href: "#" }, { label: "Productivity", href: "#" }, { label: "Video & Media", href: "#" }] },
    { title: "Company",   links: [{ label: "About", href: "/#about" }, { label: "Blog", href: "/blog" }, { label: "Editorial Standards", href: "#" }, { label: "Advertise", href: "#" }] },
    { title: "Community", links: [{ label: "Submit a Tool", href: "/#submit" }, { label: "Sign Up", href: "#" }, { label: "Newsletter", href: "#" }, { label: "Contact", href: "#" }] },
  ],
  copyright: "© 2026 PromptBulletin. All rights reserved.",
  legalLinks: [
    { label: "Privacy",     href: "#" },
    { label: "Terms",       href: "#" },
    { label: "Disclosures", href: "#" },
  ],
};

export const DEFAULT_CONFIG: SiteConfig = {
  hero: DEFAULT_HERO,
  discover: DEFAULT_DISCOVER,
  categories: DEFAULT_CATEGORIES,
  features: DEFAULT_FEATURES,
  blog: DEFAULT_BLOG,
  submit: DEFAULT_SUBMIT,
  about: DEFAULT_ABOUT,
  faq: DEFAULT_FAQ,
  newsletter: DEFAULT_NEWSLETTER,
  navbar: DEFAULT_NAVBAR,
  footer: DEFAULT_FOOTER,
};

