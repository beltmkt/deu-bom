create or replace function public.get_workspace_invitation_by_token(invite_token uuid)
returns table (
  email text,
  role text,
  workspace_id uuid,
  workspace_name text,
  expires_at timestamp with time zone
)
language sql
stable
security definer
set search_path = public
as $$
  select
    wi.email,
    wi.role::text,
    wi.workspace_id,
    coalesce(w.name, 'Espaco') as workspace_name,
    wi.expires_at
  from public.workspace_invitations wi
  left join public.workspaces w on w.id = wi.workspace_id
  where wi.token = invite_token
  limit 1
$$;

create or replace function public.accept_workspace_invitation(invite_token uuid)
returns table (
  workspace_id uuid,
  workspace_name text,
  role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_record record;
  current_email text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select email
    into current_email
  from auth.users
  where id = auth.uid();

  select
    wi.id,
    wi.email,
    wi.role,
    wi.workspace_id,
    wi.expires_at,
    w.name as workspace_name
    into invitation_record
  from public.workspace_invitations wi
  left join public.workspaces w on w.id = wi.workspace_id
  where wi.token = invite_token
  limit 1;

  if invitation_record.id is null then
    raise exception 'INVITE_NOT_FOUND';
  end if;

  if invitation_record.expires_at < now() then
    raise exception 'INVITE_EXPIRED';
  end if;

  if lower(invitation_record.email) <> lower(coalesce(current_email, '')) then
    raise exception 'INVITE_EMAIL_MISMATCH';
  end if;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role,
    accepted_at
  )
  values (
    invitation_record.workspace_id,
    auth.uid(),
    invitation_record.role,
    now()
  )
  on conflict (workspace_id, user_id)
  do update set
    accepted_at = now(),
    role = case
      when public.workspace_members.role = 'owner' then public.workspace_members.role
      else excluded.role
    end;

  update public.profiles
    set current_workspace_id = invitation_record.workspace_id
  where id = auth.uid();

  delete from public.workspace_invitations
  where id = invitation_record.id;

  return query
  select
    invitation_record.workspace_id::uuid,
    coalesce(invitation_record.workspace_name, 'Espaco')::text,
    invitation_record.role::text;
end;
$$;

grant execute on function public.get_workspace_invitation_by_token(uuid) to anon, authenticated;
grant execute on function public.accept_workspace_invitation(uuid) to authenticated;
