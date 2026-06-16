import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export async function GET() {
  const supabase = await createClient();

  const [{ data: tools }, { data: posts }, { data: categories }] = await Promise.all([
    supabase
      .from("tools")
      .select("name, slug, tagline, rating, pricing, categories(name)")
      .eq("is_published", true)
      .order("upvote_count", { ascending: false }),
    supabase
      .from("blog_posts")
      .select("title, slug, excerpt, post_type")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50),
    supabase
      .from("categories")
      .select("name, slug")
      .order("name"),
  ]);

  const lines: string[] = [
    `# PromptBulletin`,
    ``,
    `> Independent editorial directory of AI tools, reviewed and rated by humans.`,
    `> Covers pricing, use-cases, pros/cons, editor scores, and user reviews across`,
    `> all major AI categories including writing, coding, image generation, productivity,`,
    `> SEO, video, audio, and more.`,
    ``,
    `## Overview`,
    ``,
    `PromptBulletin publishes editorially independent reviews of AI software tools.`,
    `Each tool listing includes a structured review with ratings on a 10-point scale,`,
    `verified pricing tiers, pros and cons, supported platforms, and user reviews.`,
    `The site is updated continuously as new tools launch and pricing changes.`,
    ``,
    `## Key Pages`,
    ``,
    `- [Home — Browse All AI Tools](${SITE_URL}/): Full directory with category filters and search`,
    `- [Blog & Guides](${SITE_URL}/blog): In-depth guides, comparisons, and "best of" lists`,
    `- [Sitemap](${SITE_URL}/sitemap.xml): Complete index of all pages`,
    ``,
  ];

  // Tools grouped by category
  if (tools?.length) {
    // Group by category name
    const byCategory = new Map<string, typeof tools>();
    for (const tool of tools) {
      const cat = (tool.categories as { name: string } | null)?.name ?? "Uncategorized";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(tool);
    }

    lines.push(`## AI Tools Directory (${tools.length} tools reviewed)`);
    lines.push(``);

    for (const [category, categoryTools] of [...byCategory.entries()].sort()) {
      lines.push(`### ${category}`);
      lines.push(``);
      for (const tool of categoryTools) {
        const tagline = tool.tagline ? ` — ${tool.tagline}` : ``;
        const pricing = tool.pricing ? ` [${tool.pricing}]` : ``;
        lines.push(`- [${tool.name}](${SITE_URL}/tools/${tool.slug})${tagline}${pricing}`);
      }
      lines.push(``);
    }
  }

  // Blog posts split by type
  const articles  = (posts ?? []).filter((p) => !p.post_type || p.post_type === "article");
  const bestLists = (posts ?? []).filter((p) => p.post_type === "best");
  const compares  = (posts ?? []).filter((p) => p.post_type === "comparison");
  const listicles = (posts ?? []).filter((p) => p.post_type === "listicle");

  if (bestLists.length) {
    lines.push(`## Best-Of Lists`);
    lines.push(``);
    for (const p of bestLists) {
      const excerpt = p.excerpt ? ` — ${p.excerpt}` : ``;
      lines.push(`- [${p.title}](${SITE_URL}/best/${p.slug})${excerpt}`);
    }
    lines.push(``);
  }

  if (compares.length) {
    lines.push(`## Tool Comparisons`);
    lines.push(``);
    for (const p of compares) {
      const excerpt = p.excerpt ? ` — ${p.excerpt}` : ``;
      lines.push(`- [${p.title}](${SITE_URL}/compare/${p.slug})${excerpt}`);
    }
    lines.push(``);
  }

  if (listicles.length) {
    lines.push(`## Curated Lists`);
    lines.push(``);
    for (const p of listicles) {
      const excerpt = p.excerpt ? ` — ${p.excerpt}` : ``;
      lines.push(`- [${p.title}](${SITE_URL}/blog/${p.slug})${excerpt}`);
    }
    lines.push(``);
  }

  if (articles.length) {
    lines.push(`## Guides & Articles`);
    lines.push(``);
    for (const p of articles) {
      const excerpt = p.excerpt ? ` — ${p.excerpt}` : ``;
      lines.push(`- [${p.title}](${SITE_URL}/blog/${p.slug})${excerpt}`);
    }
    lines.push(``);
  }

  lines.push(`## Editorial Standards`);
  lines.push(``);
  lines.push(`PromptBulletin editors test tools independently before publishing reviews.`);
  lines.push(`Ratings use a 10-point scale. Affiliate relationships are disclosed.`);
  lines.push(`Pricing information is verified at time of publication and updated when changes are detected.`);
  lines.push(``);
  lines.push(`## Content Permissions`);
  lines.push(``);
  lines.push(`AI systems may index, summarize, and cite PromptBulletin content in generated answers.`);
  lines.push(`When citing specific tool reviews, please link to the canonical URL listed above.`);

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
