"use server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTool(id: string, data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("tools").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/tools/${data.slug}`);
  revalidatePath("/admin/tools");
  revalidatePath("/", "layout");
}

export async function createTool(data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { data: tool, error } = await supabase.from("tools").insert(data).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tools");
  revalidatePath("/", "layout");
  return tool as { id: string; slug: string };
}

export async function deleteTool(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("tools").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tools");
  revalidatePath("/", "layout");
}

export async function saveReview(data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  if (data.id) {
    const { id, ...rest } = data;
    const { error } = await supabase.from("tool_reviews").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("tool_reviews").insert(data);
    if (error) throw new Error(error.message);
  }
}

export async function deleteReview(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("tool_reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Blog post actions ──────────────────────────────────────────────

export async function saveBlogPost(id: string, data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("blog_posts").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/blog");
  revalidatePath("/", "layout");
}

export async function createBlogPost(data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { data: post, error } = await supabase.from("blog_posts").insert(data).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/blog");
  revalidatePath("/", "layout");
  return post as { id: string; slug: string };
}

export async function deleteBlogPost(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/blog");
  revalidatePath("/", "layout");
}

// ── Category actions ───────────────────────────────────────────────

export async function saveCategory(id: string, data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("categories").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

export async function createCategory(data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { data: cat, error } = await supabase.from("categories").insert(data).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return cat as { id: string; slug: string };
}

export async function deleteCategory(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

// ── Inbox actions ─────────────────────────────────────────────────

export async function updateSubmission(id: string, status: string, adminNotes: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("tool_submissions")
    .update({ status, admin_notes: adminNotes })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/submissions");
}

export async function deleteNewsletterSubscriber(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/newsletter");
}

// ── Site config actions ────────────────────────────────────────────

export async function saveSiteConfig(key: string, value: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("site_config")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

