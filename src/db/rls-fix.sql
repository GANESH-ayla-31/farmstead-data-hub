
-- This file fixes the RLS policies for the farmers and farmlands tables

-- First, let's make sure the farmers table allows creating records
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Remove foreign key constraint if it exists
ALTER TABLE farmers DROP CONSTRAINT IF EXISTS farmers_user_id_fkey;

-- Allow any authenticated user to insert into farmers
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON farmers;
CREATE POLICY "Enable insert for authenticated users" 
ON farmers 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to select from farmers
DROP POLICY IF EXISTS "Enable select for authenticated users" ON farmers;
CREATE POLICY "Enable select for authenticated users" 
ON farmers 
FOR SELECT 
TO authenticated
USING (true);

-- Allow direct access to crops table for testing connectivity
DROP POLICY IF EXISTS "Allow anonymous select on crops" ON crops;
CREATE POLICY "Allow anonymous select on crops" 
FOR SELECT 
ON crops 
TO anon, authenticated
USING (true);
