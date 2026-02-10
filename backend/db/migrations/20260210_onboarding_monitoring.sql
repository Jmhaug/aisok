create table if not exists monitoring_configs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  profile_json jsonb not null default '{}'::jsonb,
  competitors_json jsonb not null default '[]'::jsonb,
  queries_json jsonb not null default '[]'::jsonb,
  platforms_json jsonb not null default '[]'::jsonb,
  scope_level text,
  created_at timestamptz not null default now()
);

create table if not exists monitoring_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id text not null unique,
  config_id text not null,
  status text not null,
  progress_json jsonb not null default '{}'::jsonb,
  partial_top_entities_json jsonb not null default '[]'::jsonb,
  snapshot_json jsonb,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists query_runs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  query text not null,
  query_normalized text not null,
  platform text not null,
  model text not null,
  raw_output text not null,
  citations_json jsonb not null default '[]'::jsonb,
  entity_index_json jsonb not null default '[]'::jsonb,
  config_id text,
  job_id text,
  query_category text,
  scope_level text,
  created_at timestamptz not null default now()
);

create index if not exists idx_query_runs_email_created_at
  on query_runs (email, created_at desc);

create index if not exists idx_query_runs_job
  on query_runs (job_id);
