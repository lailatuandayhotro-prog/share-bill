-- Drop and recreate the problematic policy using security definer function
DROP POLICY IF EXISTS "Group members can create expenses" ON public.expenses;

CREATE POLICY "Group members can create expenses"
ON public.expenses
FOR INSERT
WITH CHECK (
  public.is_group_member(auth.uid(), group_id) 
  AND auth.uid() = paid_by
);