import { createClient } from "@supabase/supabase-js";

// Create singleton instances to prevent multiple client instances
let supabaseInstance = null;
let supabaseAdminInstance = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    console.log(
      "🔧 Creating Supabase client with URL: https://svpzwuscvkpqrhupempr.supabase.co"
    );
    console.log(
      "🔧 Using API key length:",
      import.meta.env.VITE_SUPABASE_PROD_API_KEY?.length
    );
    console.log(
      "🔧 API key starts with:",
      import.meta.env.VITE_SUPABASE_PROD_API_KEY?.substring(0, 10)
    );
    console.log(
      "⚠️ WARNING: Make sure this is the ANON key, not the service role key!"
    );

    supabaseInstance = createClient(
      "https://svpzwuscvkpqrhupempr.supabase.co",
      import.meta.env.VITE_SUPABASE_PROD_API_KEY
    );
  }
  return supabaseInstance;
})();

// Admin client - only create when needed to avoid interference with main client
export const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    console.log(
      "🔧 Creating Supabase Admin client with URL: https://arjfkgxvlwxbpdfrkbtb.supabase.co"
    );
    console.log(
      "⚠️ WARNING: Admin client should only be used for admin operations!"
    );
    supabaseAdminInstance = createClient(
      "https://arjfkgxvlwxbpdfrkbtb.supabase.co",
      import.meta.env.VITE_SUPABASE_ADMIN_SERVICE_ROLE_KEY
    );
  }
  return supabaseAdminInstance;
};
