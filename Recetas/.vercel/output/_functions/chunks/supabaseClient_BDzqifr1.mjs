import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://tnzpojvhsxjzfachozid.supabase.co";
const supabaseAnonKey = "sb_publishable_rJKjnreA7A8lP_zTwgvGxw_FMciqFlo";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: async (name, acquireTimeout, fn) => {
      return await fn();
    }
  }
});

export { supabase as s };
