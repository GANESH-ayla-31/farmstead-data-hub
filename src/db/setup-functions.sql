
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
  -- Insert the farmer with the provided details
  INSERT INTO farmers (user_id, name, email, contact_number, address)
  VALUES (p_user_id, p_name, p_email, p_contact_number, p_address)
  RETURNING id INTO v_farmer_id;
  
  RETURN v_farmer_id;
END;
$$;

-- Alternative function that accepts parameters in any order
CREATE OR REPLACE FUNCTION create_farmer_flexible(
  p_address TEXT,
  p_contact_number TEXT, 
  p_email TEXT,
  p_name TEXT,
  p_user_id UUID
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_farmer_id UUID;
BEGIN
  -- Insert the farmer with the provided details
  INSERT INTO farmers (user_id, name, email, contact_number, address)
  VALUES (p_user_id, p_name, p_email, p_contact_number, p_address)
  RETURNING id INTO v_farmer_id;
  
  RETURN v_farmer_id;
END;
$$;

-- Remove RLS for farmers temporarily to allow direct inserts
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;

-- Grant execute permission on the functions
GRANT EXECUTE ON FUNCTION create_farmer(UUID, TEXT, TEXT, TEXT, TEXT) TO public;
GRANT EXECUTE ON FUNCTION create_farmer_flexible(TEXT, TEXT, TEXT, TEXT, UUID) TO public;

-- Grant insert permission on farmers table
GRANT INSERT, SELECT ON farmers TO public;
