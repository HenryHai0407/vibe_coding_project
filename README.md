# Finnish Learning Workspace (MVP)

Web-first MVP for learning Finnish with authenticated item management, review cards, and quiz practice.

## Stack

- Next.js App Router + Route Handlers
- TypeScript + Tailwind CSS
- Auth.js credentials authentication
- Prisma + PostgreSQL
- Zod validation

## Implemented milestones

- Foundation + auth flow
- Learning item CRUD + archive
- Tags and examples management
- Search/filter/pagination/sort for items
- Review card generation
- Flashcard review flow (`/review`)
- Quiz flow (`/quiz`, `/quiz/session/[id]`)
- Dashboard + history insights (`/dashboard`, `/history`)
- Production hardening basics:
  - structured logs
  - auth/register rate limit
  - app loading/error boundaries
  - seed script + migrate deploy script

## Environment

Create `.env` (or `.env.local`) with at least:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="replace-with-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Getting started

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

## Scripts

- `npm run dev` — start dev server
- `npm run lint` — run Next.js lint
- `npm run test` — run unit tests in `tests/unit`
- `npm run build` — production build
- `npm run prisma:migrate` — run dev migrations
- `npm run prisma:deploy` — deploy migrations (prod style)
- `npm run seed` — seed demo user/data

## Demo seed account

After `npm run seed`:

- Email: `demo@example.com`
- Password: `demo12345`

## Notes

- Auth.js requires `NEXTAUTH_SECRET` for protected route flow.
