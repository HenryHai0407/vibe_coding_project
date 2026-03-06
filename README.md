# Finnish Learning Workspace (MVP Scaffold)

This repository now contains a web-first MVP scaffold for a Finnish learning app built with:

- Next.js App Router + Route Handlers
- TypeScript + Tailwind CSS
- Auth.js (credentials placeholder)
- Prisma + PostgreSQL schema matching the blueprint
- Layered server folders for repositories/services/schemas/mappers

## Implemented now

- Route and folder structure for all MVP pages.
- API route scaffolds for auth/items/examples/tags/review/quiz endpoints.
- Prisma schema for users, learning items, tags, review cards/sessions/attempts.
- Basic review interval calculation service (`calculateNextInterval`).

## Next implementation tasks

1. Wire Auth.js credentials flow to user table.
2. Implement repository/service logic for items, review, and quiz.
3. Add Zod schemas for all endpoint payloads.
4. Add API integration tests and unit tests for scheduling logic.
