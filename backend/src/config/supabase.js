const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.warn('[ExamSync Backend] Warning: Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is defined in backend/.env');
}

/**
 * Singleton Supabase client for backend server operations.
 */
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = {
  supabase,
  supabaseUrl,
};
