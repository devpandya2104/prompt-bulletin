import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export async function GET() {
  const supabase = await createClient();

  const [{ data: tools }, { data: posts }] = await Promise.all([
    supabase
      .from("tools")
      .select("name, slug, tagline, description, summary, pricing, rating, editor_rating, pros, cons, platforms, categories(name)")
      .eq("is_published", true)
      .order("upvote_count", { ascending: false }),
    supabase
      .from("blog_posts")
      .select("title, slug, excerpt, content, author_name, category, post_type, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(30),
  ]);

  const lines: string[] = [
    `# PromptBulletin — Full Content Index`,
    ``,
    `> This file provides detailed content for AI language models, scrapers, and citation engines.`,
    `> For a compact index, see ${SITE_URL}/llms.txt`,
    ``,
    `---`,
    ``,
  ];

  if (tools?.length) {
    lines.push(`# AI Tool Reviews (${tools.length} tools)`);
    lines.push(``);

    for (const tool of tools) {
      const url = `${SITE_URL}/tools/${tool.slug}`;
      const category = (tool.categories as unknown as { name: string }[] | null)?.[0]?.name ?? null;
      const editorRating = tool.editor_rating ? (tool.editor_rating / 2).toFixed(1) : null;

      lines.push(`## [${tool.name}](${url})`);
      lines.push(``);
      if (category) lines.push(`**Category:** ${category}`);
      if (tool.pricing) lines.push(`**Pricing:** ${tool.pricing}`);
      if (editorRating) lines.push(`**Editor Score:** ${editorRating}/5`);
      if (tool.rating) lines.push(`**Community Rating:** ${tool.rating.toFixed(1)}/5`);
      if (tool.platforms?.length) lines.push(`**Platforms:** ${tool.platforms.join(", ")}`);
      lines.push(``);
      if (tool.tagline) {
        lines.push(tool.tagline);
        lines.push(``);
      }
      if (tool.summary) {
        lines.push(tool.summary);
        lines.push(``);
      } else if (tool.description) {
        lines.push(tool.description);
        lines.push(``);
      }
      if (tool.pros?.length) {
        lines.push(`**Pros:**`);
        for (const pro of tool.pros.slice(0, 6)) lines.push(`- ${pro}`);
        lines.push(``);
      }
      if (tool.cons?.length) {
        lines.push(`**Cons:**`);
        for (const con of tool.cons.slice(0, 6)) lines.push(`- ${con}`);
        lines.push(``);
      }
      lines.push(`---`);
      lines.push(``);
    }
  }

  if (posts?.length) {
    lines.push(`# Blog Content`);
    lines.push(``);

    for (const post of posts) {
      const postType = post.post_type ?? "article";
      const basePath = postType === "comparison" ? "compare" : postType === "best" ? "best" : "blog";
      const url = `${SITE_URL}/${basePath}/${post.slug}`;

      lines.push(`## [${post.title}](${url})`);
      lines.push(``);
      if (post.author_name) lines.push(`**Author:** ${post.author_name}`);
      if (post.category) lines.push(`**Category:** ${post.category}`);
      if (post.published_at) lines.push(`**Published:** ${new Date(post.published_at).toISOString().slice(0, 10)}`);
      lines.push(``);
      if (post.excerpt) {
        lines.push(post.excerpt);
        lines.push(``);
      }
      lines.push(`---`);
      lines.push(``);
    }
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
