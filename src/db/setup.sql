
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS farmlands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  size_hectares NUMERIC(10, 2) NOT NULL CHECK (size_hectares > 0),
  soil_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  variety TEXT NOT NULL,
  growth_period_days INTEGER NOT NULL CHECK (growth_period_days > 0),
  water_requirement TEXT NOT NULL, -- e.g., low, medium, high
  ideal_temperature TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fertilizer', 'pesticide', 'seed', 'equipment', 'other')),
  unit TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  supplier TEXT NOT NULL,
  cost_per_unit NUMERIC(10, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  expiry_date DATE
);

CREATE TABLE IF NOT EXISTS resource_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crop_cycle_id UUID NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  application_date DATE NOT NULL,
  quantity_used NUMERIC(10, 2) NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  farmland_id UUID NOT NULL REFERENCES farmlands(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  temperature NUMERIC(5, 2) NOT NULL, -- in Celsius
  humidity NUMERIC(5, 2) NOT NULL, -- percentage
  rainfall NUMERIC(5, 2) NOT NULL, -- in mm
  wind_speed NUMERIC(5, 2) NOT NULL, -- in m/s
  notes TEXT
);

CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  price_per_kg NUMERIC(10, 2) NOT NULL,
  market_location TEXT NOT NULL,
  notes TEXT
);

-- Create views for common queries
CREATE OR REPLACE VIEW active_crop_cycles AS
SELECT 
  cc.id,
  cc.farmland_id,
  f.name AS farmland_name,
  fr.id AS farmer_id,
  fr.name AS farmer_name,
  cc.crop_id,
  c.name AS crop_name,
  c.variety AS crop_variety,
  cc.planting_date,
  cc.expected_harvest_date,
  CASE 
    WHEN cc.status = 'harvested' OR cc.status = 'failed' THEN 0
    ELSE GREATEST(0, (cc.expected_harvest_date - CURRENT_DATE))
  END AS days_to_harvest,
  cc.status,
  cc.area_hectares
FROM 
  crop_cycles cc
  JOIN farmlands f ON cc.farmland_id = f.id
  JOIN farmers fr ON f.farmer_id = fr.id
  JOIN crops c ON cc.crop_id = c.id;

CREATE OR REPLACE VIEW resource_inventory AS
SELECT 
  r.id,
  r.name,
  r.type,
  r.quantity - COALESCE(SUM(ru.quantity_used), 0) AS quantity_available,
  r.unit,
  r.supplier,
  r.cost_per_unit,
  (r.quantity * r.cost_per_unit) AS total_cost,
  CASE
    WHEN r.expiry_date IS NOT NULL THEN (r.expiry_date - CURRENT_DATE)
  END AS days_to_expiry
FROM 
  resources r
  LEFT JOIN resource_usage ru ON r.id = ru.resource_id
GROUP BY 
  r.id, r.name, r.type, r.quantity, r.unit, r.supplier, r.cost_per_unit, r.expiry_date;

CREATE OR REPLACE VIEW crop_yield_summary AS
SELECT 
  fr.id AS farmer_id,
  fr.name AS farmer_name,
  c.id AS crop_id,
  c.name AS crop_name,
  COUNT(cc.id) AS total_cycles,
  CASE 
    WHEN SUM(cc.area_hectares) = 0 THEN 0
    ELSE SUM(cc.yield_kg) / SUM(cc.area_hectares)
  END AS avg_yield_per_hectare,
  SUM(cc.yield_kg) AS total_yield,
  SUM(cc.area_hectares) AS total_area
FROM 
  crop_cycles cc
  JOIN farmlands f ON cc.farmland_id = f.id
  JOIN farmers fr ON f.farmer_id = fr.id
  JOIN crops c ON cc.crop_id = c.id
WHERE 
  cc.status = 'harvested' AND cc.yield_kg IS NOT NULL
GROUP BY 
  fr.id, fr.name, c.id, c.name;

-- Create functions for complex queries
CREATE OR REPLACE FUNCTION get_farmer_dashboard(farmer_id UUID)
RETURNS TABLE (
  active_crops BIGINT,
  upcoming_harvests BIGINT,
  total_farmland NUMERIC,
  low_resources BIGINT
) LANGUAGE sql AS $$
  SELECT
    (SELECT COUNT(*) FROM crop_cycles cc
     JOIN farmlands f ON cc.farmland_id = f.id
     WHERE f.farmer_id = get_farmer_dashboard.farmer_id AND cc.status = 'growing'),
    (SELECT COUNT(*) FROM crop_cycles cc
     JOIN farmlands f ON cc.farmland_id = f.id
     WHERE f.farmer_id = get_farmer_dashboard.farmer_id 
     AND cc.status = 'growing'
     AND cc.expected_harvest_date - CURRENT_DATE <= 14),
    (SELECT COALESCE(SUM(size_hectares), 0) FROM farmlands 
     WHERE farmer_id = get_farmer_dashboard.farmer_id),
    (SELECT COUNT(*) FROM resource_inventory 
     WHERE quantity_available <= 10)
