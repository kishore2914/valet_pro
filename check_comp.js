import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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
  const { data, error } = await supabase.from('companies').select('*').limit(1);
  console.log('companies error:', error);
}

check();
