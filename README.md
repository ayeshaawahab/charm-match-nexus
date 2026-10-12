# Charm Match Nexus

An influencer–brand matching platform (Final Year Project). Brands create campaigns and discover influencers that match their category and goals; influencers manage their profile, packages and bookings.

## Features

- **Authentication** – sign up / log in with Supabase Auth, with separate **Brand** and **Influencer** roles
- **Brand side** – dashboard, explore influencers, create and manage campaigns, brand profile, category browsing
- **Influencer side** – dashboard, profile and profile editing, service packages, bookings
- **Campaign matching** – match influencers to a campaign with similarity scoring
- **Inquiries** – brands can send booking inquiries to influencers
- Protected routes based on login state

## Tech stack

- React 18 + TypeScript, built with Vite
- Tailwind CSS + shadcn/ui (Radix UI)
- React Router, TanStack Query, React Hook Form + Zod
- Supabase (database + authentication)
- Vitest + Testing Library
- Deployed on Vercel (`vercel.json`)

## Getting started

**Requirements:** Node.js 18+ and npm.

```bash
npm install
npm run dev
```

The app runs at http://127.0.0.1:8080.

### Environment variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

Use the **anon (public)** key only. Never use the `service_role` key in frontend code, and make sure Row Level Security is enabled on the tables (`influencers`, `campaigns`, `bookings`, `messages`, `profiles`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests once |

## Project structure

```
src/
  components/   UI components (brand, influencer, home, dashboard, ui)
  hooks/        useAuth, useRole, useInfluencers, ...
  lib/          Supabase client, categories, helpers
  pages/        Route pages (Auth, Brand*, Influencer*, CampaignMatch, ...)
```
