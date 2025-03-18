import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create a Supabase client with the service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Export for client-side usage with anon key if needed
export const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
