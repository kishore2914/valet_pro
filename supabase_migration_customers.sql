-- ==============================================================================
-- CUSTOMERS & VIPS DATABASE MIGRATION
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script creates the 'customers' table, enables RLS, and inserts the
-- high-fidelity seed data for all existing locations.

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    tier TEXT DEFAULT 'Standard',
    visits INTEGER DEFAULT 1,
    spend NUMERIC DEFAULT 0,
    rating NUMERIC(3,1) DEFAULT 5.0,
    is_vip BOOLEAN DEFAULT FALSE,
    notes TEXT,
    vehicles TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (location_id, phone)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist to avoid conflict
DROP POLICY IF EXISTS customers_location_policy ON customers;

-- 4. Create Isolation Policy based on location mapping
CREATE POLICY customers_location_policy ON customers
    FOR ALL
    USING (check_user_location(location_id) OR is_admin())
    WITH CHECK (check_user_location(location_id) OR is_admin());

-- 5. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_customers_location_id ON customers(location_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 6. Seed High-Fidelity Customers Data for all existing locations
DO $$
DECLARE
    loc RECORD;
BEGIN
    FOR loc IN SELECT id FROM locations LOOP
        
        -- Vikram Mehta
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Vikram Mehta',
            '+91 99987 65432',
            'vikram.mehta@gmail.com',
            'Platinum',
            47,
            28400,
            4.9,
            true,
            'Prefers slot A-12. Likes premium tissue box in the vehicle.',
            ARRAY['TN 01 AB 1234', 'TN 01 XY 9999']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Priya Sharma
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Priya Sharma',
            '+91 87654 32109',
            'priya.sharma@yahoo.com',
            'Platinum',
            1,
            350,
            4.5,
            true,
            'No specific instructions.',
            ARRAY['KA 05 CD 5678']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Vikram Singh
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Vikram Singh',
            '+91 54321 09876',
            'vsingh@outlook.com',
            'Platinum',
            1,
            0,
            4.5,
            true,
            'Valet VIP member.',
            ARRAY['MH 12 EF 9012']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Karan Mehta
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Karan Mehta',
            '+91 99987 12345',
            'karan.mehta@hotmail.com',
            'Platinum',
            1,
            500,
            4.5,
            true,
            'Prefers parking in EV charging slots.',
            ARRAY['KA 51 ME 5432']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Nisha Kapoor
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Nisha Kapoor',
            '+91 88776 54321',
            'nisha.k@gmail.com',
            'Platinum',
            1,
            800,
            4.5,
            true,
            'VIP customer.',
            ARRAY['DL 03 AP 7654']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Sneha Kapoor
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Sneha Kapoor',
            '+91 98765 11223',
            'sneha.kapoor@gmail.com',
            'Gold',
            23,
            12800,
            4.7,
            true,
            'Frequent guest. Prefers shaded parking spots.',
            ARRAY['MH 02 BG 4321']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Rajesh Kumar
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Rajesh Kumar',
            '+91 98765 43210',
            'rajesh.kumar@gmail.com',
            'Gold',
            1,
            350,
            4.5,
            true,
            'No specific notes.',
            ARRAY['TN 07 CD 8765']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Arjun Menon
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Arjun Menon',
            '+91 32109 87654',
            'arjun.menon@gmail.com',
            'Gold',
            1,
            600,
            4.5,
            true,
            'No specific notes.',
            ARRAY['KL 07 BG 9876']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Amit Patel
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Amit Patel',
            '+91 78543 21098',
            'amit.patel@gmail.com',
            'Silver',
            1,
            450,
            4.5,
            false,
            'Guest user.',
            ARRAY['MH 12 EF 9012']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Suresh Kumar
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Suresh Kumar',
            '+91 91234 56789',
            'suresh.k@gmail.com',
            'Gold',
            15,
            5400,
            4.8,
            true,
            'VIP customer.',
            ARRAY['TN 01 AB 8888']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Rohan Joshi
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Rohan Joshi',
            '+91 98761 23456',
            'rohan.j@gmail.com',
            'Gold',
            11,
            4200,
            4.6,
            true,
            'Frequent hotel diner.',
            ARRAY['KA 03 MN 4444']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Kiran Rao
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Kiran Rao',
            '+91 94421 87654',
            'kiran.rao@gmail.com',
            'Silver',
            6,
            2100,
            4.4,
            false,
            'Regular diner.',
            ARRAY['KA 04 CD 1212']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Meera Nair
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Meera Nair',
            '+91 90031 98765',
            'meera.nair@gmail.com',
            'Standard',
            2,
            700,
            4.2,
            false,
            'Standard runner.',
            ARRAY['KL 01 XY 3333']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

        -- Deepak Gill
        INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
        VALUES (
            loc.id,
            'Deepak Gill',
            '+91 98401 23456',
            'deepak.gill@gmail.com',
            'Standard',
            4,
            1400,
            4.3,
            false,
            'Standard runner.',
            ARRAY['HR 26 AZ 4567']
        ) ON CONFLICT (location_id, phone) DO NOTHING;

    END LOOP;
END $$;
