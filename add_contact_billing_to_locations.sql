-- Migration to add contact, billing, and operational details to the locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS primary_contact_address TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS billing_outstanding TEXT DEFAULT '₹0';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS billing_method TEXT DEFAULT 'UPI';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS next_bill_date TEXT DEFAULT '01 Jul 2026';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS last_payment_date TEXT DEFAULT '01 Jun 2026';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS renewal_date TEXT DEFAULT '31 Dec 2026';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS uptime_percent TEXT DEFAULT '99.91%';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS account_manager TEXT DEFAULT 'Priya N';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS open_tickets_count INTEGER DEFAULT 1;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS enabled_features TEXT[] DEFAULT ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail'];

-- Seed Taj Hotels Group branches
UPDATE locations SET
    primary_contact_name = 'Meera Iyer',
    primary_contact_email = 'meera.i@tajhotels.com',
    primary_contact_phone = '+91 44 6600 2827',
    primary_contact_address = '37, Mahatma Gandhi Rd, Nungambakkam',
    billing_outstanding = '₹0',
    billing_method = 'Group ACH',
    next_bill_date = '01 Jun 2026',
    last_payment_date = '01 May 2026',
    renewal_date = '31 Dec 2026',
    uptime_percent = '99.91%',
    account_manager = 'Priya N',
    open_tickets_count = 1,
    enabled_features = ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']
WHERE name LIKE '%Taj%';

-- Seed ITC Hotels branches
UPDATE locations SET
    primary_contact_name = 'Meera Iyer',
    primary_contact_email = 'meera.i@itchotels.com',
    primary_contact_phone = '+91 44 6600 2827',
    primary_contact_address = '37, Mahatma Gandhi Rd, Nungambakkam',
    billing_outstanding = '₹0',
    billing_method = 'Group ACH',
    next_bill_date = '01 Jun 2026',
    last_payment_date = '01 May 2026',
    renewal_date = '31 Dec 2026',
    uptime_percent = '99.95%',
    account_manager = 'Priya N',
    open_tickets_count = 1,
    enabled_features = ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']
WHERE name LIKE '%ITC%';

-- Seed Phoenix branches
UPDATE locations SET
    primary_contact_name = 'Rohan Mehta',
    primary_contact_email = 'rohan.mehta@phoenixmills.com',
    primary_contact_phone = '+91 22 6622 7000',
    primary_contact_address = '142, Velachery Main Rd, Velachery',
    billing_outstanding = '₹0',
    billing_method = 'Group ACH',
    next_bill_date = '01 Jun 2026',
    last_payment_date = '01 May 2026',
    renewal_date = '31 Dec 2026',
    uptime_percent = '99.88%',
    account_manager = 'Rahul S',
    open_tickets_count = 0,
    enabled_features = ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']
WHERE name LIKE '%Phoenix%';

-- Seed Apollo branches
UPDATE locations SET
    primary_contact_name = 'Dr. Ramya Reddy',
    primary_contact_email = 'dr.ramya@apollohospitals.com',
    primary_contact_phone = '+91 44 2829 0200',
    primary_contact_address = '21, Greams Lane, Off Greams Road',
    billing_outstanding = '₹0',
    billing_method = 'Group ACH',
    next_bill_date = '01 Jun 2026',
    last_payment_date = '01 May 2026',
    renewal_date = '31 Dec 2026',
    uptime_percent = '99.99%',
    account_manager = 'Amit P',
    open_tickets_count = 1,
    enabled_features = ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']
WHERE name LIKE '%Apollo%';

-- Seed Grand Hyatt Chennai
UPDATE locations SET
    primary_contact_name = 'Suresh Menon',
    primary_contact_email = 'suresh.menon@hyatt.com',
    primary_contact_phone = '+91 44 6100 1234',
    primary_contact_address = '365, Anna Salai, Teynampet',
    billing_outstanding = '₹0',
    billing_method = 'UPI',
    next_bill_date = '01 Jun 2026',
    last_payment_date = '01 May 2026',
    renewal_date = '31 Dec 2026',
    uptime_percent = '99.92%',
    account_manager = 'Karan S',
    open_tickets_count = 1,
    enabled_features = ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']
WHERE name = 'Grand Hyatt Chennai';

-- Seed VR Mall
UPDATE locations SET
    primary_contact_name = 'Anish Kumar',
    primary_contact_email = 'anish@vrmall.in',
    primary_contact_phone = '+91 44 3008 2777',
    primary_contact_address = '100 Feet Rd, Koyambedu',
    billing_outstanding = '₹0',
    billing_method = 'UPI',
    next_bill_date = '01 Jun 2026',
    last_payment_date = '01 May 2026',
    renewal_date = '31 Dec 2026',
    uptime_percent = '99.91%',
    account_manager = 'Priya N',
    open_tickets_count = 0,
    enabled_features = ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']
WHERE name = 'VR Mall';

-- Seed Express Avenue
UPDATE locations SET
    primary_contact_name = 'Deepak Raj',
    primary_contact_email = 'deepak@expressavenue.in',
    primary_contact_phone = '+91 44 2846 4444',
    primary_contact_address = '49, 50L, Whites Rd, Royapettah',
    billing_outstanding = '₹0',
    billing_method = 'UPI',
    next_bill_date = '01 Jun 2026',
    last_payment_date = '01 May 2026',
    renewal_date = '31 Dec 2026',
    uptime_percent = '99.91%',
    account_manager = 'Priya N',
    open_tickets_count = 1,
    enabled_features = ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']
WHERE name = 'Express Avenue';

-- Seed TIDEL Park
UPDATE locations SET
    primary_contact_name = 'Venkatesh S',
    primary_contact_email = 'venkatesh@tidelpark.com',
    primary_contact_phone = '+91 44 2254 0500',
    primary_contact_address = '4, Rajiv Gandhi Salai, Taramani',
    billing_outstanding = '₹0',
    billing_method = 'UPI',
    next_bill_date = '01 Jun 2026',
    last_payment_date = '01 May 2026',
    renewal_date = '31 Dec 2026',
    uptime_percent = '99.91%',
    account_manager = 'Priya N',
    open_tickets_count = 0,
    enabled_features = ARRAY['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']
WHERE name = 'TIDEL Park';