$$;

CREATE OR REPLACE FUNCTION calculate_estimated_profit(crop_cycle_id UUID)
RETURNS TABLE (
  estimated_yield NUMERIC,
  estimated_revenue NUMERIC,
  estimated_cost NUMERIC,
  estimated_profit NUMERIC
) LANGUAGE sql AS $$
  WITH yield_estimate AS (
    SELECT
      cc.id,
      cc.crop_id,
      cc.area_hectares,
      COALESCE(
        (SELECT AVG(yield_kg / area_hectares)
         FROM crop_cycles
         WHERE crop_id = cc.crop_id AND status = 'harvested' AND yield_kg IS NOT NULL),
        0
      ) * cc.area_hectares AS est_yield
    FROM crop_cycles cc
    WHERE cc.id = calculate_estimated_profit.crop_cycle_id
  ),
  latest_price AS (
    SELECT
      ye.id,
      COALESCE(
        (SELECT price_per_kg
         FROM market_prices
         WHERE crop_id = ye.crop_id
         ORDER BY date DESC
         LIMIT 1),
        0
      ) AS price
    FROM yield_estimate ye
  ),
  resource_costs AS (
    SELECT
      crop_cycle_id,
      SUM(ru.quantity_used * r.cost_per_unit) AS total_cost
    FROM resource_usage ru
    JOIN resources r ON ru.resource_id = r.id
    WHERE ru.crop_cycle_id = calculate_estimated_profit.crop_cycle_id
    GROUP BY ru.crop_cycle_id
  )
  SELECT
    ye.est_yield,
    ye.est_yield * lp.price AS est_revenue,
    COALESCE(rc.total_cost, 0) AS est_cost,
    (ye.est_yield * lp.price) - COALESCE(rc.total_cost, 0) AS est_profit
  FROM yield_estimate ye
  JOIN latest_price lp ON ye.id = lp.id
  LEFT JOIN resource_costs rc ON ye.id = rc.crop_cycle_id;
$$;

-- Set up Row Level Security
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmlands ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Farmers can view their own data" ON farmers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Farmers can view their own farmlands" ON farmlands
  FOR SELECT USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can view their own crop cycles" ON crop_cycles
  FOR SELECT USING (
    farmland_id IN (
      SELECT f.id FROM farmlands f
      JOIN farmers fr ON f.farmer_id = fr.id
      WHERE fr.user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can view resource data" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Farmers can view resource usage for their crops" ON resource_usage
  FOR SELECT USING (
    crop_cycle_id IN (
      SELECT cc.id FROM crop_cycles cc
      JOIN farmlands f ON cc.farmland_id = f.id
      JOIN farmers fr ON f.farmer_id = fr.id
      WHERE fr.user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can view weather data for their farmlands" ON weather_data
  FOR SELECT USING (
    farmland_id IN (
      SELECT f.id FROM farmlands f
      JOIN farmers fr ON f.farmer_id = fr.id
      WHERE fr.user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can view market prices" ON market_prices
  FOR SELECT USING (true);

-- Insert policies for create, update, delete operations
CREATE POLICY "Farmers can update their own data" ON farmers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Farmers can create farmlands" ON farmlands
  FOR INSERT WITH CHECK (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can update their farmlands" ON farmlands
  FOR UPDATE USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can delete their farmlands" ON farmlands
  FOR DELETE USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- Create some sample data for testing
INSERT INTO crops (name, variety, growth_period_days, water_requirement, ideal_temperature) VALUES
  ('Wheat', 'Hard Red Winter', 120, 'Medium', '15-21°C'),
  ('Corn', 'Sweet Corn', 80, 'High', '20-30°C'),
  ('Soybeans', 'Regular', 100, 'Medium', '20-30°C'),
  ('Rice', 'Basmati', 120, 'Very High', '24-30°C'),
  ('Potatoes', 'Russet', 90, 'Medium', '15-20°C'),
  ('Tomatoes', 'Roma', 75, 'Medium', '20-25°C');
