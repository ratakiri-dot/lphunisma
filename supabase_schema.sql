
-- Tables for LPH UNISMA MIS

-- 1. Profiles (for users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PU Certified
CREATE TABLE pu_certified (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reg_no TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  owner_name TEXT,
  wa_number TEXT,
  email TEXT,
  business_address TEXT,
  production_address TEXT,
  nib TEXT,
  halal_id TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PU On Process
CREATE TABLE pu_on_process (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reg_no TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  owner_name TEXT,
  wa_number TEXT,
  email TEXT,
  social_media TEXT,
  business_address TEXT,
  production_address TEXT,
  nib TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PU Prospect
CREATE TABLE pu_prospect (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  owner_name TEXT,
  wa_number TEXT,
  email TEXT,
  social_media TEXT,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Internal Members
CREATE TABLE internal_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT,
  address TEXT,
  wa_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Auditors
CREATE TABLE auditors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT,
  cert_number TEXT,
  address TEXT,
  wa_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Partners
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT,
  cert TEXT,
  address TEXT,
  wa_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Finance Records
CREATE TABLE finance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Assets
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  received_date DATE,
  estimated_value NUMERIC,
  condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Schedule / Activities
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delegates TEXT[], -- Array of names
  event TEXT NOT NULL,
  location TEXT,
  time TIME,
  date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Documentation
CREATE TABLE documentation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  upload_date DATE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Letters
CREATE TABLE letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  letter_number TEXT,
  date DATE,
  type TEXT CHECK (type IN ('Incoming', 'Outgoing')),
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) - Basic Setup
-- You can enable RLS and add policies later via Supabase Dashboard
