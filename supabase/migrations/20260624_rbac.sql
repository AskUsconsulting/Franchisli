-- ============================================================
-- RBAC: roles, permissions, user_roles, role_permissions
-- Migration Date: 2026-06-24
-- ============================================================

-- 1. Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed Roles
INSERT INTO public.roles (name)
VALUES ('owner'), ('manager'), ('employee')
ON CONFLICT (name) DO NOTHING;

-- 2. Permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name  TEXT UNIQUE NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Seed Permissions
INSERT INTO public.permissions (feature_name, description)
VALUES 
  ('timesheets', 'Access to logging, editing and approving timesheets'),
  ('tasks', 'Access to task creation, updates and management'),
  ('documents', 'Access to view and upload training documents and SOPs'),
  ('operations', 'Access to checklist templates, runs and daily execution'),
  ('locations', 'Access to location details and settings'),
  ('audits', 'Access to compliance audits and details'),
  ('communications', 'Access to messages, announcements and chat'),
  ('reports', 'Access to performance, compliance and hour reports')
ON CONFLICT (feature_name) DO NOTHING;

-- 3. User Roles join table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_id     UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role_id)
);

-- 4. Role Permissions join table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id        UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  permission_id  UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  franchise_id   UUID NOT NULL,
  is_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (role_id, permission_id, franchise_id)
);

-- 5. Sync Existing Profiles into user_roles
INSERT INTO public.user_roles (user_id, role_id)
SELECT p.id, r.id
FROM public.profiles p
JOIN public.roles r ON r.name = p.role
ON CONFLICT DO NOTHING;

-- 6. Modify profiles role check constraint to support 'manager'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('owner', 'manager', 'employee'));

-- 7. Trigger to keep user_roles synchronized with profiles.role
CREATE OR REPLACE FUNCTION public.handle_profile_role_sync()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_role_id UUID;
  old_role_id UUID;
BEGIN
  -- Find new role ID
  SELECT id INTO new_role_id
  FROM public.roles
  WHERE name = NEW.role;

  -- If it's an update and the role actually changed, delete the old role link
  IF (TG_OP = 'UPDATE') AND (OLD.role IS DISTINCT FROM NEW.role) THEN
    SELECT id INTO old_role_id
    FROM public.roles
    WHERE name = OLD.role;
    
    IF old_role_id IS NOT NULL THEN
      DELETE FROM public.user_roles
      WHERE user_id = NEW.id AND role_id = old_role_id;
    END IF;
  END IF;

  -- Insert the new role link
  IF new_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, new_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER sync_profile_role
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_role_sync();

-- 8. Check Permission helper function
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_role_name TEXT;
  user_franchise_id UUID;
  perm_id UUID;
  is_allowed BOOLEAN;
BEGIN
  -- Get user profile info
  SELECT role, franchise_id INTO user_role_name, user_franchise_id
  FROM public.profiles
  WHERE id = user_uuid;

  -- Owner has absolute bypass
  IF user_role_name = 'owner' THEN
    RETURN TRUE;
  END IF;

  -- Fallback franchise_id if null
  IF user_franchise_id IS NULL THEN
    user_franchise_id := user_uuid;
  END IF;

  -- Get permission ID
  SELECT id INTO perm_id
  FROM public.permissions
  WHERE feature_name = permission_name;

  IF perm_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if any assigned user_role is enabled in role_permissions (defaults to true)
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    LEFT JOIN public.role_permissions rp ON rp.role_id = ur.role_id
      AND rp.permission_id = perm_id
      AND rp.franchise_id = user_franchise_id
    WHERE ur.user_id = user_uuid
      AND COALESCE(rp.is_enabled, TRUE) = TRUE
  ) INTO is_allowed;

  RETURN is_allowed;
END;
$$ LANGUAGE plpgsql;

-- 9. Enable RLS on RBAC tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies on RBAC tables
CREATE POLICY "Allow read on roles for authenticated" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read on permissions for authenticated" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read on user_roles for authenticated" ON public.user_roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read on role_permissions for authenticated" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow owners to manage role_permissions" ON public.role_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'owner'
        AND role_permissions.franchise_id = profiles.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'owner'
        AND role_permissions.franchise_id = profiles.id
    )
  );

-- 11. Optimized Indexes for RBAC checks
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_role_idx ON public.user_roles (user_id, role_id);
CREATE UNIQUE INDEX IF NOT EXISTS role_permissions_lookup_idx ON public.role_permissions (role_id, permission_id, franchise_id);
CREATE INDEX IF NOT EXISTS role_permissions_franchise_idx ON public.role_permissions (franchise_id);

-- 12. Update RLS policies on Resource tables using RBAC checks
-- Timesheets Resource
DROP POLICY IF EXISTS timesheets_own_select ON public.timesheets;
DROP POLICY IF EXISTS timesheets_own_insert ON public.timesheets;
DROP POLICY IF EXISTS timesheets_select_policy ON public.timesheets;
DROP POLICY IF EXISTS timesheets_insert_policy ON public.timesheets;
DROP POLICY IF EXISTS timesheets_update_policy ON public.timesheets;
DROP POLICY IF EXISTS timesheets_delete_policy ON public.timesheets;

CREATE POLICY "timesheets_select_policy" ON public.timesheets FOR SELECT USING (
  auth.uid() = user_id OR public.has_permission(auth.uid(), 'timesheets')
);
CREATE POLICY "timesheets_insert_policy" ON public.timesheets FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.has_permission(auth.uid(), 'timesheets')
);
CREATE POLICY "timesheets_update_policy" ON public.timesheets FOR UPDATE USING (
  auth.uid() = user_id OR public.has_permission(auth.uid(), 'timesheets')
) WITH CHECK (
  auth.uid() = user_id OR public.has_permission(auth.uid(), 'timesheets')
);
CREATE POLICY "timesheets_delete_policy" ON public.timesheets FOR DELETE USING (
  auth.uid() = user_id OR public.has_permission(auth.uid(), 'timesheets')
);

-- Tasks Resource
DROP POLICY IF EXISTS tasks_all ON public.tasks;
DROP POLICY IF EXISTS tasks_select_policy ON public.tasks;
DROP POLICY IF EXISTS tasks_insert_policy ON public.tasks;
DROP POLICY IF EXISTS tasks_update_policy ON public.tasks;
DROP POLICY IF EXISTS tasks_delete_policy ON public.tasks;

CREATE POLICY "tasks_select_policy" ON public.tasks FOR SELECT USING (
  public.has_permission(auth.uid(), 'tasks')
);
CREATE POLICY "tasks_insert_policy" ON public.tasks FOR INSERT WITH CHECK (
  public.has_permission(auth.uid(), 'tasks')
);
CREATE POLICY "tasks_update_policy" ON public.tasks FOR UPDATE USING (
  public.has_permission(auth.uid(), 'tasks')
) WITH CHECK (
  public.has_permission(auth.uid(), 'tasks')
);
CREATE POLICY "tasks_delete_policy" ON public.tasks FOR DELETE USING (
  public.has_permission(auth.uid(), 'tasks')
);

-- 13. Grants to Service Role for Admin Client access
GRANT ALL ON public.roles TO service_role;
GRANT ALL ON public.permissions TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.role_permissions TO service_role;
