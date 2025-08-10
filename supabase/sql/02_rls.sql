-- Enable RLS and define helper function to check org membership via auth.uid()
create or replace function public.is_org_member(check_org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 from public.user_org_roles u
    where u.org_id = check_org_id
      and u.user_id = auth.uid()
  );
$$;

alter table public.orgs enable row level security;
alter table public.user_org_roles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.org_tender_scores enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.sign_requests enable row level security;
alter table public.payments enable row level security;
alter table public.alerts enable row level security;

-- Public access for tenders and requirements (read-only) since they are scraped public data
alter table public.tenders enable row level security;
alter table public.tender_requirements enable row level security;

create policy "tenders are readable by all authenticated" on public.tenders
  for select using (auth.role() = 'authenticated');

create policy "tender requirements readable by all authenticated" on public.tender_requirements
  for select using (auth.role() = 'authenticated');

-- orgs: members can read; admins can update via RPC in backend
create policy "org members read org" on public.orgs
  for select using (public.is_org_member(id));

-- user_org_roles: a user can read their memberships; admin ops via backend service role
create policy "user can read own org roles" on public.user_org_roles
  for select using (auth.uid() = user_id);

-- Subscriptions
create policy "org members read subscriptions" on public.subscriptions
  for select using (public.is_org_member(org_id));

-- Scores
create policy "org members read scores" on public.org_tender_scores
  for select using (public.is_org_member(org_id));

-- Projects
create policy "org members full access projects" on public.projects
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));

-- Project files
create policy "org members full access project_files" on public.project_files
  for all using (exists(select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)))
  with check (exists(select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)));

-- Sign requests
create policy "org members full access sign_requests" on public.sign_requests
  for all using (exists(select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)))
  with check (exists(select 1 from public.projects p where p.id = project_id and public.is_org_member(p.org_id)));

-- Payments
create policy "org members read payments" on public.payments
  for select using (public.is_org_member(org_id));

-- Alerts
create policy "org members full access alerts" on public.alerts
  for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));
