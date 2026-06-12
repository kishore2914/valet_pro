const { Client } = require('pg');

const host = 'db.beubdgrbrbbdoopdwxbx.supabase.co';
const user = 'postgres';
const database = 'postgres';
const port = 5432;

const passwords = [
  'Kishore@2914',
  'Kishore2914',
  'kishore2914',
  'firstmetainfra',
  'firstmetainfra123',
  'postgres',
  'password',
  'password123',
  'kishore',
  'kishore123',
  'Kishore@123',
  'Kishore',
  'Kishore@1',
  'ValetPro',
  'valetpro',
  'valetpro123',
  'valetpro@123',
  'valet_pro',
  'valet_pro123',
  'valet_pro@123'
];

async function test() {
  for (const password of passwords) {
    console.log(`Trying password: ${password}...`);
    const client = new Client({
      host,
      user,
      password,
      database,
      port,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Password is: ${password}`);
      await client.end();
      return;
    } catch (e) {
      console.log(`Failed for ${password}: ${e.message}`);
    }
  }
  console.log('All passwords failed.');
}

test();
