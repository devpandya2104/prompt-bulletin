import { createAdminClient } from "@/lib/supabase/server";
import SubmissionsManager from "@/components/admin/SubmissionsManager";

export const revalidate = 0;

export default async function AdminSubmissionsPage() {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("tool_submissions")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return <SubmissionsManager initialData={data ?? []} />;
}
