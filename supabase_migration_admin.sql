-- ==============================================================================
-- PLATFORM ADMIN / SUPER ADMIN DATABASE MIGRATION
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script alters tables, sets up constraints, and seeds companies, cities,
-- locations, and audit logs.

-- 1. Create tables if they do not exist
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure locations has relations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Professional';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS staff_count INTEGER DEFAULT 8;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS vehicles_processed INTEGER DEFAULT 120000;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS monthly_fee TEXT DEFAULT '₹9,999/mo';


-- Create platform audit logs table
CREATE TABLE IF NOT EXISTS platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default platform settings
INSERT INTO platform_settings (key, value) VALUES
    ('pricing_starter', '3999'),
    ('pricing_pro', '7999'),
    ('pricing_enterprise', '24999')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Enable Row Level Security
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone (anonymous and authenticated) to fetch settings
DROP POLICY IF EXISTS platform_settings_select_policy ON platform_settings;
CREATE POLICY platform_settings_select_policy ON platform_settings
    FOR SELECT USING (true);

-- Allow full access for admin users
DROP POLICY IF EXISTS platform_settings_admin_policy ON platform_settings;
CREATE POLICY platform_settings_admin_policy ON platform_settings
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());


-- Add unique constraint for seeding locations
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_name_company_unique;
ALTER TABLE locations ADD CONSTRAINT locations_name_company_unique UNIQUE (name, company_name);

-- 2. Seed Cities
INSERT INTO cities (city_name) VALUES ('Chennai') ON CONFLICT (city_name) DO NOTHING;
INSERT INTO cities (city_name) VALUES ('Mumbai') ON CONFLICT (city_name) DO NOTHING;
INSERT INTO cities (city_name) VALUES ('Bengaluru') ON CONFLICT (city_name) DO NOTHING;
INSERT INTO cities (city_name) VALUES ('New Delhi') ON CONFLICT (city_name) DO NOTHING;
INSERT INTO cities (city_name) VALUES ('Pune') ON CONFLICT (city_name) DO NOTHING;
INSERT INTO cities (city_name) VALUES ('Hyderabad') ON CONFLICT (city_name) DO NOTHING;

-- 3. Seed Companies (Chains)
INSERT INTO companies (company_name) VALUES ('Taj Hotels Group') ON CONFLICT (company_name) DO NOTHING;
INSERT INTO companies (company_name) VALUES ('ITC Hotels') ON CONFLICT (company_name) DO NOTHING;
INSERT INTO companies (company_name) VALUES ('Phoenix Mills Ltd') ON CONFLICT (company_name) DO NOTHING;
INSERT INTO companies (company_name) VALUES ('Apollo Hospitals Enterprise') ON CONFLICT (company_name) DO NOTHING;

-- 4. Seed Chain Branches
DO $$
DECLARE
    v_taj_id UUID;
    v_itc_id UUID;
    v_px_id UUID;
    v_ah_id UUID;
    
    v_chennai_id UUID;
    v_mumbai_id UUID;
    v_blr_id UUID;
    v_delhi_id UUID;
    v_pune_id UUID;
    v_hyd_id UUID;
