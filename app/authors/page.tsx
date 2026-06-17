import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/server";
import type { Author } from "@/lib/queries";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata: Metadata = {
  title: { absolute: "Editorial Team — PromptBulletin" },
  description: "Meet the PromptBulletin editorial team — the writers, reviewers, and analysts behind our independent AI tool reviews.",
  alternates: { canonical: `${SITE_URL}/authors` },
};

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default async function AuthorsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("authors").select("*").order("sort_order");
  const authors = (data ?? []) as Author[];

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Editorial Team</h1>
        <p className="text-[var(--muted)] mb-10">
          The writers, reviewers, and analysts behind PromptBulletin&apos;s independent AI tool reviews.
          Every review is written and verified by a human editor.
        </p>

        <div className="flex flex-col gap-4">
          {authors.map((author) => (
            <Link
              key={author.id}
              href={`/authors/${nameToSlug(author.name)}`}
              className="flex items-center gap-5 p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-colors"
            >
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover shrink-0"
                  style={{ width: 64, height: 64 }}
                />
              ) : (
                <div
                  className="rounded-full shrink-0 flex items-center justify-center font-bold text-lg"
                  style={{ width: 64, height: 64, background: "var(--accent-dim)", color: "var(--accent)" }}
                >
                  {author.initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold">{author.name}</p>
                <p className="text-sm text-[var(--accent)] mb-1">{author.role}</p>
                {author.bio && (
                  <p className="text-sm text-[var(--muted)] line-clamp-2">{author.bio}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
