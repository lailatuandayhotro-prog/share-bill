-- Allow users to join groups themselves
CREATE POLICY "Users can join groups themselves"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);