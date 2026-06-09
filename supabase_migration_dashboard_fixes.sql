-- ==============================================================================
-- VALET PRO: DASHBOARD SCHEMA FIXES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script adds the missing columns to the 'vehicles' and 'bookings' tables.

-- 1. Update 'vehicles' table with dashboard columns
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tip_amount NUMERIC DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS payment_amount NUMERIC DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS key_code TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS token TEXT;

-- 2. Update 'bookings' table with high-fidelity columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS res_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hotel_name TEXT DEFAULT 'Grand Hyatt';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS car_model TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS party_size TEXT DEFAULT 'Party of 2';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Standard';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pre_auth INTEGER DEFAULT 300;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_request TEXT;

-- 3. Re-establish Unique Constraint on bookings to avoid duplicates
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_location_res_unique;
ALTER TABLE bookings ADD CONSTRAINT bookings_location_res_unique UNIQUE (location_id, res_id);

-- 4. Update 'staff' table with screenshot columns
ALTER TABLE staff ADD COLUMN IF NOT EXISTS zone TEXT DEFAULT 'Zone A';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS shift TEXT DEFAULT '6AM - 2PM';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS speaks TEXT DEFAULT 'Tamil, English';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS license TEXT;
