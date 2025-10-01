# Database Setup Guide

This guide will help you set up the database for Astra Academy, both for development and production.

## Quick Start

### Development (SQLite)
For local development, you can use SQLite which is already configured:

```bash
# Create .env.local file
echo 'DATABASE_URL="file:./dev.db"' > .env.local

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database (optional)
npm run db:seed
```

### Production (PostgreSQL)
For production deployment, you'll need a PostgreSQL database.

## Database Providers

### Option 1: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add to your `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   ```

### Option 2: Railway
1. Go to [railway.app](https://railway.app) and create an account
2. Create a new PostgreSQL database
3. Copy the connection string
4. Add to your `.env.local`

### Option 3: Neon
1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new database
3. Copy the connection string
4. Add to your `.env.local`

### Option 4: Self-hosted PostgreSQL
If you have your own PostgreSQL server:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/astra_academy"
```

## Environment Variables

Create a `.env.local` file with:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Database (Required)
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Optional: Supabase for additional features
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed the database with sample data
npm run db:seed

# Reset the database (careful!)
npx prisma db push --force-reset
```

## Schema Overview

The database includes these main models:

- **User**: User accounts synced with Clerk
- **Worksheet**: Created worksheets
- **ExportLog**: Track worksheet exports
- **Template**: Pre-made worksheet templates
- **Subscription**: User subscription plans
- **CreditLedger**: Credit-based usage tracking
- **Report**: Analytics and progress reports

## Migration from SQLite

If you're migrating from SQLite to PostgreSQL:

1. **Backup your data** (if any)
2. **Update DATABASE_URL** in `.env.local`
3. **Run database commands**:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

## Troubleshooting

### Connection Issues
- Check your DATABASE_URL format
- Ensure your database server is running
- Verify firewall settings
- Check if SSL is required

### Schema Issues
- Run `npm run db:generate` after schema changes
- Use `npm run db:push` to sync schema
- Check Prisma logs for detailed errors

### Performance Issues
- Add database indexes for frequently queried fields
- Use connection pooling for high traffic
- Monitor query performance with Prisma Studio

## Production Considerations

1. **Connection Pooling**: Use a connection pooler like PgBouncer
2. **Backups**: Set up automated backups
3. **Monitoring**: Monitor database performance
4. **Scaling**: Plan for horizontal scaling if needed
5. **Security**: Use SSL connections and proper authentication

## Support

If you encounter issues:
1. Check the Prisma documentation
2. Review the error logs
3. Test your connection string
4. Verify your database permissions
