-- Authors table (reusable across all blog posts)
create table if not exists authors (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  initials   text not null,
  role       text default '',
  bio        text default '',
  avatar_url text,
  sort_order int  default 0,
  created_at timestamptz default now()
);

alter table authors enable row level security;

create policy "public_read_authors"
  on authors for select using (true);

-- Service role can manage authors (used by admin client)
create policy "service_manage_authors"
  on authors for all using (true) with check (true);

-- Add intro, conclusion, and author FK to blog_posts
alter table blog_posts
  add column if not exists intro_html      text,
  add column if not exists conclusion_html text,
  add column if not exists author_id       uuid references authors(id) on delete set null;
