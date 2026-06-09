-- ==============================================================================
-- BOOKINGS DATABASE MIGRATION
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script alters the 'bookings' table to support high-fidelity attributes,
-- establishes unique constraints, and seeds data.

-- 1. Alter Table to add columns safely if they do not exist
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

-- 2. Add Unique Constraint on (location_id, res_id) to avoid seeding duplicates
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_location_res_unique;
ALTER TABLE bookings ADD CONSTRAINT bookings_location_res_unique UNIQUE (location_id, res_id);

-- 3. Seed high-fidelity bookings data for all existing locations
DO $$
DECLARE
    loc RECORD;
BEGIN
    FOR loc IN SELECT id FROM locations LOOP
        
        -- Booking 1: Sanjay Gupta
        INSERT INTO bookings (location_id, customer_name, res_id, status, time, hotel_name, plate_number, car_model, party_size, purpose, phone, tier, pre_auth, special_request)
        VALUES (
            loc.id,
            'Sanjay Gupta',
            'RES-7821',
            'Upcoming',
            '11:30 AM',
            'Grand Hyatt',
            'TN 01 ZZ 9999',
            'BMW X5 - Black',
            'Party of 4',
            'Business Lunch',
            '+91 98123 45678',
            'Gold',
            500,
            ''
        ) ON CONFLICT (location_id, res_id) DO NOTHING;

        -- Booking 2: Lakshmi V
        INSERT INTO bookings (location_id, customer_name, res_id, status, time, hotel_name, plate_number, car_model, party_size, purpose, phone, tier, pre_auth, special_request)
        VALUES (
            loc.id,
            'Lakshmi V',
            'RES-7822',
            'Upcoming',
            '12:00 PM',
            'Grand Hyatt',
            'KA 01 AA 1111',
            'Audi A6 - White',
            'Party of 2',
            'Anniversary',
            '+91 98123 11111',
            'Platinum',
            800,
            'Champagne welcome arranged'
        ) ON CONFLICT (location_id, res_id) DO NOTHING;

        -- Booking 3: Rahul Dev
        INSERT INTO bookings (location_id, customer_name, res_id, status, time, hotel_name, plate_number, car_model, party_size, purpose, phone, tier, pre_auth, special_request)
        VALUES (
            loc.id,
            'Rahul Dev',
            'RES-7823',
            'Upcoming',
            '12:30 PM',
            'Grand Hyatt',
            'MH 04 BB 2222',
            'Mercedes GLC - Silver',
            'Party of 6',
            'Family Lunch',
            '+91 98123 22222',
            'Standard',
            400,
            ''
        ) ON CONFLICT (location_id, res_id) DO NOTHING;

        -- Booking 4: Anita S
        INSERT INTO bookings (location_id, customer_name, res_id, status, time, hotel_name, plate_number, car_model, party_size, purpose, phone, tier, pre_auth, special_request)
        VALUES (
            loc.id,
            'Anita S',
            'RES-7820',
            'Arrived',
            '10:00 AM',
            'Grand Hyatt',
            'DL 08 CC 3333',
            'Toyota Camry - Grey',
            'Party of 3',
            'Brunch',
            '+91 98123 33333',
            'Silver',
            350,
            ''
        ) ON CONFLICT (location_id, res_id) DO NOTHING;

        -- Booking 5: Mohan R
        INSERT INTO bookings (location_id, customer_name, res_id, status, time, hotel_name, plate_number, car_model, party_size, purpose, phone, tier, pre_auth, special_request)
        VALUES (
            loc.id,
            'Mohan R',
            'RES-7815',
            'Completed',
            '08:00 AM',
            'Grand Hyatt',
            'TN 07 DD 4444',
            'Hyundai Creta - Blue',
            'Party of 2',
            'Breakfast',
            '+91 98123 44444',
            'Standard',
            300,
            ''
        ) ON CONFLICT (location_id, res_id) DO NOTHING;

        -- Booking 6: Pooja Iyer
        INSERT INTO bookings (location_id, customer_name, res_id, status, time, hotel_name, plate_number, car_model, party_size, purpose, phone, tier, pre_auth, special_request)
        VALUES (
            loc.id,
            'Pooja Iyer',
            'RES-7825',
            'Upcoming',
            '01:00 PM',
            'Grand Hyatt',
            'KA 09 EE 5555',
            'Volvo XC60 - White',
            'Party of 5',
            'Birthday',
            '+91 98123 55555',
            'Gold',
            500,
            'Cake delivery to lobby'
        ) ON CONFLICT (location_id, res_id) DO NOTHING;

        -- Booking 7: Ashok Reddy
        INSERT INTO bookings (location_id, customer_name, res_id, status, time, hotel_name, plate_number, car_model, party_size, purpose, phone, tier, pre_auth, special_request)
        VALUES (
            loc.id,
            'Ashok Reddy',
            'RES-7826',
            'Upcoming',
            '07:30 PM',
            'Grand Hyatt',
            'AP 28 FF 6666',
            'Jaguar XF - Black',
            'Party of 8',
            'Corporate Dinner',
            '+91 98123 66666',
            'Platinum',
            900,
            ''
        ) ON CONFLICT (location_id, res_id) DO NOTHING;

        -- Booking 8: Kavitha M
        INSERT INTO bookings (location_id, customer_name, res_id, status, time, hotel_name, plate_number, car_model, party_size, purpose, phone, tier, pre_auth, special_request)
        VALUES (
            loc.id,
            'Kavitha M',
            'RES-7818',
            'Completed',
            '09:00 AM',
            'Grand Hyatt',
            'TN 14 GG 7777',
            'Honda Civic - Red',
            'Party of 1',
            'Meeting',
            '+91 98123 77777',
            'Standard',
            250,
            ''
        ) ON CONFLICT (location_id, res_id) DO NOTHING;

    END LOOP;
END $$;
