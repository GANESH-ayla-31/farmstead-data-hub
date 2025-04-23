
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

-- Create fertilizers table
CREATE TABLE IF NOT EXISTS fertilizers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  npk_ratio TEXT NOT NULL,
  application_method TEXT NOT NULL,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT
);

-- Create pesticides table
CREATE TABLE IF NOT EXISTS pesticides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target_pests TEXT NOT NULL,
  active_ingredients TEXT NOT NULL,
  application_rate TEXT NOT NULL,
  safety_interval_days INTEGER NOT NULL,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT
);

-- Create yield_records table
CREATE TABLE IF NOT EXISTS yield_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
  harvest_date DATE NOT NULL,
  quantity_kg NUMERIC(10, 2) NOT NULL,
  quality_grade TEXT NOT NULL,
  notes TEXT,
  income NUMERIC(10, 2)
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  farmland_id UUID NOT NULL REFERENCES farmlands(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  temperature_high NUMERIC(5, 2) NOT NULL,
  temperature_low NUMERIC(5, 2) NOT NULL,
  rainfall_mm NUMERIC(6, 2) NOT NULL,
  humidity_percent NUMERIC(5, 2) NOT NULL,
  wind_speed_kmh NUMERIC(5, 2) NOT NULL,
  notes TEXT
);

-- Create market_locations table
CREATE TABLE IF NOT EXISTS market_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL,
  contact_person TEXT,
  contact_number TEXT,
  operation_hours TEXT,
  notes TEXT
);

-- Create market_prices table
CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  market_location_id UUID NOT NULL REFERENCES market_locations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  price_per_kg NUMERIC(10, 2) NOT NULL,
  price_trend TEXT NOT NULL CHECK (price_trend IN ('rising', 'stable', 'falling')),
  notes TEXT
);

-- Create soil_conditions table
CREATE TABLE IF NOT EXISTS soil_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  farmland_id UUID NOT NULL REFERENCES farmlands(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  soil_type TEXT NOT NULL,
  ph_level NUMERIC(4, 2) NOT NULL,
  organic_matter_percent NUMERIC(5, 2) NOT NULL,
  nitrogen_level TEXT NOT NULL CHECK (nitrogen_level IN ('low', 'medium', 'high')),
  phosphorus_level TEXT NOT NULL CHECK (phosphorus_level IN ('low', 'medium', 'high')),
  potassium_level TEXT NOT NULL CHECK (potassium_level IN ('low', 'medium', 'high')),
  other_nutrients JSONB,
  recommendations TEXT
);

-- Create best_practices table
CREATE TABLE IF NOT EXISTS best_practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  author TEXT,
  publication_date DATE,
  tags TEXT[]
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  farmland_id UUID REFERENCES farmlands(id) ON DELETE SET NULL,
  crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  due_date DATE,
  completed_date DATE
);

-- Create community_forum table
CREATE TABLE IF NOT EXISTS community_forum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  is_solved BOOLEAN DEFAULT FALSE
);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  post_id UUID NOT NULL REFERENCES community_forum(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT FALSE
);

-- Create some sample crop data
INSERT INTO crops (name, variety, growth_period_days, water_requirement, ideal_temperature) VALUES
  ('Corn', 'Sweet Corn', 80, 'Medium-High', '21-32°C'),
  ('Wheat', 'Hard Red Winter', 120, 'Medium', '15-24°C'),
  ('Tomato', 'Roma', 75, 'Medium', '18-29°C'),
  ('Potato', 'Russet', 100, 'Medium', '15-20°C'),
  ('Soybean', 'Regular', 100, 'Medium', '20-30°C')
ON CONFLICT DO NOTHING;

-- Sample fertilizers
INSERT INTO fertilizers (name, type, npk_ratio, application_method, price_per_unit, unit, notes) VALUES
  ('SuperGrow Nitrogen Plus', 'Nitrogen', '34-0-0', 'Broadcast', 25.99, 'kg', 'Best for leafy vegetables'),
  ('BalancedNutrient Pro', 'Complete', '10-10-10', 'Side-dress', 18.50, 'kg', 'General purpose fertilizer'),
  ('PhosphoBoost', 'Phosphorus', '0-45-0', 'Incorporate', 22.75, 'kg', 'Promotes root development')
ON CONFLICT DO NOTHING;

