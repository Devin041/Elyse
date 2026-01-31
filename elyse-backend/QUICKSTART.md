# Elyse E-commerce Backend - Quick Start Guide

## Prerequisites

Before running the backend, you need:

1. **Node.js 20+** - [Download](https://nodejs.org/)
2. **PostgreSQL Database** - Use Supabase (recommended) or local PostgreSQL
3. **Redis** - Use Upstash (recommended) or local Redis

## Setup Instructions

### 1. Install Dependencies

```bash
cd c:\Elyse\elyse-backend
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
copy .env.example .env.development
```

Edit `.env.development` and update these values:

```env
# Required: Update these with your credentials
DATABASE_URL=your-supabase-postgresql-url
REDIS_URL=your-upstash-redis-url

# Generate JWT secrets (run in Node.js):
# require('crypto').randomBytes(32).toString('hex')
JWT_ACCESS_SECRET=your-generated-secret-32-chars-min
JWT_REFRESH_SECRET=your-generated-secret-32-chars-min

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001`

### 4. Verify Health

Open your browser or use curl:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  },
  "environment": "development"
}
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

## Getting API Credentials

### Supabase (PostgreSQL)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the "Connection string" (URI format)
5. Use this as your `DATABASE_URL`

### Upstash (Redis)

1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the "Redis URL"
4. Use this as your `REDIS_URL`

## Project Structure

```
elyse-backend/
├── src/
│   ├── api/              # API routes and middleware
│   ├── config/           # Configuration files
│   ├── database/         # Migrations and seeds
│   ├── utils/            # Utilities and helpers
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── dist/                 # Compiled JavaScript (after build)
├── logs/                 # Application logs
└── package.json
```

## Next Steps

Phase 1 (Backend Foundation) is complete. Next:

1. **Set up Supabase and Redis** - Get your credentials
2. **Phase 2: Database Migrations** - Create database schema
3. **Phase 3: Authentication API** - Login/register endpoints
4. **Phase 4: Product APIs** - Core e-commerce endpoints

## Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env.development
PORT=3002
```

**Database connection failed:**
- Verify DATABASE_URL is correct
- Check Supabase project is running
- Ensure IP is whitelisted in Supab ase settings

**Redis connection failed:**
- Verify REDIS_URL is correct
- Check Upstash database is active

## Support

For issues or questions about the backend setup, refer to:
- [README.md](./README.md) - Detailed documentation
- [Technical Architecture](../brain/technical-architecture.md) - System design
