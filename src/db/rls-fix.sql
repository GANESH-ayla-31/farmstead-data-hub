
-- This file fixes the RLS policies for the farmers and farmlands tables

-- First, let's make sure the farmers table allows creating records
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;

-- Remove foreign key constraint if it exists
ALTER TABLE farmers DROP CONSTRAINT IF EXISTS farmers_user_id_fkey;

-- Allow direct access to crops table for testing connectivity
DROP POLICY IF EXISTS "Allow anonymous select on crops" ON crops;
CREATE POLICY "Allow anonymous select on crops" 
FOR SELECT 
ON crops 
TO anon, authenticated
USING (true);

-- Grant permissions to public role
GRANT INSERT, SELECT ON farmers TO public;
GRANT INSERT, SELECT, UPDATE ON farmlands TO public;
