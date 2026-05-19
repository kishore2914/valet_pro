import { createClient } from '@supabase/supabase-js';

import fs from 'fs';

// Since we are running outside of the React app, we need to read the env variables.
// The .env file is in d:\valet_pro web
const envPath = 'd:\\valet_pro web\\.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  // Get the most recent user
  const { data: users, error: userError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(1);
  if (userError || !users.length) {
    console.error('Error fetching users or no users found', userError);
    return;
  }
  const user = users[0];
  console.log('Most recent user:', user.email, user.id);

  // Get user_locations for this user
  const { data: userLocs, error: locError } = await supabase.from('user_locations').select('*').eq('user_id', user.id);
  console.log('user_locations error:', locError);
  console.log('user_locations data:', userLocs);

  // Test the exact AuthContext query
  const { data: fullLocs, error: fullError } = await supabase.from('user_locations').select(`
    location_id,
    locations (
      id,
      name,
      companies ( company_name ),
      cities ( city_name )
    )
  `).eq('user_id', user.id);
  console.log('AuthContext query error:', fullError);
  console.log('AuthContext query data:', JSON.stringify(fullLocs, null, 2));
}

check();
