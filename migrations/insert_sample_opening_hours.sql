-- Insert sample opening hours for existing garage
-- Run this if you already have a garage but no opening hours
-- Replace 'Test Garage' with your garage's business_name if different

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

