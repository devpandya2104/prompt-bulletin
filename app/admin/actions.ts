"use server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTool(id: string, data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("tools").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/tools/${data.slug}`);
  revalidatePath("/admin/tools");
  revalidatePath("/");
}

export async function createTool(data: Record<string, unknown>) {
  const supabase = await createAdminClient();
  const { data: tool, error } = await supabase.from("tools").insert(data).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tools");
  revalidatePath("/");
  return tool as { id: string; slug: string };
}

export async function deleteTool(id: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("tools").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tools");
  revalidatePath("/");
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

export async function getCategories() {
  const supabase = await createAdminClient();
  const { data } = await supabase.from("categories").select("id, name, slug").order("sort_order");
  return data ?? [];
}
