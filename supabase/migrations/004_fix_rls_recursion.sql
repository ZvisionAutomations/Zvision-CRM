-- 1. Create a helper function that reads the company_id for the logged-in user.
-- The crucial part is "SECURITY DEFINER", which runs this specific tiny query
-- bypassing RLS completely, thus breaking the infinite recursion loop.
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Drop ALL problematic policies that were querying 'users' directly inside 'users'
DROP POLICY IF EXISTS "users_company_isolation" ON public.users;
DROP POLICY IF EXISTS "leads_company_isolation" ON public.leads;
DROP POLICY IF EXISTS "activities_company_isolation" ON public.activities;
DROP POLICY IF EXISTS "imports_company_isolation" ON public.imports;

-- 3. Recreate the policies using our new bypass function
CREATE POLICY "users_company_isolation" ON public.users
  USING (
    id = auth.uid() 
    OR 
    company_id = public.get_auth_company_id()
  );

CREATE POLICY "leads_company_isolation" ON public.leads
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "activities_company_isolation" ON public.activities
  USING (company_id = public.get_auth_company_id());

CREATE POLICY "imports_company_isolation" ON public.imports
  USING (company_id = public.get_auth_company_id());
