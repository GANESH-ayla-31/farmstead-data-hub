
-- Temporarily disable RLS to make debugging easier
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmlands DISABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to create farmers
GRANT INSERT ON farmers TO authenticated;

-- Allow public access to crops table for testing
CREATE POLICY "Allow public access to crops" ON crops FOR SELECT TO anon, authenticated USING (true);
