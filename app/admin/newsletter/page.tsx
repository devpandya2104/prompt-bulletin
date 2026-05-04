import { createAdminClient } from "@/lib/supabase/server";
import NewsletterList from "@/components/admin/NewsletterList";

export const revalidate = 0;

export default async function AdminNewsletterPage() {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  return <NewsletterList initialData={data ?? []} />;
}
