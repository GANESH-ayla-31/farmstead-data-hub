
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Use environment variables if available, otherwise use these development defaults
// IMPORTANT: These should be replaced with your actual Supabase project values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== 'https://your-supabase-project-url.supabase.co' &&
    supabaseKey !== 'your-supabase-anon-key' &&
    supabaseUrl.includes('.supabase.co')
  );
};
