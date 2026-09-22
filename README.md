# GearUp API

GearUp is a backend API for a rental marketplace where customers can browse and rent gear, providers can list and manage gear, admins can manage platform operations, and payments are handled through Stripe.

This project is built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

- User authentication and authorization
- Customer and provider role-based access
- Gear listing and filtering
- Rental booking and lifecycle management
- Provider order management
- Payment checkout and confirmation
- Reviews and ratings
- Admin controls
- Vercel-ready deployment setup

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT for authentication
- bcryptjs for password hashing
- Stripe for payments
- Vercel deployment support

## Project Structure

- src/app.ts - Express app setup
- src/server.ts - server startup
- src/modules - route, controller, service modules
- src/middlewares - auth and error handling
- src/lib - Prisma and Stripe configuration
- prisma/schema - database schema
- package.json - scripts and dependencies
- vercel.json - Vercel deployment config

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+
- PostgreSQL database
- Stripe account and secret keys
- A .env file configured

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=5000
APP_URL=http://localhost:5000

DATABASE_URL="your_postgresql_connection_string"

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUNDS=10

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Installation

```bash
npm install
```

## Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

## Run Locally

```bash
npm run dev
```

The server will run on:

```bash
http://localhost:5000
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run stripe:webhook
```

## API Modules

The project exposes API routes grouped by feature:

- `/api/auth` - register, login, refresh token
- `/api/categories` - categories
- `/api/providers` - gear listing and provider operations
- `/api/rentals` - rental management
- `/api/payments` - checkout and confirmation
- `/api/reviews` - reviews and ratings
- `/api/admin` - admin operations

## Testing with Postman

This project is intended to be tested using Postman.

- [GearUp API Postman documentation](https://documenter.getpostman.com/view/55201130/2sBYB2q7Sg)

- Import the Postman collection after testing is completed.
- Use the local base URL:
  - `http://localhost:5000/api`
- For deployment, replace the base URL with the live Vercel domain.

Authentication:
- Some routes require a JWT token.
- Login first to receive the access token.
- Attach the token in the Authorization header or cookie depending on the route implementation.

## Deployment

This project is configured for Vercel deployment.

- Deployment entry file: api/index.ts
- Vercel config: vercel.json

For production deployment, add the same environment variables to the Vercel project settings.

## Production Build

```bash
npm run vercel-build
```

## Notes

- Do not expose secret keys in the repository.
- Stripe webhook secrets must be configured in production.
- Prisma migrations should be applied before production usage.
- Authentication and authorization are enforced at the backend layer.

## License

This project is for educational and project-based use.
