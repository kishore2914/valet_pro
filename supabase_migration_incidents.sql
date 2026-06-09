-- ==============================================================================
-- INCIDENTS DATABASE MIGRATION
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script alters the 'incidents' table to support high-fidelity attributes,
-- establishes unique constraints, and seeds data.

-- 1. Create table if not exists or add columns safely
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    reported_by TEXT,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Low';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS customer_notified BOOLEAN DEFAULT FALSE;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS plate_number TEXT;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS estimated_cost INTEGER DEFAULT 0;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS time TEXT;

-- 2. Add Unique Constraint to avoid seeding duplicates
-- We will use a unique hash key or description matching
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_description_unique;
ALTER TABLE incidents ADD CONSTRAINT incidents_description_unique UNIQUE (location_id, description);

-- 3. Seed high-fidelity incidents data for all existing locations
DO $$
DECLARE
    loc RECORD;
BEGIN
    FOR loc IN SELECT id FROM locations LOOP
        
        -- Incident 1: Rear bumper scratch (Damage)
        INSERT INTO incidents (location_id, title, priority, status, customer_notified, description, plate_number, reported_by, assigned_to, zone, time, estimated_cost, created_at)
        VALUES (
            loc.id,
            'DAMAGE',
            'MEDIUM',
            'INVESTIGATING',
            TRUE,
            'Minor scratch on rear bumper noticed during check-in. 4 photos captured.',
            'TN 01 AB 1234',
            'Arun M',
            'Suresh P',
            'Zone A entry',
            '10:20 AM',
            2500,
            NOW() - INTERVAL '3 hours'
        ) ON CONFLICT (location_id, description) DO UPDATE SET
            title = EXCLUDED.title,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            customer_notified = EXCLUDED.customer_notified,
            plate_number = EXCLUDED.plate_number,
            reported_by = EXCLUDED.reported_by,
            assigned_to = EXCLUDED.assigned_to,
            zone = EXCLUDED.zone,
            time = EXCLUDED.time,
            estimated_cost = EXCLUDED.estimated_cost;

        -- Incident 2: Delayed vehicle return (Delay)
        INSERT INTO incidents (location_id, title, priority, status, customer_notified, description, plate_number, reported_by, assigned_to, zone, time, estimated_cost, created_at)
        VALUES (
            loc.id,
            'DELAY',
            'LOW',
            'RESOLVED',
            TRUE,
            'Vehicle return delayed by 15 mins due to lot congestion at peak hour.',
            'AP 09 GH 3456',
            'Vijay K',
            'Suresh P',
            'Zone C exit',
            '09:50 AM',
            0,
            NOW() - INTERVAL '4 hours'
        ) ON CONFLICT (location_id, description) DO UPDATE SET
            title = EXCLUDED.title,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            customer_notified = EXCLUDED.customer_notified,
            plate_number = EXCLUDED.plate_number,
            reported_by = EXCLUDED.reported_by,
            assigned_to = EXCLUDED.assigned_to,
            zone = EXCLUDED.zone,
            time = EXCLUDED.time,
            estimated_cost = EXCLUDED.estimated_cost;

        -- Incident 3: Unauthorized claim attempt (Suspicious)
        INSERT INTO incidents (location_id, title, priority, status, customer_notified, description, plate_number, reported_by, assigned_to, zone, time, estimated_cost, created_at)
        VALUES (
            loc.id,
            'SUSPICIOUS',
            'HIGH',
            'OPEN',
            TRUE,
            'Unauthorized person attempted to claim vehicle with mismatched token. Security called.',
            'MH 12 EF 9012',
            'Suresh P',
            'Hotel Security',
            'Lobby valet desk',
            '09:30 AM',
            0,
            NOW() - INTERVAL '5 hours'
        ) ON CONFLICT (location_id, description) DO UPDATE SET
            title = EXCLUDED.title,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            customer_notified = EXCLUDED.customer_notified,
            plate_number = EXCLUDED.plate_number,
            reported_by = EXCLUDED.reported_by,
            assigned_to = EXCLUDED.assigned_to,
            zone = EXCLUDED.zone,
            time = EXCLUDED.time,
            estimated_cost = EXCLUDED.estimated_cost;

        -- Incident 4: Sunglasses in backseat (Lost Item)
        INSERT INTO incidents (location_id, title, priority, status, customer_notified, description, plate_number, reported_by, assigned_to, zone, time, estimated_cost, created_at)
        VALUES (
            loc.id,
            'LOST ITEM',
            'LOW',
            'OPEN',
            FALSE,
            'Sunglasses (Ray-Ban) found in backseat of returned vehicle. Logged in lost & found.',
            'TN 22 OP 0123',
            'Vijay K',
            'Bala N',
            'Vehicle Interior',
            '07:00 AM',
            0,
            NOW() - INTERVAL '7 hours'
        ) ON CONFLICT (location_id, description) DO UPDATE SET
            title = EXCLUDED.title,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            customer_notified = EXCLUDED.customer_notified,
            plate_number = EXCLUDED.plate_number,
            reported_by = EXCLUDED.reported_by,
            assigned_to = EXCLUDED.assigned_to,
            zone = EXCLUDED.zone,
            time = EXCLUDED.time,
            estimated_cost = EXCLUDED.estimated_cost;

        -- Incident 5: Lock-box retrieval delay (Complaint)
        INSERT INTO incidents (location_id, title, priority, status, customer_notified, description, plate_number, reported_by, assigned_to, zone, time, estimated_cost, created_at)
        VALUES (
            loc.id,
            'COMPLAINT',
            'MEDIUM',
            'INVESTIGATING',
            TRUE,
            'Customer reported delay in retrieving vehicle key from lock-box. Apology issued.',
            'KL 07 KL 2345',
            'Karthik R',
            'Suresh P',
            'Key drop',
            '10:05 AM',
            0,
            NOW() - INTERVAL '2 hours'
        ) ON CONFLICT (location_id, description) DO UPDATE SET
            title = EXCLUDED.title,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            customer_notified = EXCLUDED.customer_notified,
            plate_number = EXCLUDED.plate_number,
            reported_by = EXCLUDED.reported_by,
            assigned_to = EXCLUDED.assigned_to,
            zone = EXCLUDED.zone,
            time = EXCLUDED.time,
            estimated_cost = EXCLUDED.estimated_cost;

        -- Incident 6: Door ding in Ev Slot 02 (Damage)
        INSERT INTO incidents (location_id, title, priority, status, customer_notified, description, plate_number, reported_by, assigned_to, zone, time, estimated_cost, created_at)
        VALUES (
            loc.id,
            'DAMAGE',
            'MEDIUM',
            'OPEN',
            FALSE,
            'Door ding from neighboring vehicle in tight slot. Photo evidence saved.',
            'GJ 01 RS 4567',
            'Karthik R',
            'Suresh P',
            'Zone EV slot 02',
            '11:00 AM',
            4200,
            NOW() - INTERVAL '1 hour'
        ) ON CONFLICT (location_id, description) DO UPDATE SET
            title = EXCLUDED.title,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            customer_notified = EXCLUDED.customer_notified,
            plate_number = EXCLUDED.plate_number,
            reported_by = EXCLUDED.reported_by,
            assigned_to = EXCLUDED.assigned_to,
            zone = EXCLUDED.zone,
            time = EXCLUDED.time,
            estimated_cost = EXCLUDED.estimated_cost;

    END LOOP;
END $$;