BEGIN
    -- Fetch company IDs
    SELECT id INTO v_taj_id FROM companies WHERE company_name = 'Taj Hotels Group';
    SELECT id INTO v_itc_id FROM companies WHERE company_name = 'ITC Hotels';
    SELECT id INTO v_px_id FROM companies WHERE company_name = 'Phoenix Mills Ltd';
    SELECT id INTO v_ah_id FROM companies WHERE company_name = 'Apollo Hospitals Enterprise';

    -- Fetch city IDs
    SELECT id INTO v_chennai_id FROM cities WHERE city_name = 'Chennai';
    SELECT id INTO v_mumbai_id FROM cities WHERE city_name = 'Mumbai';
    SELECT id INTO v_blr_id FROM cities WHERE city_name = 'Bengaluru';
    SELECT id INTO v_delhi_id FROM cities WHERE city_name = 'New Delhi';
    SELECT id INTO v_pune_id FROM cities WHERE city_name = 'Pune';
    SELECT id INTO v_hyd_id FROM cities WHERE city_name = 'Hyderabad';

    -- Seeding Taj branches
    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Taj Coromandel', 'Taj Hotels Group', v_taj_id, 'Chennai', v_chennai_id, 'Professional', 'active', 6, 62000, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Taj Connemara', 'Taj Hotels Group', v_taj_id, 'Chennai', v_chennai_id, 'Professional', 'active', 8, 48000, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Taj Mahal Palace, Mumbai', 'Taj Hotels Group', v_taj_id, 'Mumbai', v_mumbai_id, 'Enterprise', 'active', 18, 92000, '₹24,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Taj West End, Bengaluru', 'Taj Hotels Group', v_taj_id, 'Bengaluru', v_blr_id, 'Professional', 'active', 10, 42120, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    -- Seeding ITC branches
    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('ITC Grand Chola', 'ITC Hotels', v_itc_id, 'Chennai', v_chennai_id, 'Enterprise', 'active', 18, 220000, '₹24,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('ITC Gardenia', 'ITC Hotels', v_itc_id, 'Bengaluru', v_blr_id, 'Professional', 'active', 14, 150000, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('ITC Maurya', 'ITC Hotels', v_itc_id, 'New Delhi', v_delhi_id, 'Professional', 'active', 15, 103600, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    -- Seeding Phoenix branches
    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Phoenix MarketCity, Chennai', 'Phoenix Mills Ltd', v_px_id, 'Chennai', v_chennai_id, 'Enterprise', 'active', 24, 210080, '₹24,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Phoenix Palladium, Mumbai', 'Phoenix Mills Ltd', v_px_id, 'Mumbai', v_mumbai_id, 'Enterprise', 'active', 30, 263000, '₹24,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Phoenix MarketCity, Pune', 'Phoenix Mills Ltd', v_px_id, 'Pune', v_pune_id, 'Professional', 'active', 20, 200000, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    -- Seeding Apollo branches
    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Apollo Greams Road', 'Apollo Hospitals Enterprise', v_ah_id, 'Chennai', v_chennai_id, 'Enterprise', 'active', 22, 205110, '₹24,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Apollo Specialty, Chennai', 'Apollo Hospitals Enterprise', v_ah_id, 'Chennai', v_chennai_id, 'Professional', 'active', 18, 150000, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Apollo Health City, Hyderabad', 'Apollo Hospitals Enterprise', v_ah_id, 'Hyderabad', v_hyd_id, 'Enterprise', 'active', 20, 250000, '₹24,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    -- Seeding Standalones (company_id = NULL)
    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Grand Hyatt Chennai', 'Standalone', NULL, 'Chennai', v_chennai_id, 'Professional', 'active', 8, 125000, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('VR Mall', 'Standalone', NULL, 'Chennai', v_chennai_id, 'Starter', 'active', 5, 45000, '₹4,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('Express Avenue', 'Standalone', NULL, 'Chennai', v_chennai_id, 'Professional', 'inactive', 8, 0, '₹9,999/mo')
    ON CONFLICT (name, company_name) DO NOTHING;

    INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee)
    VALUES ('TIDEL Park', 'Standalone', NULL, 'Chennai', v_chennai_id, 'Starter', 'trial', 4, 3000, 'Free Trial')
    ON CONFLICT (name, company_name) DO NOTHING;

END $$;

-- 5. Seed Platform Audit Logs
INSERT INTO platform_audit_logs (title, description, created_at)
VALUES 
    ('Client onboarded', 'Radisson Blu - Bengaluru', NOW() - INTERVAL '2 hours'),
    ('Plan upgraded', 'VR Mall: Starter → Professional', NOW() - INTERVAL '5 hours'),
    ('Security alert resolved', 'Unauthorized access attempt at ITC Grand Chola', NOW() - INTERVAL '1 day'),
    ('New location added', 'Phoenix MarketCity - Velachery Branch', NOW() - INTERVAL '2 days'),
    ('Payment received', 'Apollo Hospital - ₹39,999 cleared', NOW() - INTERVAL '3 days'),
    ('Feature flag toggled', 'API Access enabled for ITC Grand Chola', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;
