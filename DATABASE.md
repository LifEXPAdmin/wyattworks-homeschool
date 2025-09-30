# Database Documentation

This document explains the database schema, setup, and usage for the Wyatt Works Homeschool application.

## Database Stack

- **ORM:** Prisma
- **Database:** SQLite (development) / PostgreSQL (production recommended)
- **Client:** Prisma Client

## Schema Overview

### Models

#### 1. **User**

Stores user information synced with Clerk authentication.

**Fields:**

- `id` - Unique identifier (CUID)
- `clerkId` - Clerk user ID (unique)
- `email` - User email (unique)
- `firstName`, `lastName` - User name
- `imageUrl` - Profile image URL
- Timestamps: `createdAt`, `updatedAt`

**Relations:**

- One-to-Many: `worksheets`, `exportLogs`, `creditLedger`, `reports`
- One-to-One: `subscription`

#### 2. **Worksheet**

Represents created worksheets.

**Fields:**

- `id` - Unique identifier
- `userId` - Creator reference
- `title`, `description` - Worksheet info
- `content` - JSON content structure
- `subject` - Math, Science, etc.
- `gradeLevel` - K, 1-12, etc.
- `status` - draft, published, archived
- `isPublic` - Visibility flag
- `templateId` - Source template (optional)
- Timestamps: `createdAt`, `updatedAt`

**Relations:**

- Belongs to: `User`, `Template`
- Has many: `ExportLog`, `Report`

#### 3. **ExportLog**

Tracks worksheet exports (PDF, print, etc.).

**Fields:**

- `id` - Unique identifier
- `userId`, `worksheetId` - References
- `format` - PDF, PNG, DOCX
- `configHash` - Export configuration hash
- `metadata` - JSON export metadata
- `createdAt` - Export timestamp

**Unique Constraint:**

- `(userId, configHash)` - Prevents duplicate exports

**Relations:**

- Belongs to: `User`, `Worksheet`

#### 4. **Template**

Pre-made worksheet templates.

**Fields:**

- `id` - Unique identifier
- `name`, `description` - Template info
- `content` - JSON template structure
- `subject`, `gradeLevel`, `category`
- `thumbnailUrl` - Preview image
- `isPublic`, `isPremium` - Access flags
- `usageCount` - Popularity metric
- Timestamps: `createdAt`, `updatedAt`

**Relations:**

- Has many: `Worksheet`

#### 5. **Subscription**

User subscription/plan information.

**Fields:**

- `id` - Unique identifier
- `userId` - User reference (unique)
- `plan` - free, basic, pro, premium
- `status` - active, canceled, expired, past_due
- `currentPeriodStart`, `currentPeriodEnd` - Billing period
- `cancelAtPeriodEnd` - Cancellation flag
- `stripeCustomerId`, `stripeSubscriptionId` - Stripe integration
- Timestamps: `createdAt`, `updatedAt`

**Relations:**

- Belongs to: `User` (one-to-one)

#### 6. **CreditLedger**

Tracks credit-based usage (exports, AI features).

**Fields:**

- `id` - Unique identifier
- `userId` - User reference
- `amount` - Credits (+ added, - used)
- `balance` - Running balance
- `type` - purchase, usage, bonus, refund
- `description` - Transaction description
- `metadata` - JSON metadata
- `createdAt` - Transaction timestamp

**Relations:**

- Belongs to: `User`

#### 7. **Report**

Analytics and progress reports.

**Fields:**

- `id` - Unique identifier
- `userId`, `worksheetId` - References
- `type` - completion, progress, performance
- `title` - Report title
- `data` - JSON report data
- `dateFrom`, `dateTo` - Report period
- Timestamps: `createdAt`, `updatedAt`

**Relations:**

- Belongs to: `User`, `Worksheet` (optional)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:

- `@prisma/client` - Prisma client for database queries
- `prisma` (dev) - Prisma CLI

### 2. Set Environment Variables

Add to `.env.local`:

```env
DATABASE_URL="file:./dev.db"
```

For production (PostgreSQL):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

This generates the Prisma Client based on your schema.

### 4. Push Schema to Database

```bash
npm run db:push
```

This creates the database and tables without migrations (good for development).

### 5. Seed the Database (Optional)

```bash
npm run db:seed
```

This populates the database with sample templates.

