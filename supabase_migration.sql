-- MIGRATION SCRIPT: Location-Based Data Filtering
-- Run these commands in your Supabase SQL Editor

-- 1. Rename 'venues' table to 'locations' if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'venues') THEN
        ALTER TABLE venues RENAME TO locations;
    END IF;
END $$;

-- 2. Add 'location_id' columns and migrate data if necessary
-- For profiles
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'venue_id') THEN
        ALTER TABLE profiles RENAME COLUMN venue_id TO location_id;
    END IF;
END $$;

-- For vehicles
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'venue_id') THEN
        ALTER TABLE vehicles RENAME COLUMN venue_id TO location_id;
    END IF;
END $$;

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS slot_id TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS parked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- For staff
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'venue_id') THEN
        ALTER TABLE staff RENAME COLUMN venue_id TO location_id;
    END IF;
END $$;

ALTER TABLE staff ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Valet Runner';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'On Shift';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS handled_count INTEGER DEFAULT 0;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 5.0;

-- For incidents
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'incidents' AND column_name = 'venue_id') THEN
        ALTER TABLE incidents RENAME COLUMN venue_id TO location_id;
    END IF;
END $$;


-- 3. Create new tables mentioned in requirements
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    customer_name TEXT,
    plate_number TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial data
INSERT INTO system_config (key, value) 
VALUES ('super_admin_exists', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Add Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_location_id ON vehicles(location_id);
CREATE INDEX IF NOT EXISTS idx_staff_location_id ON staff(location_id);
CREATE INDEX IF NOT EXISTS idx_incidents_location_id ON incidents(location_id);
CREATE INDEX IF NOT EXISTS idx_bookings_location_id ON bookings(location_id);
CREATE INDEX IF NOT EXISTS idx_notifications_location_id ON notifications(location_id);
CREATE INDEX IF NOT EXISTS idx_profiles_location_id ON profiles(location_id);

-- 5. Security: Enable RLS and setup policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS location_isolation_policy ON locations;
DROP POLICY IF EXISTS vehicles_location_policy ON vehicles;
DROP POLICY IF EXISTS staff_location_policy ON staff;
DROP POLICY IF EXISTS incidents_location_policy ON incidents;
DROP POLICY IF EXISTS bookings_location_policy ON bookings;
DROP POLICY IF EXISTS notifications_location_policy ON notifications;
DROP POLICY IF EXISTS profiles_self_policy ON profiles;

-- ============================================================
-- Helper functions: avoid RLS recursion by using SECURITY DEFINER
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_location_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT location_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (LOWER(role) = 'admin' OR LOWER(role) = 'super_admin')
  );
$$;

-- ============================================================
-- TABLE POLICIES (with Global Admin bypass)
-- ============================================================

-- Profiles: Users see self, Admins see ALL
DROP POLICY IF EXISTS profiles_self_policy ON profiles;
CREATE POLICY profiles_self_policy ON profiles
    FOR ALL
    USING (id = auth.uid() OR is_admin())
    WITH CHECK (id = auth.uid() OR is_admin());

-- Locations: Owners see theirs, Admins see ALL
DROP POLICY IF EXISTS location_isolation_policy ON locations;
CREATE POLICY location_isolation_policy ON locations
    FOR ALL
    USING (owner_id = auth.uid() OR is_admin())
    WITH CHECK (owner_id = auth.uid() OR is_admin());

-- Vehicles: Location-based or Admin bypass
DROP POLICY IF EXISTS vehicles_location_policy ON vehicles;
CREATE POLICY vehicles_location_policy ON vehicles
    FOR ALL
    USING (location_id = get_my_location_id() OR is_admin())
    WITH CHECK (location_id = get_my_location_id() OR is_admin());

-- Staff: Location-based or Admin bypass
DROP POLICY IF EXISTS staff_location_policy ON staff;
CREATE POLICY staff_location_policy ON staff
    FOR ALL
    USING (location_id = get_my_location_id() OR is_admin())
    WITH CHECK (location_id = get_my_location_id() OR is_admin());

-- Incidents: Location-based or Admin bypass
DROP POLICY IF EXISTS incidents_location_policy ON incidents;
CREATE POLICY incidents_location_policy ON incidents
    FOR ALL
    USING (location_id = get_my_location_id() OR is_admin())
    WITH CHECK (location_id = get_my_location_id() OR is_admin());

-- Bookings: Location-based or Admin bypass
DROP POLICY IF EXISTS bookings_location_policy ON bookings;
CREATE POLICY bookings_location_policy ON bookings
    FOR ALL
    USING (location_id = get_my_location_id() OR is_admin())
    WITH CHECK (location_id = get_my_location_id() OR is_admin());

-- Notifications: Location-based or Admin bypass
DROP POLICY IF EXISTS notifications_location_policy ON notifications;
CREATE POLICY notifications_location_policy ON notifications
    FOR ALL
    USING (location_id = get_my_location_id() OR is_admin())
    WITH CHECK (location_id = get_my_location_id() OR is_admin());

-- Payments: Location-based or Admin bypass
DROP POLICY IF EXISTS payments_location_policy ON payments;
CREATE POLICY payments_location_policy ON payments
    FOR ALL
    USING (location_id = get_my_location_id() OR is_admin())
    WITH CHECK (location_id = get_my_location_id() OR is_admin());


-- 6. Payments and Subscriptions
ALTER TABLE locations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS selected_plan TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    amount NUMERIC,
    plan TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Success Message
COMMENT ON TABLE locations IS 'Renamed from venues. Stores venue/location data and subscription status.';
COMMENT ON TABLE payments IS 'Stores payment transactions for venue subscriptions.';
COMMENT ON FUNCTION get_my_location_id() IS 'SECURITY DEFINER helper: resolves the location_id for the currently authenticated user from the profiles table without hitting RLS.';
