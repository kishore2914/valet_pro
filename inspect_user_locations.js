import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
  console.log('--- ALL USER LOCATIONS ---');
  const { data, error } = await supabase
    .from('user_locations')
    .select(`
      user_id,
      location_id,
      locations (
        name
      )
    `);
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}

inspect();
