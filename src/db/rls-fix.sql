
-- This file fixes the RLS policies for the farmers and farmlands tables

-- First, let's make sure the farmers table allows creating records
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert into farmers with their own user_id
CREATE POLICY "Enable insert for authenticated users with matching user_id" 
ON farmers 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- Allow authenticated users to select from farmers where user_id matches their ID
CREATE POLICY "Enable select for authenticated users with matching user_id" 
ON farmers 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

-- Allow direct access to crops table for testing connectivity
CREATE POLICY "Allow anonymous select on crops" 
ON crops 
FOR SELECT 
USING (true);
