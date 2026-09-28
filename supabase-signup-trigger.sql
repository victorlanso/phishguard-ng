-- ============================================================
-- Automatic "on signup" trigger
-- Run this in the Supabase SQL Editor AFTER running supabase-seed.sql
-- ============================================================

-- 1. Function that runs when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_org_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- Demo org from seed
BEGIN
  INSERT INTO public.users (
    id,
    org_id,
    email,
    full_name,
    role,
    points
  )
  VALUES (
    NEW.id,
    default_org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'employee',          -- default role
    0
  );

  RETURN NEW;
END;
$$;

-- 2. Trigger that calls the function after every new signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- How to promote a user to admin later:
-- ============================================================
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE email = 'your-admin@email.com';
-- ============================================================
