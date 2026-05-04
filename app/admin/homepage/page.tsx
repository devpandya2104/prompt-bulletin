import { getSiteConfig } from "@/lib/site-config-server";
import HomepageEditor from "@/components/admin/HomepageEditor";

export const revalidate = 0;

export default async function AdminHomepagePage() {
  const config = await getSiteConfig();
  return <HomepageEditor config={config} />;
}
