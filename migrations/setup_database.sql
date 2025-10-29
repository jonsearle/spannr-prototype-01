-- Create garages table (if it doesn't exist)
-- This is a minimal schema for the prototype
CREATE TABLE IF NOT EXISTS garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  business_name TEXT NOT NULL,
  one_line_description TEXT,
  about_text TEXT,
  hero_image_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  
  -- Contact details
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  address_line3 TEXT,
  address_line4 TEXT,
  postcode TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Reviews link
  google_reviews_url TEXT,
  
  -- Callback notifications
  callback_contact_name TEXT NOT NULL,
  callback_contact_email TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create opening_hours table for garage opening hours
CREATE TABLE IF NOT EXISTS opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  is_open BOOLEAN NOT NULL DEFAULT false,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(garage_id, day_of_week)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_opening_hours_garage_id ON opening_hours(garage_id);
CREATE INDEX IF NOT EXISTS idx_opening_hours_garage_day ON opening_hours(garage_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_garages_slug ON garages(slug);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_garages_updated_at
  BEFORE UPDATE ON garages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opening_hours_updated_at
  BEFORE UPDATE ON opening_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a sample garage for testing (optional - remove if you don't want this)
INSERT INTO garages (
  slug,
  business_name,
  one_line_description,
  about_text,
  timezone,
  address_line1,
  postcode,
  phone,
  email,
  callback_contact_name,
  callback_contact_email
) VALUES (
  'test-garage',
  'Test Garage',
  'Your trusted local garage',
  'We provide excellent automotive services...',
  'Europe/London',
  '123 Test Street',
  'SW1A 1AA',
  '01234567890',
  'test@example.com',
  'John Doe',
  'john@example.com'
) ON CONFLICT DO NOTHING;

-- Insert sample opening hours for the garage
-- Monday to Friday: 9am - 5pm
-- Saturday: 9am - 12pm
-- Sunday: Closed
INSERT INTO opening_hours (garage_id, day_of_week, is_open, open_time, close_time)
SELECT 
  g.id,
  day.day_of_week,
  CASE 
    WHEN day.day_of_week <= 5 THEN true  -- Monday-Friday
    WHEN day.day_of_week = 6 THEN true   -- Saturday
    ELSE false                           -- Sunday
  END as is_open,
  CASE 
    WHEN day.day_of_week <= 6 THEN '09:00:00'::time
    ELSE NULL
  END as open_time,
  CASE 
    WHEN day.day_of_week <= 5 THEN '17:00:00'::time  -- Monday-Friday: 5pm
    WHEN day.day_of_week = 6 THEN '12:00:00'::time   -- Saturday: 12pm
    ELSE NULL
  END as close_time
FROM garages g
CROSS JOIN (
  SELECT 1 as day_of_week UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL 
  SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
) day
WHERE g.business_name = 'Test Garage'
ON CONFLICT (garage_id, day_of_week) DO NOTHING;

