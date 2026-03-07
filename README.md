# Finnish Learning Workspace (MVP Scaffold)

This repository contains a web-first MVP foundation for a Finnish learning app built with:

- Next.js App Router + Route Handlers
- TypeScript + Tailwind CSS
- Auth.js credentials authentication
- Prisma + PostgreSQL schema
This repository now contains a web-first MVP scaffold for a Finnish learning app built with:

- Next.js App Router + Route Handlers
- TypeScript + Tailwind CSS
- Auth.js (credentials placeholder)
- Prisma + PostgreSQL schema matching the blueprint
- Layered server folders for repositories/services/schemas/mappers

## Implemented now

- Route and folder structure for all MVP pages.
- Functional auth milestone flow:
  - register via `POST /api/auth/register`
  - sign in with Auth.js credentials
  - sign out action on dashboard
  - protected app routes via authenticated `(app)` layout
- API route scaffolds for items/examples/tags/review/quiz endpoints.
- Prisma schema for users, learning items, tags, review cards/sessions/attempts.
- Basic review interval calculation service (`calculateNextInterval`) with unit tests.

## Next implementation tasks

1. Implement learning item CRUD through repositories/services.
2. Add ownership checks and server validation for all write routes.
3. Build tags/examples management and list filtering.
4. Implement review and quiz route business logic end to end.
- API route scaffolds for auth/items/examples/tags/review/quiz endpoints.
- Prisma schema for users, learning items, tags, review cards/sessions/attempts.
- Basic review interval calculation service (`calculateNextInterval`).

## Next implementation tasks

1. Wire Auth.js credentials flow to user table.
2. Implement repository/service logic for items, review, and quiz.
3. Add Zod schemas for all endpoint payloads.
4. Add API integration tests and unit tests for scheduling logic.
