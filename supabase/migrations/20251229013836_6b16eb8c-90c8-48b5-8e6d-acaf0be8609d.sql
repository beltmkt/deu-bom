-- Create a security definer function to get the current user's email
CREATE OR REPLACE FUNCTION public.get_auth_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Drop the old policy
DROP POLICY IF EXISTS "Editors can view invitations" ON public.workspace_invitations;

-- Create new policy using the security definer function
CREATE POLICY "Editors can view invitations" 
ON public.workspace_invitations 
FOR SELECT 
USING (
  can_edit_workspace(workspace_id, auth.uid()) 
  OR email = public.get_auth_user_email()
);