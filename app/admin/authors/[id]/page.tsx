import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AuthorEditor from "@/components/admin/AuthorEditor";
import type { Author } from "@/lib/queries";

export const revalidate = 0;

export default async function AdminAuthorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const { data } = await supabase.from("authors").select("*").eq("id", id).single();
  if (!data) notFound();
  return <AuthorEditor author={data as Author} />;
}
