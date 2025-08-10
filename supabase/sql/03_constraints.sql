-- Ensure unique (source, ref) for idempotent upserts
alter table if exists public.tenders
  add constraint if not exists tenders_source_ref_key unique (source, ref);
