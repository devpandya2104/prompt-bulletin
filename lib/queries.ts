import { createClient } from "./supabase/client";

export type ToolScore = { label: string; score: number };
export type ToolFeature = { name: string; included: boolean | string };
export type PricingTier = { name: string; price: string; period: string; highlight: boolean; features: string[] };

export type ToolReview = {
  id: string;
  tool_id: string;
  author_name: string;
  author_initials: string;
  role: string;
  rating: number;
  date_text: string;
  review_text: string;
  helpful_count: number;
};

export type ToolDetail = Tool & {
  tagline: string | null;
  summary: string | null;
  pros: string[];
  cons: string[];
  best_for: string[];
  company: string | null;
  founded: string | null;
  editor_rating: number;
  scores: ToolScore[];
  tool_features: ToolFeature[];
  pricing_tiers: PricingTier[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  tool_count?: number;
};

export type Tool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  pricing: string;
  website_url: string | null;
  platforms: string[];
  rating: number;
  upvote_count: number;
  review_count: number;
  badge: "Trending" | "Hot" | "New" | null;
  tag: string | null;
  tag_type: "editor" | "top" | null;
  categories?: { name: string; slug: string } | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_name: string;
  author_initials: string;
  category: string;
  read_time: string;
  cover_image_url: string | null;
  upvote_count: number;
  published_at: string | null;
};

export type BodyBlock =
  | { type: "h2"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "callout"; variant: "info" | "tip" | "warning"; title: string; text: string }
  | { type: "pullquote"; text: string }
  | { type: "datapoints"; items: { value: string; label: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "toolcta"; tool_name: string; tool_slug: string; cta_text: string };

export type ListItem = {
  rank: number;
  tool_name: string;
  tool_slug: string | null;
  category: string;
  rating: number;
  pricing: string;
  has_free_tier: boolean;
  verdict: string;
  description: string;
  pros: string[];
  cons: string[];
};

export type BlogPostDetail = BlogPost & {
  post_type: "article" | "listicle";
  author_role: string | null;
  author_bio: string | null;
  tags: string[];
  body_blocks: BodyBlock[];
  list_items: ListItem[];
  related_tool_slug: string | null;
};

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  return data ?? [];
}

export async function getTools(options?: {
  category?: string;
  sort?: "upvotes" | "rating" | "newest";
  pricing?: "free" | "paid";
}): Promise<Tool[]> {
  const supabase = createClient();
  let query = supabase
    .from("tools")
    .select("*, categories(name, slug)")
    .eq("is_published", true);

  if (options?.category && options.category !== "all") {
    query = query.eq("categories.slug", options.category);
  }
  if (options?.pricing === "free") {
    query = query.ilike("pricing", "%free%");
  }
  if (options?.pricing === "paid") {
    query = query.not("pricing", "ilike", "%free%");
  }
  if (options?.sort === "rating") {
    query = query.order("rating", { ascending: false });
  } else if (options?.sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("upvote_count", { ascending: false });
  }

  const { data } = await query;
  return data ?? [];
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, author_name, author_initials, category, read_time, cover_image_url, upvote_count, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

export async function toggleUpvote(toolId: string, userId: string): Promise<{ upvoted: boolean; count: number }> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("upvotes")
    .select("id")
    .eq("tool_id", toolId)
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase.from("upvotes").delete().eq("tool_id", toolId).eq("user_id", userId);
    await supabase.rpc("decrement_upvote", { tool_id: toolId });
    const { data } = await supabase.from("tools").select("upvote_count").eq("id", toolId).single();
    return { upvoted: false, count: data?.upvote_count ?? 0 };
  } else {
    await supabase.from("upvotes").insert({ tool_id: toolId, user_id: userId });
    await supabase.rpc("increment_upvote", { tool_id: toolId });
    const { data } = await supabase.from("tools").select("upvote_count").eq("id", toolId).single();
    return { upvoted: true, count: data?.upvote_count ?? 0 };
  }
}

export async function getUserUpvotes(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("upvotes")
    .select("tool_id")
    .eq("user_id", userId);
  return data?.map((u) => u.tool_id) ?? [];
}

export async function submitTool(data: {
  name: string;
  url: string;
  category_id: string;
  submitter_email: string;
  description?: string;
}) {
  const supabase = createClient();
  return supabase.from("tool_submissions").insert(data);
}

export async function subscribeNewsletter(email: string) {
  const supabase = createClient();
  return supabase.from("newsletter_subscribers").insert({ email });
}

export async function submitReview(data: {
  tool_id: string;
  author_name: string;
  author_initials: string;
  role: string;
  rating: number;
  date_text: string;
  review_text: string;
}) {
  const supabase = createClient();
  return supabase.from("tool_reviews").insert(data);
}
