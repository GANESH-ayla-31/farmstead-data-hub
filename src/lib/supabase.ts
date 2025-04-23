
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// These values will be replaced with the actual values from Supabase dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
