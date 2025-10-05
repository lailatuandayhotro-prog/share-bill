-- Also fix the SELECT policy to use security definer function
DROP POLICY IF EXISTS "Users can view expenses in their groups" ON public.expenses;

CREATE POLICY "Users can view expenses in their groups"
ON public.expenses
FOR SELECT
USING (public.is_group_member(auth.uid(), group_id));