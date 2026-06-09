-- ==============================================================================
-- NOTIFICATIONS / MESSAGING DATABASE MIGRATION
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script ensures the 'notifications' table is structured, secures it with RLS,
-- creates indexes, and seeds it with high-fidelity demo message records.

-- 1. Ensure Table exists with the correct columns
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_location_id ON notifications(location_id);

-- 3. Security: Enable RLS and setup location isolation policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_location_policy ON notifications;
CREATE POLICY notifications_location_policy ON notifications
    FOR ALL
    USING (
        -- Admin bypass
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        OR
        -- Location isolation
        location_id = (SELECT location_id FROM profiles WHERE id = auth.uid())
    )
    WITH CHECK (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        OR
        location_id = (SELECT location_id FROM profiles WHERE id = auth.uid())
    );

-- 4. Seed high-fidelity messaging logs for all existing locations
DO $$
DECLARE
    loc RECORD;
BEGIN
    FOR loc IN SELECT id FROM locations LOOP
        
        -- Notification 1: Rajesh Kumar (WhatsApp, Delivered)
        INSERT INTO notifications (location_id, title, message, is_read, created_at)
        VALUES (
            loc.id,
            'Rajesh Kumar | Vehicle Received | +91 98765 43210 | WhatsApp | Delivered',
            'Hi Rajesh Kumar, your BMW X5 - Black is securely parked. Token: #1024. Track at valetpro.in/t/1024',
            FALSE,
            NOW() - INTERVAL '2 minutes'
        );

        -- Notification 2: Priya Sharma (SMS, Delivered)
        INSERT INTO notifications (location_id, title, message, is_read, created_at)
        VALUES (
            loc.id,
            'Priya Sharma | OTP for Handover | +91 98887 12345 | SMS | Delivered',
            'Your Valet Pro pickup OTP is 5829. Valid 5 min. Share only with staff.',
            FALSE,
            NOW() - INTERVAL '4 minutes'
        );

        -- Notification 3: Anand Mehta (WhatsApp, Read)
        INSERT INTO notifications (location_id, title, message, is_read, created_at)
        VALUES (
            loc.id,
            'Anand Mehta | Ready for Pickup | +91 98123 99001 | WhatsApp | Read',
            'Your Audi A6 - White is being brought to the entrance. ETA: 5 mins.',
            TRUE,
            NOW() - INTERVAL '7 minutes'
        );

        -- Notification 4: Sneha Kapoor (WhatsApp, Delivered)
        INSERT INTO notifications (location_id, title, message, is_read, created_at)
        VALUES (
            loc.id,
            'Sneha Kapoor | Vehicle Received | +91 98765 11223 | WhatsApp | Delivered',
            'Hi Sneha Kapoor, your Mercedes Benz - Silver is securely parked. Token: #1025. Track at valetpro.in/t/1025',
            FALSE,
            NOW() - INTERVAL '12 minutes'
        );

        -- Notification 5: Vikram Iyer (SMS, Pending)
        INSERT INTO notifications (location_id, title, message, is_read, created_at)
        VALUES (
            loc.id,
            'Vikram Iyer | OTP for Handover | +91 90011 23456 | SMS | Pending',
            'Your Valet Pro pickup OTP is 1234. Valid 5 min. Share only with staff.',
            FALSE,
            NOW() - INTERVAL '15 minutes'
        );

    END LOOP;
END $$;
