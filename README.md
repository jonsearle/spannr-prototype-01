# Spannr Prototype 01

A garage website and admin portal prototype that dynamically adapts based on opening hours, emphasizing callback requests when closed.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Storage)
- **Email:** Resend
- **Hosting:** Netlify

## Project Structure

```
src/
├── app/
│   ├── admin/               # Admin portal
│   ├── api/                 # API routes
│   └── layout.tsx
├── components/
│   ├── garage/              # Public components
│   └── admin/               # Admin components
├── lib/
│   ├── supabase/            # DB client & queries
│   ├── email/               # Email service
│   └── utils/               # Helpers (timezone, etc.)
└── types/                   # TypeScript types
```

## Setup Instructions

### 1. Environment Variables

Copy the environment template and fill in your values:

```bash
cp env.template .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `RESEND_API_KEY` - Your Resend API key

### 2. Install Dependencies

```bash
npm install
```

### 3. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build

```bash
npm run build
npm start
```

## GitHub Setup

To connect this repository to GitHub:

1. Create a new repository on GitHub
2. Add the remote origin:
   ```bash
   git remote add origin https://github.com/yourusername/spannr-prototype-01.git
   ```
3. Push the initial commit:
   ```bash
   git push -u origin main
   ```

## Netlify Deployment

This project is configured for Netlify deployment:

1. Connect your GitHub repository to Netlify
2. Set the environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

## Next Steps

- [ ] Set up Supabase database schema
- [ ] Implement garage website components
- [ ] Build admin portal interface
- [ ] Add callback request functionality
- [ ] Implement opening hours logic
- [ ] Add email templates

## Development Notes

This is a functional prototype for research interviews with garage owners. The focus is on demonstrating core value - capturing out-of-hours demand through dynamic open/closed states and callback requests.