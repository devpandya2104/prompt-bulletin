-- ============================================================
-- PromptBulletin — Full Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- CATEGORIES
create table if not exists categories (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  slug        text unique not null,
  icon        text not null default '🔧',
  description text,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- TOOLS
create table if not exists tools (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  slug          text unique not null,
  description   text not null,
  category_id   uuid references categories(id) on delete set null,
  pricing       text not null default 'Free',
  website_url   text,
  platforms     text[] default '{}',
  rating        numeric(3,1) default 0,
  upvote_count  integer default 0,
  review_count  integer default 0,
  badge         text check (badge in ('Trending', 'Hot', 'New') or badge is null),
  tag           text,
  tag_type      text check (tag_type in ('editor', 'top') or tag_type is null),
  is_published  boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- BLOG POSTS
create table if not exists blog_posts (
  id               uuid default gen_random_uuid() primary key,
  title            text not null,
  slug             text unique not null,
  content          text default '',
  excerpt          text default '',
  author_name      text not null,
  author_initials  text not null,
  category         text not null default 'General',
  read_time        text not null default '5 min',
  cover_image_url  text,
  is_published     boolean default false,
  upvote_count     integer default 0,
  published_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- USER PROFILES
create table if not exists profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text,
  username   text,
  role       text default 'user' check (role in ('user', 'editor', 'admin')),
  created_at timestamptz default now()
);

-- UPVOTES (one per user per tool)
create table if not exists upvotes (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  tool_id    uuid references tools(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, tool_id)
);

-- TOOL SUBMISSIONS
create table if not exists tool_submissions (
  id               uuid default gen_random_uuid() primary key,
  name             text not null,
  url              text not null,
  category_id      uuid references categories(id) on delete set null,
  submitter_email  text not null,
  description      text,
  status           text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes      text,
  created_at       timestamptz default now()
);

-- NEWSLETTER SUBSCRIBERS
create table if not exists newsletter_subscribers (
  id         uuid default gen_random_uuid() primary key,
  email      text unique not null,
  created_at timestamptz default now()
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- AUTO-UPDATE updated_at TIMESTAMPS
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tools_updated_at before update on tools
  for each row execute procedure update_updated_at();

create trigger blog_posts_updated_at before update on blog_posts
  for each row execute procedure update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table categories         enable row level security;
alter table tools              enable row level security;
alter table blog_posts         enable row level security;
alter table profiles           enable row level security;
alter table upvotes            enable row level security;
alter table tool_submissions   enable row level security;
alter table newsletter_subscribers enable row level security;

-- Categories: anyone can read, only admins can write
create policy "categories_public_read"   on categories for select using (true);
create policy "categories_admin_insert"  on categories for insert with check (auth.role() = 'authenticated');
create policy "categories_admin_update"  on categories for update using (auth.role() = 'authenticated');
create policy "categories_admin_delete"  on categories for delete using (auth.role() = 'authenticated');

-- Tools: published tools are public, only admins write
create policy "tools_public_read"   on tools for select using (is_published = true);
create policy "tools_admin_insert"  on tools for insert with check (auth.role() = 'authenticated');
create policy "tools_admin_update"  on tools for update using (auth.role() = 'authenticated');
create policy "tools_admin_delete"  on tools for delete using (auth.role() = 'authenticated');

-- Blog posts: only published posts are public
create policy "blog_public_read"   on blog_posts for select using (is_published = true);
create policy "blog_admin_insert"  on blog_posts for insert with check (auth.role() = 'authenticated');
create policy "blog_admin_update"  on blog_posts for update using (auth.role() = 'authenticated');
create policy "blog_admin_delete"  on blog_posts for delete using (auth.role() = 'authenticated');

-- Profiles: users can read their own profile
create policy "profiles_own_read"   on profiles for select using (auth.uid() = id);
create policy "profiles_own_update" on profiles for update using (auth.uid() = id);

-- Upvotes: logged in users can manage their own upvotes
create policy "upvotes_public_read"  on upvotes for select using (true);
create policy "upvotes_own_insert"   on upvotes for insert with check (auth.uid() = user_id);
create policy "upvotes_own_delete"   on upvotes for delete using (auth.uid() = user_id);

-- Submissions: anyone can submit, only authenticated users can read
create policy "submissions_insert"  on tool_submissions for insert with check (true);
create policy "submissions_admin_read" on tool_submissions for select using (auth.role() = 'authenticated');
create policy "submissions_admin_update" on tool_submissions for update using (auth.role() = 'authenticated');

-- Newsletter: anyone can subscribe
create policy "newsletter_insert" on newsletter_subscribers for insert with check (true);
create policy "newsletter_admin_read" on newsletter_subscribers for select using (auth.role() = 'authenticated');
