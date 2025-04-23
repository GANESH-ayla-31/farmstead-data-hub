
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',  // Placeholder to avoid initialization error
  supabaseKey || 'placeholder_key'                   // Placeholder to avoid initialization error
);

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl.includes('.supabase.co') &&
    supabaseKey.length > 0
  );
};
