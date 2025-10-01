# Wyatt Works – Homeschool

A modern worksheet builder for homeschooling parents. Create custom worksheets, track progress, and make learning fun with our intuitive builder designed specifically for homeschool education.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Authentication:** Clerk
- **Code Quality:** ESLint, Prettier, Husky

## Features

- 🎨 Modern, responsive UI with shadcn/ui components
- 🔐 Secure authentication with Clerk
- 📝 Landing page with feature showcase
- 📊 Protected dashboard for authenticated users
- 🛡️ Automated quality gates (ESLint, TypeScript, Prettier)
- 🚀 CI/CD ready with GitHub Actions
- ✨ Pre-commit and pre-push hooks

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- A Clerk account (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd wyattworks-homeschool
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Clerk Authentication**
   - Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Create a new application
   - Copy your API keys

4. **Set up Database**

   **For Development (SQLite):**
   ```bash
   # Create .env.local file
   echo 'DATABASE_URL="file:./dev.db"' > .env.local
   ```

   **For Production (PostgreSQL):**
   - Sign up for [Supabase](https://supabase.com) (free tier available)
   - Create a new project
   - Copy the database URL from Settings > Database
   - Add to `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   ```

5. **Configure environment variables**

   Edit `.env.local` and add your Clerk keys:

   ```env
   # Clerk Authentication (Required)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   
   # Database (Required)
   DATABASE_URL="postgresql://username:password@localhost:5432/astra_academy"
   ```

6. **Initialize the database**

   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database (optional)
   npm run db:seed
   ```

7. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see your application.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs (Pre-configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (Required)
# For development: DATABASE_URL="file:./dev.db"
# For production: DATABASE_URL="postgresql://username:password@host:5432/database"
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
```

See `.env.example` for a template.

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format all files with Prettier
npm run format:check     # Check if files are formatted
npm run typecheck        # Run TypeScript type checking

# CI/CD
npm run build:ci         # Full CI build (typecheck + lint + build)
```

## Project Structure

```
wyattworks-homeschool/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── health/         # Health check endpoint
│   │   ├── dashboard/          # Protected dashboard page
│   │   ├── sign-in/            # Clerk sign-in page
│   │   ├── sign-up/            # Clerk sign-up page
│   │   ├── layout.tsx          # Root layout with ClerkProvider
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   └── text.tsx            # Safe text rendering utilities
│   └── middleware.ts           # Clerk auth middleware
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── .husky/                     # Git hooks
├── .env.example                # Environment variables template
└── package.json
```

## Authentication Routes

- `/` - Public landing page
- `/sign-in` - Sign in page (Clerk)
- `/sign-up` - Sign up page (Clerk)
- `/dashboard` - Protected dashboard (requires authentication)
- `/api/health` - Public health check endpoint

## Code Quality & CI/CD

This project includes automated quality gates:

### Pre-commit Hook

Automatically runs on `git commit`:

- Formats and lints staged files with ESLint and Prettier

### Pre-push Hook

Automatically runs on `git push`:

- TypeScript type checking
- ESLint validation
- Production build

### GitHub Actions CI

Runs on every push to `main` and on pull requests:

- Format check
- Type check
- Linting
- Production build
- Artifact upload

See `QUALITY_GATE.md` for detailed documentation.

## Customization

### Adding New UI Components

This project uses shadcn/ui. To add new components:

```bash
npx shadcn@latest add [component-name]
```

Example:

```bash
npx shadcn@latest add dropdown-menu
```

### Modifying Theme

Edit `src/app/globals.css` to customize colors, borders, and other design tokens. The project uses Tailwind CSS v4 with CSS variables for theming.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

**Recommended Vercel Settings:**

- Build Command: `npm run build:ci`
- Install Command: `npm ci`
- Enable "Only deploy if checks pass"

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:

- AWS Amplify
- Netlify
- Railway
- Self-hosted with Docker

## Troubleshooting

### Clerk Authentication Not Working

1. Verify your environment variables are set correctly
2. Check that `.env.local` is not committed to git
3. Restart the dev server after changing environment variables
4. Ensure your Clerk application is in the correct environment (development/production)

### Git Hooks Not Running

```bash
# Reinstall hooks
rm -rf .husky
npm run prepare
chmod +x .husky/pre-commit .husky/pre-push
```

### Build Errors

Run the CI build locally to debug:

```bash
npm run build:ci
```

This will show the same errors that CI would encounter.

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all quality checks pass: `npm run build:ci`
4. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for homeschooling families**
