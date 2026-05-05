import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolDetailPage from "@/components/ToolDetailPage";
import type { ToolDetail, ToolReview, Tool } from "@/lib/queries";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("tools")
    .select("name, tagline, description, seo_title, seo_description, seo_og_image")
    .eq("slug", slug)
    .single();
  if (!data) return {};
  const title       = data.seo_title       ?? `${data.name} Review — PromptBulletin`;
  const description = data.seo_description ?? data.tagline ?? data.description;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(data.seo_og_image ? { images: [{ url: data.seo_og_image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: tool }, { data: reviews }, { data: related }] = await Promise.all([
    supabase
      .from("tools")
      .select("*, categories(name, slug)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single(),
    supabase
      .from("tool_reviews")
      .select("*")
      .eq("tool_id", (
        await supabase.from("tools").select("id").eq("slug", slug).single()
      ).data?.id ?? "")
      .order("helpful_count", { ascending: false }),
    supabase
      .from("tools")
      .select("name, slug, rating, upvote_count, pricing, categories(name)")
      .eq("is_published", true)
      .neq("slug", slug)
      .limit(3),
  ]);

  if (!tool) notFound();

  return (
    <>
      <Navbar />
      <ToolDetailPage
        tool={tool as ToolDetail}
        reviews={(reviews ?? []) as ToolReview[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        related={(related ?? []) as any}
      />
      <Footer />
    </>
  );
}
