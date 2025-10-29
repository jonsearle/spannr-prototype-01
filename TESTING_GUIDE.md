# Testing Guide: Opening Hours Feature

## Prerequisites

1. **Database Setup**
   - Run the migration SQL in your Supabase dashboard:
     - Go to Supabase Dashboard → SQL Editor
     - Copy and paste the contents of `migrations/create_opening_hours.sql`
     - Execute the SQL

2. **Environment Variables**
   - Copy `env.template` to `.env.local` if you haven't already:
     ```bash
     cp env.template .env.local
     ```
   - Fill in your `.env.local` with:
     - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
     - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
     - `ADMIN_WRITE_SECRET` - Choose a secret (e.g., `my-secret-key-123`)
     - `NEXT_PUBLIC_ADMIN_WRITE_SECRET` - Same value as `ADMIN_WRITE_SECRET` (for prototype only)
     - `NEXT_PUBLIC_BASE_URL` - `http://localhost:3000` for local dev

3. **Sample Garage Data**
   - Ensure you have at least one garage in your `garages` table with:
     - `timezone` field (e.g., "Europe/London")

## Running the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   - The app will be available at `http://localhost:3000`

## Testing the Admin Interface

1. **Navigate to admin opening hours page**:
   ```
   http://localhost:3000/admin/opening-hours
   ```

2. **Test the form**:
   - Toggle days on/off using the day buttons
   - When a day is enabled (dark background), you'll see Open/Close time selects
   - Set different times (e.g., 09:00 - 17:00 for weekdays, 09:00 - 12:00 for Saturday)
   - Click "Save Opening Hours"
   - Verify success message appears

3. **Test validation**:
   - Try to save without setting times for an enabled day
   - Verify error message appears

## Testing the Public Status Display

1. **Navigate to public garage page**:
   ```
   http://localhost:3000/
   ```

2. **Check the status badge**:
   - Top-left corner should show "We're open" or "We're closed"
   - Status is calculated based on:
     - Current day of week
     - Current time in garage's timezone
     - Opening hours for that day

## Testing the API Endpoints

### GET Opening Hours (Public)
```bash
curl http://localhost:3000/api/opening-hours
```

Should return JSON array with 7 days of opening hours.

### POST Opening Hours (Protected)
```bash
curl -X POST http://localhost:3000/api/opening-hours \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-admin-write-secret" \
  -d '{
    "hours": [
      {"dayOfWeek": 1, "isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
      {"dayOfWeek": 2, "isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
      {"dayOfWeek": 3, "isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
      {"dayOfWeek": 4, "isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
      {"dayOfWeek": 5, "isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
      {"dayOfWeek": 6, "isOpen": true, "openTime": "09:00", "closeTime": "12:00"},
      {"dayOfWeek": 7, "isOpen": false, "openTime": null, "closeTime": null}
    ]
  }'
```

## Testing Edge Cases

1. **Timezone accuracy**:
   - Set garage timezone to different timezone (e.g., "America/New_York")
   - Verify status updates correctly based on that timezone

2. **Different times**:
   - Set Monday-Friday: 09:00 - 17:00
   - Set Saturday: 09:00 - 12:00
   - Set Sunday: Closed
   - Verify status changes throughout the week

3. **Time ranges**:
   - Test with times like 00:00 - 23:45
   - Test with closing time before opening time (next-day close, e.g., 23:00 - 01:00)

## Troubleshooting

- **"Garage not found"**: Ensure you have at least one garage in the database
- **"Unauthorized"**: Check that `ADMIN_WRITE_SECRET` matches `NEXT_PUBLIC_ADMIN_WRITE_SECRET` in `.env.local`
- **Status always shows "closed"**: Verify opening hours are saved and check garage timezone
- **API errors**: Check browser console and server logs for error messages

## Quick Test Checklist

- [ ] Database migration executed successfully
- [ ] Environment variables configured
- [ ] Dev server running (`npm run dev`)
- [ ] Admin page loads at `/admin/opening-hours`
- [ ] Can toggle days on/off
- [ ] Can set open/close times
- [ ] Can save opening hours
- [ ] Public page shows status badge at `/`
- [ ] Status badge shows correct state (open/closed)
- [ ] API GET endpoint returns opening hours
- [ ] API POST endpoint updates opening hours