-- Sample pesticides
INSERT INTO pesticides (name, type, target_pests, active_ingredients, application_rate, safety_interval_days, price_per_unit, unit, notes) VALUES
  ('BugAway', 'Insecticide', 'Aphids, Thrips', 'Pyrethrins', '1.5-2ml per liter', 7, 12.99, 'liter', 'Organic certified'),
  ('FungusStop', 'Fungicide', 'Powdery Mildew, Leaf Spot', 'Copper Hydroxide', '20g per 10 liters', 14, 19.50, 'kg', 'Apply before symptoms appear'),
  ('WeedClear Pro', 'Herbicide', 'Broadleaf Weeds', 'Glyphosate', '30ml per liter', 21, 15.75, 'liter', 'Non-selective, use with caution')
ON CONFLICT DO NOTHING;

-- Sample market locations
INSERT INTO market_locations (name, address, type, contact_person, contact_number, operation_hours, notes) VALUES
  ('City Farmers Market', '123 Market St, Downtown', 'Wholesale', 'John Smith', '555-123-4567', 'Mon-Sat 6am-2pm', 'High foot traffic'),
  ('Green Valley Co-op', '456 Rural Route, Green Valley', 'Co-operative', 'Mary Johnson', '555-987-6543', 'Wed & Sat 8am-12pm', 'Organic focus'),
  ('Agri-Export Terminal', '789 Harbor Way, Port District', 'Export', 'Robert Chen', '555-555-1234', 'Mon-Fri 8am-5pm', 'International shipping available')
ON CONFLICT DO NOTHING;

-- Sample best practices
INSERT INTO best_practices (crop_id, title, category, content, source, author, publication_date, tags) VALUES
  ((SELECT id FROM crops WHERE name = 'Corn' LIMIT 1), 'Optimal Corn Spacing', 'Planting', 'Plant corn in blocks of at least 4 rows for proper pollination. Space plants 8-12 inches apart with rows 30-36 inches apart.', 'Agricultural Extension Service', 'Dr. Jane Wilson', '2024-01-15', ARRAY['corn', 'planting', 'spacing']),
  ((SELECT id FROM crops WHERE name = 'Tomato' LIMIT 1), 'Tomato Pruning Guide', 'Maintenance', 'Remove suckers (shoots growing in the crotch between stem and branch) regularly. Prune lower branches as the plant grows to improve air circulation.', 'Home Gardener Magazine', 'Michael Green', '2024-02-20', ARRAY['tomato', 'pruning', 'disease prevention']),
  (NULL, 'Water Conservation Techniques', 'Resource Management', 'Implement drip irrigation systems to reduce water usage by up to 60%. Apply mulch around plants to retain soil moisture and suppress weeds.', 'Sustainable Farming Initiative', 'Sarah Chen', '2024-03-10', ARRAY['water', 'conservation', 'sustainability'])
ON CONFLICT DO NOTHING;

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

-- RLS for new tables
ALTER TABLE fertilizers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view fertilizers" ON fertilizers
  FOR SELECT TO authenticated USING (true);

ALTER TABLE pesticides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view pesticides" ON pesticides
  FOR SELECT TO authenticated USING (true);

ALTER TABLE yield_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view yield records for their crop cycles" ON yield_records
  FOR SELECT USING (
    crop_cycle_id IN (
      SELECT cc.id FROM crop_cycles cc
      JOIN farmlands f ON cc.farmland_id = f.id
      JOIN farmers fm ON f.farmer_id = fm.id
      WHERE fm.user_id = auth.uid()
    )
  );

ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view weather data for their farmlands" ON weather_data
  FOR SELECT USING (
    farmland_id IN (
      SELECT f.id FROM farmlands f
      JOIN farmers fm ON f.farmer_id = fm.id
      WHERE fm.user_id = auth.uid()
    )
  );

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view market prices" ON market_prices
  FOR SELECT USING (true);

ALTER TABLE market_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view market locations" ON market_locations
  FOR SELECT USING (true);

ALTER TABLE soil_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view soil conditions for their farmlands" ON soil_conditions
  FOR SELECT USING (
    farmland_id IN (
      SELECT f.id FROM farmlands f
      JOIN farmers fm ON f.farmer_id = fm.id
      WHERE fm.user_id = auth.uid()
    )
  );

ALTER TABLE best_practices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view best practices" ON best_practices
  FOR SELECT USING (true);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can view their recommendations" ON recommendations
  FOR SELECT USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

ALTER TABLE community_forum ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view forum posts" ON community_forum
  FOR SELECT USING (true);
CREATE POLICY "Users can create forum posts" ON community_forum
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own forum posts" ON community_forum
  FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view forum comments" ON forum_comments
  FOR SELECT USING (true);
CREATE POLICY "Users can create forum comments" ON forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own forum comments" ON forum_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON crops, fertilizers, pesticides, market_locations, market_prices, best_practices, community_forum, forum_comments TO authenticated, anon;
