"use server";
import { createClient } from "@/lib/supabase/server";

export async function toggleHelpfulVote(reviewId: string): Promise<{ helpful: boolean; count: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("review_helpful_votes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("review_helpful_votes").delete().eq("id", existing.id);
  } else {
    await supabase.from("review_helpful_votes").insert({ review_id: reviewId, user_id: user.id });
  }

  const { count } = await supabase
    .from("review_helpful_votes")
    .select("id", { count: "exact", head: true })
    .eq("review_id", reviewId);

  const newCount = count ?? 0;
  await supabase.from("tool_reviews").update({ helpful_count: newCount }).eq("id", reviewId);

  return { helpful: !existing, count: newCount };
}
