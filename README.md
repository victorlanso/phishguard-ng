# PhishGuard NG – Frontend

Mobile-first Progressive Web App for phishing & BEC awareness and reporting, built for Nigerian organisations.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **next-pwa**
- **Supabase** (auth + database + storage ready)
- **Lucide React**, **Sonner**, **Radix UI**

## Features

### Employee App
- Home with big **Report Suspicious** CTA + Daily Tip (English + Pidgin)
- Full report form with **screenshot upload**
- Learning path
- Leaderboard
- Bottom navigation
- Login page

### Admin
- Dashboard with stats
- Reports list with status filters and actions
- Campaign creation + template library
- Content & Users pages

### Security & Backend
- Authentication middleware (protects admin routes)
- `/api/reports` (GET + POST)
- `/api/reports/[id]` (GET + PATCH)
- `/api/upload` (screenshot upload → Supabase Storage ready)
- Complete SQL schema + seed data (`supabase-seed.sql`)

## Quick Start

```bash
cd phish-app
npm install

# Copy env example and add your Supabase keys
cp .env.local.example .env.local

npm run dev
```

Open http://localhost:3000

### Important Routes

| Route | Description |
|-------|-------------|
| `/` | Employee home |
| `/report` | Report form (with screenshot) |
| `/learn` | Learning modules |
| `/leaderboard` | Rankings |
| `/login` | Auth |
| `/dashboard` | Admin dashboard (protected) |
| `/reports` | Admin reports list (protected) |
| `/campaigns` | Create simulations (protected) |

## Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run the entire `supabase-seed.sql` file
3. Go to **Storage** → Create a new **public** bucket named `report-screenshots`
4. Put your keys in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Create a user in Supabase Auth, then insert a matching row into the `users` table with role `admin` or `employee`.

## Authentication Middleware

- Admin routes (`/dashboard`, `/reports`, `/campaigns`, `/content`, `/users`) require login.
- Unauthenticated users are redirected to `/login`.
- Role-based checks are prepared (uncomment in `src/middleware.ts` when ready).

## Screenshot Upload

- Report form uploads images via `/api/upload`
- In demo mode it returns a base64 data URL
- In production, uncomment the Supabase Storage code in `src/app/api/upload/route.ts`

## Project Structure

```
phish-app/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (employee)/          # Home, Report, Learn, Leaderboard
│   │   ├── (admin)/             # Dashboard, Reports, Campaigns...
│   │   └── api/
│   │       ├── reports/
│   │       └── upload/
│   ├── components/
│   ├── lib/supabase/
│   ├── middleware.ts            # Auth protection
│   └── types/
├── public/icons/
├── supabase-seed.sql            # Full schema + sample data
└── .env.local.example
```
# PhishGuard-NG
# PhishGuard-NG
