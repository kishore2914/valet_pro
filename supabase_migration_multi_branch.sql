-- ==============================================================================
-- ENTERPRISE MULTI-BRANCH MIGRATION
-- ==============================================================================

-- 1. Create Hierarchical Tables
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

-- 2. Update Locations Table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- 3. Create user_locations mapping table
CREATE TABLE IF NOT EXISTS user_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, location_id)
);

-- 4. Migrate existing data (backward compatibility)
INSERT INTO user_locations (user_id, location_id)
SELECT id, location_id FROM profiles WHERE location_id IS NOT NULL
ON CONFLICT (user_id, location_id) DO NOTHING;

-- 5. Helper Function for RLS Check
CREATE OR REPLACE FUNCTION check_user_location(check_location_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_locations 
    WHERE user_id = auth.uid() AND location_id = check_location_id
  );
$$;

-- 6. Update Policies
-- Locations
DROP POLICY IF EXISTS location_isolation_policy ON locations;
CREATE POLICY location_isolation_policy ON locations
    FOR ALL
    USING (check_user_location(id) OR owner_id = auth.uid() OR is_admin())
    WITH CHECK (check_user_location(id) OR owner_id = auth.uid() OR is_admin());

-- Vehicles
DROP POLICY IF EXISTS vehicles_location_policy ON vehicles;
CREATE POLICY vehicles_location_policy ON vehicles
    FOR ALL
    USING (check_user_location(location_id) OR is_admin())
    WITH CHECK (check_user_location(location_id) OR is_admin());

-- Staff
DROP POLICY IF EXISTS staff_location_policy ON staff;
CREATE POLICY staff_location_policy ON staff
    FOR ALL
    USING (check_user_location(location_id) OR is_admin())
    WITH CHECK (check_user_location(location_id) OR is_admin());

-- Incidents
DROP POLICY IF EXISTS incidents_location_policy ON incidents;
CREATE POLICY incidents_location_policy ON incidents
    FOR ALL
    USING (check_user_location(location_id) OR is_admin())
    WITH CHECK (check_user_location(location_id) OR is_admin());

-- Bookings
DROP POLICY IF EXISTS bookings_location_policy ON bookings;
CREATE POLICY bookings_location_policy ON bookings
    FOR ALL
    USING (check_user_location(location_id) OR is_admin())
    WITH CHECK (check_user_location(location_id) OR is_admin());

-- Notifications
DROP POLICY IF EXISTS notifications_location_policy ON notifications;
CREATE POLICY notifications_location_policy ON notifications
    FOR ALL
    USING (check_user_location(location_id) OR is_admin())
    WITH CHECK (check_user_location(location_id) OR is_admin());

-- Payments
DROP POLICY IF EXISTS payments_location_policy ON payments;
CREATE POLICY payments_location_policy ON payments
    FOR ALL
    USING (check_user_location(location_id) OR is_admin())
    WITH CHECK (check_user_location(location_id) OR is_admin());

-- 7. Security on new tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_policy ON companies;
CREATE POLICY companies_policy ON companies FOR ALL USING (true) WITH CHECK (is_admin());

DROP POLICY IF EXISTS cities_policy ON cities;
CREATE POLICY cities_policy ON cities FOR ALL USING (true) WITH CHECK (is_admin());

DROP POLICY IF EXISTS user_locations_policy ON user_locations;
CREATE POLICY user_locations_policy ON user_locations FOR ALL
    USING (user_id = auth.uid() OR is_admin())
    WITH CHECK (user_id = auth.uid() OR is_admin());

-- 8. RPC for Multi-Location Signup
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

        -- Create location
        INSERT INTO locations (name, company_id, city_id, owner_id) 
        VALUES (loc_record->>'hotelName', v_company_id, v_city_id, p_user_id) 
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
