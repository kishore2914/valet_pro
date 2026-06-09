-- ==============================================================================
-- VALET PRO: ENTERPRISE DATABASE SEED DATA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script seeds companies, cities, locations, user_locations mappings,
-- staff, customers, active vehicles, bookings, and incidents.

-- 1. Seed Company & City
INSERT INTO companies (company_name) VALUES ('ITC Hotels') ON CONFLICT (company_name) DO NOTHING;
INSERT INTO cities (city_name) VALUES ('Chennai') ON CONFLICT (city_name) DO NOTHING;

-- 2. Seed Default Location
INSERT INTO locations (name, company_name, company_id, city, city_id, tier, status, staff_count, vehicles_processed, monthly_fee, subscription_status)
VALUES (
    'ITC Grand Chola',
    'ITC Hotels',
    (SELECT id FROM companies WHERE company_name = 'ITC Hotels' LIMIT 1),
    'Chennai',
    (SELECT id FROM cities WHERE city_name = 'Chennai' LIMIT 1),
    'Enterprise',
    'active',
    18,
    220000,
    '₹24,999/mo',
    'active'
) ON CONFLICT (name, company_name) DO NOTHING;

-- 3. Map Existing User Profiles to this Location
-- Dynamically fetch the seeded location ID
DO $$
DECLARE
    v_loc_id UUID;
    v_prof RECORD;
BEGIN
    SELECT id INTO v_loc_id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1;
    
    IF v_loc_id IS NOT NULL THEN
        -- Link every existing profile to this location in user_locations
        INSERT INTO user_locations (user_id, location_id)
        SELECT id, v_loc_id FROM profiles
        ON CONFLICT (user_id, location_id) DO NOTHING;
        
        -- Set default location_id in profiles
        UPDATE profiles SET location_id = v_loc_id WHERE location_id IS NULL;
        
        -- Delete any old seed data for this location to avoid duplicates
        DELETE FROM vehicles WHERE location_id = v_loc_id;
        DELETE FROM bookings WHERE location_id = v_loc_id;
        DELETE FROM staff WHERE location_id = v_loc_id;
        DELETE FROM incidents WHERE location_id = v_loc_id;
        DELETE FROM notifications WHERE location_id = v_loc_id;
        DELETE FROM payments WHERE location_id = v_loc_id;
        DELETE FROM customers WHERE location_id = v_loc_id;
    END IF;
END $$;

-- 4. Seed Customers
DO $$
DECLARE
    v_loc_id UUID;
BEGIN
    SELECT id INTO v_loc_id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1;
    
    INSERT INTO customers (location_id, name, phone, email, tier, visits, spend, rating, is_vip, notes, vehicles)
    VALUES 
    (v_loc_id, 'Vikram Mehta', '+91 99987 65432', 'vikram.mehta@gmail.com', 'Platinum', 47, 28400, 4.9, true, 'Prefers slot A-12. Likes premium tissue box in the vehicle.', ARRAY['TN 01 AB 1234', 'TN 01 XY 9999']),
    (v_loc_id, 'Priya Sharma', '+91 87654 32109', 'priya.sharma@yahoo.com', 'Platinum', 1, 350, 4.5, true, 'No specific instructions.', ARRAY['KA 05 CD 5678']),
    (v_loc_id, 'Vikram Singh', '+91 54321 09876', 'vsingh@outlook.com', 'Platinum', 1, 0, 4.5, true, 'Valet VIP member.', ARRAY['MH 12 EF 9012']),
    (v_loc_id, 'Rajesh Kumar', '+91 98765 43210', 'rajesh.kumar@gmail.com', 'Gold', 1, 350, 4.5, true, 'No specific notes.', ARRAY['TN 07 CD 8765']),
    (v_loc_id, 'Sneha Kapoor', '+91 98765 11223', 'sneha.kapoor@gmail.com', 'Gold', 23, 12800, 4.7, true, 'Frequent guest. Prefers shaded spots.', ARRAY['MH 02 BG 4321']);
END $$;

