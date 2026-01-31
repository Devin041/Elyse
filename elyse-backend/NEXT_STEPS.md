# IMPORTANT: Replace [YOUR_PASSWORD] with Your Actual Supabase Password

Before running migrations, you need to update the DATABASE_URL in `.env.development`:

1. Open `.env.development`
2. Find this line:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres
   ```
3. Replace `[YOUR_PASSWORD]` with the actual password you created in Supabase
4. Save the file

## Example:
If your Supabase password is `MySecurePass123!`, then the line should be:
```
DATABASE_URL=postgresql://postgres:MySecurePass123!@db.bcqsjztmpslvmkrbgevi.supabase.co:5432/postgres
```

## After Updating Password:

Run these commands:

```bash
# 1. Run migrations to create all tables
npm run migrate

# 2. Seed sample data (optional but recommended for development)
npm run seed

# 3. Start the development server
npm run dev
```

## Redis Setup (Optional for Now)

For full functionality, you'll also need Redis. Quick setup:

1. Go to https://upstash.com (free tier)
2. Create new Redis database
3. Copy the Redis URL
4. Update `REDIS_URL` in `.env.development`

For now, the backend will warn about Redis but still work for database operations.

## Verify Setup

After running migrations, check:
- http://localhost:3001/health

Should show:
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "redis": "disconnected"  // OK for now
  }
}
```
