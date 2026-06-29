-- ============================================================
-- Migration: Employee visibility & tenant-aware profile select
-- Migration Date: 2026-06-29
-- ============================================================

-- 1. Add location_id to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL;

-- 2. Define tenant check helper function
CREATE OR REPLACE FUNCTION public.profiles_in_same_tenant(user_a UUID, user_b UUID)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
DECLARE
  f_a UUID;
  f_b UUID;
  l_a UUID;
  l_b UUID;
BEGIN
  -- Get franchise_id and location_id for user_a
  SELECT 
    COALESCE(franchise_id, CASE WHEN role = 'owner' THEN id ELSE NULL END),
    location_id
  INTO f_a, l_a
  FROM public.profiles
  WHERE id = user_a;

  -- Get franchise_id and location_id for user_b
  SELECT 
    COALESCE(franchise_id, CASE WHEN role = 'owner' THEN id ELSE NULL END),
    location_id
  INTO f_b, l_b
  FROM public.profiles
  WHERE id = user_b;

  -- Check if they belong to the same franchise or location
  RETURN (f_a IS NOT NULL AND f_b IS NOT NULL AND f_a = f_b)
      OR (l_a IS NOT NULL AND l_b IS NOT NULL AND l_a = l_b);
END;
$$ LANGUAGE plpgsql;

-- 3. Update profiles SELECT RLS policy
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow select for profiles in same tenant" ON public.profiles;

CREATE POLICY "Allow select for profiles in same tenant" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR public.profiles_in_same_tenant(auth.uid(), id)
  );
