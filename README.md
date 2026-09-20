# UNIQU3 — web

Pre-launch landing page for UNIQU3, a marketplace connecting vehicle owners with
mobile mechanics.

Next.js (App Router) · TypeScript · Tailwind v4 · lucide-react

## Run

```bash
npm install
npm run dev     # http://localhost:3000
```

Node 20+.

## Files

```
src/app/page.tsx                header, hero, steps, services, footer
src/app/globals.css             colors and radii
src/components/AudiencePanel.tsx  the two audience sections
src/components/Waitlist.tsx     the signup form
src/app/api/waitlist/route.ts   placeholder endpoint (in memory)
```

## Waitlist

Posts `{ email, role, zip, joinedAt }`; expects **201** added, **409** already
on the list, otherwise `{ "error": "..." }`. Point at a real endpoint with:

```bash
# .env.local
NEXT_PUBLIC_WAITLIST_API=https://api.example.com/waitlist
```

## Scripts

`npm run dev` · `npm run build` · `npm run start` · `npm run typecheck`
