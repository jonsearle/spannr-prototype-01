# Quick Setup Guide

## Fix: "Admin secret not configured" Error

You need to add the admin secret to your `.env.local` file. Here's how:

1. **Open or create `.env.local`** in your project root (same directory as `package.json`)

2. **Add these lines** (or update if they exist):

```bash
# Admin Write Secret (server-side)
ADMIN_WRITE_SECRET=your-secret-key-123

# Public Admin Secret (client-side - for prototype only)
NEXT_PUBLIC_ADMIN_WRITE_SECRET=your-secret-key-123
```

**Important:** Both values should be the same! You can use any secret string like:
- `my-prototype-secret-2024`
- `test-secret-123`
- `admin-key-abc`

3. **Restart your dev server** after adding the variables:
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

4. **Try saving again** - it should work now!

## Full .env.local Example

Here's what your complete `.env.local` should look like:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Write Secret
ADMIN_WRITE_SECRET=my-prototype-secret-2024
NEXT_PUBLIC_ADMIN_WRITE_SECRET=my-prototype-secret-2024

# Optional
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Why This Happens

The form component needs `NEXT_PUBLIC_ADMIN_WRITE_SECRET` to authenticate API requests. The `NEXT_PUBLIC_` prefix makes it available to client-side code (browser), which is needed for the form to send the secret in the request header.

**Note:** For a prototype, this is fine. In production, you'd want proper authentication instead of exposing secrets to the client.

