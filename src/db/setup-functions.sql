
-- Function to create a farmer bypassing RLS
CREATE OR REPLACE FUNCTION create_farmer(
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_contact_number TEXT,
  p_address TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_farmer_id UUID;
BEGIN
  INSERT INTO farmers (user_id, name, email, contact_number, address)
  VALUES (p_user_id, p_name, p_email, p_contact_number, p_address)
  RETURNING id INTO v_farmer_id;
  
  RETURN v_farmer_id;
END;
$$;

-- Modify RLS policy for farmers to allow inserting through our function
CREATE POLICY "Enable insert for authenticated users through function" 
ON farmers FOR INSERT 
WITH CHECK (auth.uid() = user_id);
