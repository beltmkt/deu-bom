create table if not exists public.purchase_goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    workspace_id uuid,
    title text not null,
    category text,
    target_amount numeric not null,
    current_amount numeric not null default 0,
    monthly_target numeric,
    target_date date,
    notes text,
    priority text not null default 'medium',
    status text not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint purchase_goals_priority_check check (priority in ('low', 'medium', 'high')),
    constraint purchase_goals_status_check check (status in ('active', 'paused', 'completed')),
    constraint purchase_goals_workspace_id_fkey foreign key (workspace_id) references public.workspaces(id) on delete cascade
);

create index if not exists idx_purchase_goals_workspace on public.purchase_goals using btree (workspace_id);
create index if not exists idx_purchase_goals_user on public.purchase_goals using btree (user_id);

alter table public.purchase_goals enable row level security;

create policy "Workspace members can view purchase goals"
on public.purchase_goals
for select
using (
  (user_id = auth.uid())
  or ((workspace_id is not null) and public.is_workspace_member(workspace_id, auth.uid()))
);

create policy "Workspace editors can insert purchase goals"
on public.purchase_goals
for insert
with check (
  (user_id = auth.uid())
  or ((workspace_id is not null) and public.can_edit_workspace(workspace_id, auth.uid()))
);

create policy "Workspace editors can update purchase goals"
on public.purchase_goals
for update
using (
  (user_id = auth.uid())
  or ((workspace_id is not null) and public.can_edit_workspace(workspace_id, auth.uid()))
);

create policy "Workspace editors can delete purchase goals"
on public.purchase_goals
for delete
using (
  (user_id = auth.uid())
  or ((workspace_id is not null) and public.can_edit_workspace(workspace_id, auth.uid()))
);
