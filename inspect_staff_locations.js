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
  console.log('--- ALL LOCATIONS (SELECT *) ---');
  const { data: locations, error: locError } = await supabase.from('locations').select('*');
  if (locError) {
    console.error('Locations Error:', locError);
  } else {
    console.log(locations);
  }
}

inspect();
