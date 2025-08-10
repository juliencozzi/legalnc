-- Core tables (mirror of Prisma, but with Supabase-friendly types)
create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists user_org_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  org_id uuid not null references orgs(id) on delete cascade,
  role text not null check (role in ('OWNER','ADMIN','REDACTEUR','LECTEUR')),
  unique(user_id, org_id)
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  price_xpf integer not null,
  period text not null check (period in ('monthly','yearly')),
  limits_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  plan_id uuid not null references plans(id),
  status text not null,
  current_period_end timestamptz not null,
  epaync_customer_id text,
  epaync_sub_id text,
  created_at timestamptz not null default now()
);

create table if not exists tenders (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  ref text not null,
  buyer text not null,
  title text not null,
  category text,
  amount_min integer,
  amount_max integer,
  deadline_at timestamptz,
  url text,
  raw_json jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tenders_ref_idx on tenders(ref);
create index if not exists tenders_deadline_idx on tenders(deadline_at);

create table if not exists tender_requirements (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references tenders(id) on delete cascade,
  type text not null,
  label text not null,
  source_excerpt text
);

create table if not exists org_tender_scores (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  tender_id uuid not null references tenders(id) on delete cascade,
  score integer not null,
  reasons_json jsonb,
  created_at timestamptz not null default now(),
  unique(org_id, tender_id)
);
create index if not exists org_tender_scores_org_score_idx on org_tender_scores(org_id, score);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  tender_id uuid not null references tenders(id) on delete cascade,
  status_pipeline text not null,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  path text not null,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists sign_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  doc_type text not null,
  signature_status text not null,
  signature_id text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  amount_xpf integer not null,
  status text not null,
  epaync_payment_id text,
  occurred_at timestamptz not null default now(),
  meta_json jsonb
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  channel text not null,
  frequency text not null,
  last_sent_at timestamptz,
  filters_json jsonb
);
