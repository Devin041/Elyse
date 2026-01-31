# Elyse E-commerce Backend API

Production-grade backend API for the Elyse e-commerce platform built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Features

✅ **Production-Ready Architecture**
- Type-safe TypeScript configuration
- Express.js with security middleware (Helmet, CORS)
- PostgreSQL with connection pooling
- Redis caching layer
- Comprehensive error handling
- Request logging with unique IDs
- Rate limiting (general, auth, payment)
- Graceful shutdown handling

✅ **Security**
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation with Zod
- Security headers
-Rate limiting
- Environment variable validation

✅ **Developer Experience**
- Hot reload development
- ESLint + Prettier
- Structured logging
- Health check endpoint

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Validation**: Zod
- **Logging**: Winston
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database (Supabase account)
- Redis instance (Upstash or local)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.development
```

3. Update `.env.development` with your credentials:
   - Database URL (from Supabase)
   - Redis URL (from Upstash or local)
   - JWT secrets (generate using crypto)

### Development

Start the development server with hot reload:
```bash
npm run dev
```

Server will start at `http://localhost:3001`

Check health: `http://localhost:3001/health`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Project Structure

```
src/
├── api/
│   ├── routes/          # API route handlers
│   ├── middlewares/     # Express middlewares
│   └── validators/      # Zod validation schemas
├── config/              # Configuration files
│   ├── env.config.ts    # Environment validation
│   ├── database.config.ts
│   └── redis.config.ts
├── database/
│   ├── migrations/      # Database migrations
│   └── seeds/           # Seed data
├── utils/
│   ├── errors/          # Custom error classes
│   ├── logger.ts        # Winston logger
│   └── asyncHandler.ts  # Async error wrapper
├── types/               # TypeScript type definitions
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

**Important**: Never commit `.env` files to version control!

## Health Check

GET `/health`

Returns server health status including database and Redis connection status.

## Next Steps

- [ ] Set up Supabase database
- [ ] Create database migrations
- [ ] Implement authentication endpoints
- [ ] Build product APIs
- [ ] Add payment integration

## License

ISC
