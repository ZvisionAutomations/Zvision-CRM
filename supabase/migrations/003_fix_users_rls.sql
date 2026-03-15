-- Fix the infinite recursion on users table RLS policy
DROP POLICY IF EXISTS "users_company_isolation" ON users;

CREATE POLICY "users_company_isolation" ON users
  USING (
    -- A user can see themselves
    id = auth.uid()
    OR 
    -- A user can see others in the same company
    company_id = (
      -- Extract company_id from their own JWT or do a direct match without selecting from users again
      -- But since we don't have company_id in JWT yet, we use a simpler subquery that doesn't trigger recursion on the same policy for the same row
      (SELECT u.company_id FROM users u WHERE u.id = auth.uid() LIMIT 1)
    )
  );

-- Also, to ensure they can login right after creation, let's fix the circular reference properly:
-- The simplest way to fix RLS recursion on the users table is to allow users to read their OWN row directly via ID,
-- and read other rows if the company matches.
DROP POLICY IF EXISTS "users_company_isolation" ON users;
CREATE POLICY "users_company_isolation" ON users
  USING (
    id = auth.uid() 
    OR 
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );
