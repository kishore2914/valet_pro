-- ==============================================================================
-- CASCADING DELETE FIX FOR FOREIGN KEYS
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This drops existing foreign key constraints and recreates them with 'ON DELETE CASCADE'
-- so that deleting a parent record (e.g. Company, City, or Location) automatically
-- cleans up child records and avoids foreign key constraint errors.

-- 1. Cascade deletions from locations to companies and cities
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_company_id_fkey;
ALTER TABLE locations ADD CONSTRAINT locations_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_city_id_fkey;
ALTER TABLE locations ADD CONSTRAINT locations_city_id_fkey 
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;

-- 2. Cascade deletions from vehicles to locations
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_location_id_fkey;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_venue_id_fkey;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- 3. Cascade deletions from staff to locations
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_location_id_fkey;
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_venue_id_fkey;
ALTER TABLE staff ADD CONSTRAINT staff_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- 4. Cascade deletions from incidents to locations
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_location_id_fkey;
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_venue_id_fkey;
ALTER TABLE incidents ADD CONSTRAINT incidents_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- 5. Cascade deletions from bookings to locations
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_location_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_venue_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- 6. Cascade deletions from user_locations mapping
ALTER TABLE user_locations DROP CONSTRAINT IF EXISTS user_locations_location_id_fkey;
ALTER TABLE user_locations ADD CONSTRAINT user_locations_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- 7. Recreate setup_multi_locations RPC with text column support
CREATE OR REPLACE FUNCTION setup_multi_locations(
    p_user_id UUID,
    p_locations JSONB -- Array of { companyName, cityName, hotelName }
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    loc_record JSONB;
    v_company_id UUID;
    v_city_id UUID;
    v_location_id UUID;
    v_first_location_id UUID := NULL;
BEGIN
    FOR loc_record IN SELECT * FROM jsonb_array_elements(p_locations)
    LOOP
        -- Find or create company
        SELECT id INTO v_company_id FROM companies WHERE company_name = loc_record->>'companyName';
        IF v_company_id IS NULL THEN
            INSERT INTO companies (company_name) VALUES (loc_record->>'companyName') RETURNING id INTO v_company_id;
        END IF;

        -- Find or create city
        SELECT id INTO v_city_id FROM cities WHERE city_name = loc_record->>'cityName';
        IF v_city_id IS NULL THEN
            INSERT INTO cities (city_name) VALUES (loc_record->>'cityName') RETURNING id INTO v_city_id;
        END IF;

        -- Create location with both relation IDs and text column representations
        INSERT INTO locations (name, company_id, city_id, owner_id, company_name, city) 
        VALUES (
            loc_record->>'hotelName', 
            v_company_id, 
            v_city_id, 
            p_user_id, 
            loc_record->>'companyName', 
            loc_record->>'cityName'
        ) 
        RETURNING id INTO v_location_id;

        -- Link to user
        INSERT INTO user_locations (user_id, location_id) VALUES (p_user_id, v_location_id);

        -- Keep track of the first location created to return it (useful for initial payment tracking)
        IF v_first_location_id IS NULL THEN
            v_first_location_id := v_location_id;
        END IF;
    END LOOP;

    RETURN v_first_location_id;
END;
$$;

