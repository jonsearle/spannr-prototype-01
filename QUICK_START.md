# Quick Start: View the Opening Hours Feature

## Dev Server is Starting

The development server should be starting. Once it's ready, you'll see:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

## URLs to View

### 1. Admin Interface - Opening Hours Settings
**URL:** `http://localhost:3000/admin/[your-garage-slug]/opening-hours`

**What you'll see:**
- Page title: "Opening Hours Settings"
- Section: "Your Opening Days & Hours"
- 7-day list (Monday through Sunday)
- Each day has:
  - Toggle button (dark when enabled, white when disabled)
  - Checkmark icon when enabled
  - Open/Close time selects (when enabled)
  - "Closed" text (when disabled)
- Save button at the bottom

**To test:**
1. Click a day button to toggle it on/off
2. Set times using the dropdowns (15-minute increments)
3. Click "Save Opening Hours"
4. See success message

### 2. Public Garage Page - Status Badge
**URL:** `http://localhost:3000/[your-garage-slug]`

**What you'll see:**
- Top-left corner: Status badge
  - "We're open" (if currently open)
  - "We're closed" (if currently closed)
- Garage business name
- One-line description
- About section

### 3. API Endpoints

**GET Opening Hours:**
```
http://localhost:3000/api/garages/[your-garage-slug]/opening-hours
```
Returns JSON array with all 7 days of opening hours.

**POST Opening Hours (requires admin secret):**
```
POST http://localhost:3000/api/garages/[your-garage-slug]/opening-hours
Headers: x-admin-secret: your-secret-here
Body: { "hours": [...] }
```

## Prerequisites Checklist

Before you can view the pages, make sure:

- [ ] Database migration has been run (create `opening_hours` table)
- [ ] `.env.local` file exists with all required variables
- [ ] At least one garage exists in your database with:
  - A `slug` field (e.g., "test-garage")
  - A `timezone` field (e.g., "Europe/London")

## Quick Test Setup

If you don't have a garage yet, you can create one in Supabase:

```sql
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
  callback_contact_email,
  created_at,
  updated_at
) VALUES (
  'test-garage',
  'Test Garage',
  'Your trusted local garage',
  'We provide excellent service...',
  'Europe/London',
  '123 Test Street',
  'SW1A 1AA',
  '01234567890',
  'test@example.com',
  'John Doe',
  'john@example.com',
  now(),
  now()
);
```

Then visit:
- Admin: `http://localhost:3000/admin/test-garage/opening-hours`
- Public: `http://localhost:3000/test-garage`

