-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for new user workspace creation (runs after profile is created)
CREATE TRIGGER on_auth_user_created_workspace
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_workspace();

-- Also add a function to update workspace name
CREATE OR REPLACE FUNCTION public.update_workspace_name(ws_id uuid, new_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.workspaces 
  SET name = new_name, updated_at = now()
  WHERE id = ws_id AND owner_id = auth.uid();
END;
$$;