-- 5. Seed Staff
INSERT INTO staff (id, location_id, name, role, status, rating, zone, shift, speaks, license, phone)
VALUES 
(
    'e9f1a23b-1234-4567-890a-111111111111',
    (SELECT id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1),
    'Arun M',
    'Valet',
    'On Shift',
    4.8,
    'Zone A',
    '6AM - 2PM',
    'Tamil, English',
    'TN-DL-2020-7740',
    '+91 90000 11111'
),
(
    'e9f1a23b-1234-4567-890a-222222222222',
    (SELECT id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1),
    'Karthik R',
    'Valet',
    'On Shift',
    4.6,
    'Zone B',
    '6AM - 2PM',
    'Tamil, Hindi',
    'TN-DL-2021-3360',
    '+91 90000 22222'
),
(
    'e9f1a23b-1234-4567-890a-333333333333',
    (SELECT id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1),
    'Suresh P',
    'Supervisor',
    'On Shift',
    4.9,
    'Zone All',
    '6AM - 2PM',
    'Tamil, English',
    'TN-DL-2017-8829',
    '+91 90000 33333'
),
(
    'e9f1a23b-1234-4567-890a-444444444444',
    (SELECT id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1),
    'Mani T',
    'Valet',
    'Off Shift',
    4.4,
    'Zone C',
    '10PM - 6AM',
    'Tamil',
    'TN-DL-2022-5510',
    '+91 90000 77777'
),
(
    'e9f1a23b-1234-4567-890a-555555555555',
    (SELECT id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1),
    'Bala N',
    'Supervisor',
    'Off Shift',
    4.8,
    'Zone All',
    '2PM - 10PM',
    'Tamil, English, Malayalam',
    'TN-DL-2014-2288',
    '+91 90000 88888'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Vehicles
DO $$
DECLARE
    v_loc_id UUID;
BEGIN
    SELECT id INTO v_loc_id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1;

    -- Vehicle 1: Parked
    INSERT INTO vehicles (
        location_id, plate_number, model, color, status, zone, slot_id, 
        driver_id, driver_name, phone_number, received_at, parked_at, 
        token, key_code, tip_amount, payment_amount, payment_status
    ) VALUES (
        v_loc_id, 'TN 01 AB 1234', 'Mercedes-Benz E-Class', 'Obsidian Black', 'Parked', 'A', 'A-12', 
        'e9f1a23b-1234-4567-890a-111111111111', 'Arun M', '+91 99987 65432', 
        NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3.5 hours',
        'TKN-8821', 'K-8821', 0, 0, 'Pending'
    );

    -- Vehicle 2: Ready (Pending Return)
    INSERT INTO vehicles (
        location_id, plate_number, model, color, status, zone, slot_id, 
        driver_id, driver_name, phone_number, received_at, parked_at, requested_at,
        token, key_code, tip_amount, payment_amount, payment_status
    ) VALUES (
        v_loc_id, 'KA 05 CD 5678', 'Tesla Model 3', 'Pearl White', 'Ready', 'EV', 'EV-2', 
        'e9f1a23b-1234-4567-890a-222222222222', 'Karthik R', '+91 87654 32109', 
        NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.8 hours', NOW() - INTERVAL '10 minutes',
        'TKN-4112', 'K-4112', 150, 200, 'Paid'
    );

    -- Vehicle 3: Being Retrieved
    INSERT INTO vehicles (
        location_id, plate_number, model, color, status, zone, slot_id, 
        driver_id, driver_name, phone_number, received_at, parked_at, requested_at,
        token, key_code, tip_amount, payment_amount, payment_status
    ) VALUES (
        v_loc_id, 'MH 12 EF 9012', 'BMW 5 Series', 'Imperial Blue', 'Delivering', 'VIP', 'VIP-1', 
        'e9f1a23b-1234-4567-890a-333333333333', 'Suresh P', '+91 54321 09876', 
        NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2.7 hours', NOW() - INTERVAL '5 minutes',
        'TKN-9023', 'K-9023', 0, 0, 'Pending'
    );

    -- Vehicle 4: Returned Today
    INSERT INTO vehicles (
        location_id, plate_number, model, color, status, zone, slot_id, 
        driver_id, driver_name, phone_number, received_at, parked_at, requested_at, delivered_at,
        token, key_code, tip_amount, payment_amount, payment_status
    ) VALUES (
        v_loc_id, 'TN 07 CD 8765', 'Audi A6', 'Ibis White', 'Returned', 'B', 'B-04', 
        'e9f1a23b-1234-4567-890a-111111111111', 'Arun M', '+91 98765 43210', 
        NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4.8 hours', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '20 minutes',
        'TKN-7731', 'K-7731', 100, 200, 'Paid'
    );
END $$;

-- 7. Seed Bookings
INSERT INTO bookings (
    location_id, res_id, time, hotel_name, customer_name, plate_number, 
    car_model, party_size, purpose, phone, tier, pre_auth, special_request, status
) VALUES 
(
    (SELECT id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1),
    'RES-9981',
    '07:30 PM',
    'ITC Grand Chola',
    'Vikram Mehta',
    'TN 01 AB 1234',
    'Mercedes-Benz E-Class',
    'Party of 2',
    'Business Dinner',
    '+91 99987 65432',
    'Platinum',
    300,
    'Prefers valet parking near the main lobby entrance.',
    'Confirmed'
),
(
    (SELECT id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1),
    'RES-4412',
    '08:00 PM',
    'ITC Grand Chola',
    'Priya Sharma',
    'KA 05 CD 5678',
    'Tesla Model 3',
    'Party of 4',
    'Celebration',
    '+91 87654 32109',
    'Platinum',
    300,
    'Requires EV charging slot.',
    'Confirmed'
)
ON CONFLICT (location_id, res_id) DO NOTHING;

-- 8. Seed Incidents
INSERT INTO incidents (
    location_id, title, priority, status, customer_notified, description, 
    plate_number, reported_by, assigned_to, zone, time, estimated_cost, created_at
) VALUES 
(
    (SELECT id FROM locations WHERE name = 'ITC Grand Chola' LIMIT 1),
    'Bumper Scratch',
    'High',
    'In Progress',
    true,
    'Minor scratch on rear bumper during parking in slot B-04.',
    'TN 07 CD 8765',
    'Arun M',
    'Suresh P',
    'Zone B',
    '02:15 PM',
    3500,
    NOW() - INTERVAL '3 hours'
)
ON CONFLICT (location_id, description) DO NOTHING;
