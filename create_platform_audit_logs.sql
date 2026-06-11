-- ==============================================================================
-- VALET PRO: CREATE & SEED PLATFORM AUDIT LOGS
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com)
-- This creates the 'platform_audit_logs' table, sets up RLS policies,
-- and seeds the initial audit logs so they load dynamically from your database.

-- 1. Create platform audit logs table
CREATE TABLE IF NOT EXISTS platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create Select Policy (Allow all users to view audit logs)
DROP POLICY IF EXISTS platform_audit_logs_select_policy ON platform_audit_logs;
CREATE POLICY platform_audit_logs_select_policy ON platform_audit_logs
    FOR SELECT USING (true);

-- 4. Create Admin Policy (Allow admin users full access to manage logs)
DROP POLICY IF EXISTS platform_audit_logs_admin_policy ON platform_audit_logs;
CREATE POLICY platform_audit_logs_admin_policy ON platform_audit_logs
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 5. Seed initial data
INSERT INTO platform_audit_logs (title, description, created_at)
VALUES 
    ('Client onboarded', 'Radisson Blu - Bengaluru', NOW() - INTERVAL '2 hours'),
    ('Plan upgraded', 'VR Mall: Starter → Professional', NOW() - INTERVAL '5 hours'),
    ('Security alert resolved', 'Unauthorized access attempt at ITC Grand Chola', NOW() - INTERVAL '1 day'),
    ('New location added', 'Phoenix MarketCity - Velachery Branch', NOW() - INTERVAL '2 days'),
    ('Payment received', 'Apollo Hospital - ₹39,999 cleared', NOW() - INTERVAL '3 days'),
    ('Feature flag toggled', 'API Access enabled for ITC Grand Chola', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;
