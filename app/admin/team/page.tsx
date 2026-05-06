import { createAdminClient } from "@/lib/supabase/server";
import TeamManager from "@/components/admin/TeamManager";

export const revalidate = 0;

export default async function AdminTeamPage() {
  const supabase = await createAdminClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  return <TeamManager profiles={profiles ?? []} />;
}
