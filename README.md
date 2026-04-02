# Hardwood Manager

A basketball franchise management game built with React, Vite, and Supabase.

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### 3. Deploy

Vercel auto-deploys on push to GitHub.

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run your SQL migrations in the Supabase SQL Editor
3. Copy the URL and anon key to Vercel environment variables

## Project Structure

```
src/
  components/     # React components
  context/        # React context providers
  hooks/          # Custom React hooks
  lib/            # Utilities (Supabase client, engines)
  pages/          # Page components
  services/       # API services
```
