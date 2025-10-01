-- Fix group creation issue caused by recursive RLS policies on group_members
-- 1) Helper function: check if a user owns a group (avoids policy recursion)
create or replace function public.is_group_owner(_user_id uuid, _group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.groups g
    where g.id = _group_id
      and g.owner_id = _user_id
  );
$$;

-- 2) Update group_members policies to avoid recursion and allow owners to manage members
-- Drop existing potentially recursive/problematic policies
drop policy if exists "Group owners can add members" on public.group_members;
drop policy if exists "Group owners can remove members" on public.group_members;
drop policy if exists "Users can view members of their groups" on public.group_members;

-- Allow owners to add members
create policy "Owners can add members"
on public.group_members
for insert
to authenticated
with check (
  public.is_group_owner(auth.uid(), group_id)
);

-- Allow owners to remove members; users can remove themselves (leave group)
create policy "Owners can remove members or users can leave"
on public.group_members
for delete
to authenticated
using (
  public.is_group_owner(auth.uid(), group_id) OR auth.uid() = user_id
);

-- Allow owners to view all members of their groups
create policy "Owners can view all group members"
on public.group_members
for select
to authenticated
using (
  public.is_group_owner(auth.uid(), group_members.group_id)
);

-- Allow users to view their own membership row (non-recursive)
create policy "Users can view their own membership row"
on public.group_members
for select
to authenticated
using (
  auth.uid() = user_id
);

-- 3) Ensure group owners can select groups they own (so inserts into group_members can validate ownership)
-- Replace and re-add member view policy (kept same behavior)
drop policy if exists "Users can view groups they are members of" on public.groups;
create policy "Users can view groups they are members of"
on public.groups
for select
to authenticated
using (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = groups.id and gm.user_id = auth.uid()
  )
);

-- Add explicit owner view policy (without IF NOT EXISTS)
drop policy if exists "Owners can view their groups" on public.groups;
create policy "Owners can view their groups"
on public.groups
for select
to authenticated
using (
  auth.uid() = owner_id
);