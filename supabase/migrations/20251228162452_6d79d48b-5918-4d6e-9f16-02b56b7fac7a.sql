-- Update handle_new_user to store workspace_name in profile metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Update handle_new_user_workspace to use custom workspace name
CREATE OR REPLACE FUNCTION public.handle_new_user_workspace()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_workspace_id UUID;
  workspace_name TEXT;
BEGIN
  -- Get custom workspace name from user metadata, default to 'Meu Espaço'
  SELECT COALESCE(
    (SELECT raw_user_meta_data ->> 'workspace_name' FROM auth.users WHERE id = NEW.id),
    'Meu Espaço'
  ) INTO workspace_name;
  
  -- Create workspace with custom name
  INSERT INTO public.workspaces (name, owner_id)
  VALUES (workspace_name, NEW.id)
  RETURNING id INTO new_workspace_id;
  
  -- Add owner as member with full access
  INSERT INTO public.workspace_members (workspace_id, user_id, role, accepted_at)
  VALUES (new_workspace_id, NEW.id, 'owner', now());
  
  -- Update profile with current workspace
  UPDATE public.profiles SET current_workspace_id = new_workspace_id WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;