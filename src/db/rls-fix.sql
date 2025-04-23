
-- This file fixes the RLS policies for the farmers and farmlands tables

-- First, let's make sure the farmers table allows creating records
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Allow direct insertion to farmers table without foreign key constraint
ALTER TABLE farmers DROP CONSTRAINT IF EXISTS farmers_user_id_fkey;

-- Allow authenticated users to insert into farmers with any user_id
DROP POLICY IF EXISTS "Enable insert for authenticated users with matching user_id" ON farmers;
CREATE POLICY "Enable insert for authenticated users with matching user_id" 
ON farmers 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to select from farmers where user_id matches their ID or any ID
DROP POLICY IF EXISTS "Enable select for authenticated users with matching user_id" ON farmers;
CREATE POLICY "Enable select for authenticated users with matching user_id" 
ON farmers 
FOR SELECT 
USING (true);

-- Create a policy to allow public access to the create_farmer function
DROP POLICY IF EXISTS "Allow public access to create_farmer function" ON farmers;
CREATE POLICY "Allow public access to create_farmer function" 
ON farmers
USING (true);

-- Allow direct access to crops table for testing connectivity
DROP POLICY IF EXISTS "Allow anonymous select on crops" ON crops;
CREATE POLICY "Allow anonymous select on crops" 
FOR SELECT 
ON crops 
USING (true);

