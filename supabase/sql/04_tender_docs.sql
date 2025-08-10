-- Table storing document links and parsed text for each tender
create table if not exists public.tender_docs (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  url text not null,
  mime text,
  status text not null default 'queued', -- queued | parsed | failed
  text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep one row per (tender_id, url)
create unique index if not exists tender_docs_unique_url on public.tender_docs(tender_id, url);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tender_docs_updated_at on public.tender_docs;
create trigger trg_tender_docs_updated_at
before update on public.tender_docs
for each row execute function public.set_updated_at();

-- RLS
alter table public.tender_docs enable row level security;

-- Read allowed to authenticated users (same as tenders policy)
create policy if not exists "tender_docs readable by authenticated"
on public.tender_docs for select using (auth.role() = 'authenticated');
