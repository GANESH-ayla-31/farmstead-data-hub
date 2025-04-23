
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  address TEXT NOT NULL
);

-- Create farmlands table
CREATE TABLE IF NOT EXISTS farmlands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  size_hectares NUMERIC(10, 2) NOT NULL CHECK (size_hectares > 0),
  soil_type TEXT NOT NULL
);

-- Create crops table for crop types
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  variety TEXT NOT NULL,
  growth_period_days INTEGER NOT NULL CHECK (growth_period_days > 0),
  water_requirement TEXT NOT NULL,
  ideal_temperature TEXT NOT NULL
);

-- Create crop_cycles table for planting records
CREATE TABLE IF NOT EXISTS crop_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  farmland_id UUID NOT NULL REFERENCES farmlands(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE RESTRICT,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE NOT NULL,
  actual_harvest_date DATE,
  area_hectares NUMERIC(10, 2) NOT NULL CHECK (area_hectares > 0),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'growing', 'harvested', 'failed')),
  yield_kg NUMERIC(10, 2)
);

-- Create some sample crop data
INSERT INTO crops (name, variety, growth_period_days, water_requirement, ideal_temperature) VALUES
  ('Corn', 'Sweet Corn', 80, 'Medium-High', '21-32°C'),
  ('Wheat', 'Hard Red Winter', 120, 'Medium', '15-24°C'),
  ('Tomato', 'Roma', 75, 'Medium', '18-29°C'),
  ('Potato', 'Russet', 100, 'Medium', '15-20°C'),
  ('Soybean', 'Regular', 100, 'Medium', '20-30°C');

-- Set up RLS policies
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own farmer profile" ON farmers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own farmer profile" ON farmers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own farmer profile" ON farmers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE farmlands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view their own farmlands" ON farmlands
  FOR SELECT USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Farmers can create farmlands" ON farmlands
  FOR INSERT WITH CHECK (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT ON crops TO authenticated, anon;
