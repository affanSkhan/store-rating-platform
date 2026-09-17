# Store Rating Platform

A role-based store rating web application built for the assessment brief. The project keeps one authentication flow for every account and switches the available screens and APIs according to the logged-in user's role.

## Stack

- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- React + Vite
- JWT authentication
- Docker Compose for local PostgreSQL

## Repository layout

```text
store-rating-platform/
├── backend/       # NestJS API, Prisma schema, seed data and tests
├── frontend/      # React application
├── docs/          # Architecture and API notes
├── .github/       # CI workflow
└── docker-compose.yml
```

## Local setup

1. Start PostgreSQL with `docker compose up -d`.
2. Copy `backend/.env.example` to `backend/.env` and adjust values if needed.
3. From `backend`, run `npm install`, `npx prisma migrate dev`, `npx prisma db seed`, then `npm run start:dev`.
4. From `frontend`, run `npm install` and `npm run dev`.

See the repository documentation for demo accounts and the full implementation notes.
