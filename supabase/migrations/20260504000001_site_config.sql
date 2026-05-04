create table if not exists site_config (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz default now()
);