## Available Scripts

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database (dev)
npm run db:push

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## Usage Examples

### Import Prisma Client

```typescript
import prisma from "@/lib/prisma";
```

### Create a User

```typescript
const user = await prisma.user.create({
  data: {
    clerkId: "user_xxxxx",
    email: "parent@example.com",
    firstName: "John",
    lastName: "Doe",
  },
});
```

### Create a Worksheet

```typescript
const worksheet = await prisma.worksheet.create({
  data: {
    userId: user.id,
    title: "Math Practice - Addition",
    content: JSON.stringify({ problems: [...] }),
    subject: "Math",
    gradeLevel: "2",
    status: "draft",
  },
});
```

### Query Worksheets with Relations

```typescript
const worksheets = await prisma.worksheet.findMany({
  where: {
    userId: user.id,
    status: "published",
  },
  include: {
    user: true,
    template: true,
    exportLogs: {
      take: 5,
      orderBy: { createdAt: "desc" },
    },
  },
  orderBy: { createdAt: "desc" },
});
```

### Track Export with Unique Constraint

```typescript
// Prevents duplicate exports with same configuration
try {
  const exportLog = await prisma.exportLog.create({
    data: {
      userId: user.id,
      worksheetId: worksheet.id,
      format: "PDF",
      configHash: "sha256_hash_of_config",
      metadata: JSON.stringify({ pages: 2, orientation: "portrait" }),
    },
  });
} catch (error) {
  // If unique constraint fails, export already exists
  console.log("Export already created with this configuration");
}
```

### Credit Ledger Transaction

```typescript
// Get current balance
const lastEntry = await prisma.creditLedger.findFirst({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
});

const currentBalance = lastEntry?.balance || 0;

// Add credits
await prisma.creditLedger.create({
  data: {
    userId: user.id,
    amount: 100,
    balance: currentBalance + 100,
    type: "purchase",
    description: "Purchased 100 credits",
  },
});

// Use credits
await prisma.creditLedger.create({
  data: {
    userId: user.id,
    amount: -10,
    balance: currentBalance - 10,
    type: "usage",
    description: "PDF export",
  },
});
```

### Subscription Management

```typescript
const subscription = await prisma.subscription.upsert({
  where: { userId: user.id },
  update: {
    plan: "pro",
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  create: {
    userId: user.id,
    plan: "pro",
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
});
```

## Schema Diagram

```
User
├── worksheets (1:N) → Worksheet
├── exportLogs (1:N) → ExportLog
├── subscription (1:1) → Subscription
├── creditLedger (1:N) → CreditLedger
└── reports (1:N) → Report

Worksheet
├── user (N:1) → User
├── template (N:1) → Template
├── exportLogs (1:N) → ExportLog
└── reports (1:N) → Report

Template
└── worksheets (1:N) → Worksheet

ExportLog
├── user (N:1) → User
└── worksheet (N:1) → Worksheet

Subscription
└── user (1:1) → User

CreditLedger
└── user (N:1) → User

Report
├── user (N:1) → User
└── worksheet (N:1) → Worksheet
```

## Production Considerations

### Switching to PostgreSQL

1. Update `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in production environment:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

3. Create and apply migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Connection Pooling

For serverless environments (Vercel, AWS Lambda), consider using:

- **Prisma Data Proxy** for connection pooling
- **PgBouncer** for PostgreSQL
- **Supabase** or **PlanetScale** for managed databases

### Backup Strategy

```bash
# SQLite backup
cp prisma/dev.db prisma/backup/dev-$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql
```

## Troubleshooting

### Prisma Client Not Found

```bash
npm run db:generate
```

### Schema Out of Sync

```bash
npm run db:push
```

### Reset Database (WARNING: Deletes all data)

```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### View Database

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555`

## Best Practices

1. **Always use the singleton Prisma Client** from `@/lib/prisma`
2. **Close connections** in serverless functions (handled by singleton)
3. **Use transactions** for operations that must succeed/fail together
4. **Index frequently queried fields** (already done in schema)
5. **Store JSON data** in JSON fields for flexibility
6. **Use soft deletes** if you need audit trails (add `deletedAt` field)
7. **Validate data** before database operations
8. **Handle unique constraint violations** gracefully

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-best-practices)
- [Next.js + Prisma](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
