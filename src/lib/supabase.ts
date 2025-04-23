
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl.includes('.supabase.co') &&
    supabaseKey.length > 0
  );
};
