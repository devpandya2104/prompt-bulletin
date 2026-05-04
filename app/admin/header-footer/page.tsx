import { getSiteConfig } from "@/lib/site-config-server";
import HeaderFooterEditor from "@/components/admin/HeaderFooterEditor";

export const revalidate = 0;

export default async function AdminHeaderFooterPage() {
  const config = await getSiteConfig();
  return <HeaderFooterEditor navbar={config.navbar} footer={config.footer} />;
}
