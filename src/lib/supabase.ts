
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

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',  // Placeholder to avoid initialization error
  supabaseKey || 'placeholder_key',                  // Placeholder to avoid initialization error
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl.includes('.supabase.co') &&
    supabaseKey.length > 10
  );
};

// Function to verify the database connection works
export const verifyDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test if we can connect to the database
    const { data, error } = await supabase
      .from('farmers')
      .select('id')
      .limit(1);
    
    // If there's no error, the connection works
    if (!error) {
      console.log('Database connection successful');
      return true;
    } else {
      console.error('Database connection failed:', error.message);
      return false;
    }
  } catch (error) {
    console.error('Error checking database connection:', error);
    return false;
  }
};
