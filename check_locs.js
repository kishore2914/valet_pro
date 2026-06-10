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
  const { data: locations, error } = await supabase.from('locations').select('*');
  console.log('Locations count:', locations ? locations.length : 0);
  if (locations && locations.length > 0) {
    console.log('Sample location:', locations[0]);
  }
}




check();

