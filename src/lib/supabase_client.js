import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

console.log("--- Supabase Connection Check ---");
console.log("URL exists:", !!supabaseUrl);
console.log("Key exists:", !!supabaseAnonKey);
console.log("---------------------------------");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing! Check your .env file and ensure it is in the project root.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);