-- ==============================================================================
-- VALET PRO: CLEAR DUMMY/MOCK DATABASE RECORDS
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This script safely cleans up all seeded mock data from your tables.
-- It preserves the location structures, cities, companies, and user profiles.

-- Disable triggers temporarily if needed
SET session_replication_role = 'replica';

BEGIN;

-- 1. Delete all notifications
DELETE FROM notifications;

-- 2. Delete all incidents
DELETE FROM incidents;

-- 3. Delete all bookings
DELETE FROM bookings;

-- 4. Delete all vehicles
DELETE FROM vehicles;

-- 5. Delete all payments
DELETE FROM payments;

-- 6. Delete all staff shifts/records
DELETE FROM staff;

-- 7. Delete all customers
DELETE FROM customers;

COMMIT;

-- Re-enable triggers
SET session_replication_role = 'origin';
