
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Display a warning if environment variables are missing
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase environment variables are missing. ' +
    'The application will use placeholder values, but database features will not work correctly.'
  );
}

// Create Supabase client with proper error handling
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',  // Placeholder to avoid initialization error
  supabaseKey || 'placeholder_key',                   // Placeholder to avoid initialization error
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
  }
);

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  const isConfigured = Boolean(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl.includes('.supabase.co') &&
    supabaseKey.length > 10
  );
  
  if (isConfigured) {
    console.log('Supabase connection is properly configured.');
  } else {
    console.warn('Supabase connection is not properly configured. Some features may not work.');
  }
  
  return isConfigured;
};

// Helper function to verify database connectivity by adding test data
export const verifyDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing database connectivity...');
    // Try to read from crops table which has public access
    const { data, error } = await supabase
      .from('crops')
      .select('name')
      .limit(1);
    
    if (error) {
      console.error('Database connectivity test failed:', error);
      return false;
    }
    
    console.log('Database connectivity successful. Sample data:', data);
    return true;
  } catch (e) {
    console.error('Database connectivity test failed with exception:', e);
    return false;
  }
};
