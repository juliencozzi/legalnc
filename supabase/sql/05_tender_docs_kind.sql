-- Add a 'kind' column to categorize docs: RC, CCTP, CCAP, DUME, AE, BPU, ANNEXE, PDF, WORD, OTHER
alter table public.tender_docs add column if not exists kind text;
create index if not exists tender_docs_kind_idx on public.tender_docs(kind);
