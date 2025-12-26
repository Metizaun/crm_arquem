import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mvvakdsezhfywjdgaqde.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dmFrZHNlemhmeXdqZGdhcWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NzAzMDcsImV4cCI6MjA3MzA0NjMwN30.kig0vDmEWm8WcX57H1h39daKalDBKOcIiF20kttqTJY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: {
    schema: 'crm'
  },
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});