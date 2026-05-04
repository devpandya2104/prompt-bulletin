import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CONFIG, DEFAULT_HERO, DEFAULT_DISCOVER, DEFAULT_CATEGORIES,
  DEFAULT_FEATURES, DEFAULT_BLOG, DEFAULT_SUBMIT, DEFAULT_ABOUT,
  DEFAULT_FAQ, DEFAULT_NEWSLETTER, DEFAULT_NAVBAR, DEFAULT_FOOTER,
} from "@/lib/site-config";
import type { SiteConfig } from "@/lib/site-config";

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_config").select("key, value");
    if (!data?.length) return DEFAULT_CONFIG;
    const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
    return {
      hero:       { ...DEFAULT_HERO,       ...(map.hero       ?? {}) },
      discover:   { ...DEFAULT_DISCOVER,   ...(map.discover   ?? {}) },
      categories: { ...DEFAULT_CATEGORIES, ...(map.categories ?? {}) },
      features:   { ...DEFAULT_FEATURES,   ...(map.features   ?? {}) },
      blog:       { ...DEFAULT_BLOG,       ...(map.blog       ?? {}) },
      submit:     { ...DEFAULT_SUBMIT,     ...(map.submit     ?? {}) },
      about:      { ...DEFAULT_ABOUT,      ...(map.about      ?? {}) },
      faq:        { ...DEFAULT_FAQ,        ...(map.faq        ?? {}) },
      newsletter: { ...DEFAULT_NEWSLETTER, ...(map.newsletter ?? {}) },
      navbar:     { ...DEFAULT_NAVBAR,     ...(map.navbar     ?? {}) },
      footer:     { ...DEFAULT_FOOTER,     ...(map.footer     ?? {}) },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
