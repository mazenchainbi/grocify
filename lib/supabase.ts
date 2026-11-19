import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/expo';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const useSupabase = () => {
  const { getToken } = useAuth();

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (url, options = {}) => {
        // This gets the Clerk token to authenticate with Supabase
        const clerkToken = await getToken(); 
        const headers = new Headers(options?.headers);
        headers.set('Authorization', `Bearer ${clerkToken}`);
        return fetch(url, { ...options, headers });
      },
    },
  });

  return supabase;
};