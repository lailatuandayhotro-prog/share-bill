-- Add policy to allow group members to view all members in their group
CREATE POLICY "Group members can view all members in their group"
ON public.group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);