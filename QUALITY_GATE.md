# Quality Gate Documentation

This project has automated quality checks to prevent breaking changes from reaching Vercel.

## 🛡️ Quality Gates

### 1. Pre-Commit Hook

**Runs on:** `git commit`

Automatically formats and lints only the files you're committing:

- ESLint with auto-fix
- Prettier formatting
- Applied to: `*.{js,jsx,ts,tsx,json,css,md}`

### 2. Pre-Push Hook

**Runs on:** `git push`

Runs the full CI build before pushing:

- TypeScript type checking (`npm run typecheck`)
- ESLint validation (`npm run lint`)
- Next.js production build (`next build`)

This catches issues before they reach the remote repository.

### 3. GitHub Actions CI

**Runs on:** Push to `main` or Pull Requests

Full quality check pipeline:

1. Prettier format check
2. TypeScript type check
3. ESLint validation
4. Production build
5. Upload build artifacts

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format all files with Prettier
npm run format:check     # Check if files are formatted

# Type Checking
npm run typecheck        # Run TypeScript compiler without emitting files

# Building
npm run build            # Build for production
npm run build:ci         # CI build (typecheck + lint + build)

# Production
npm start                # Start production server
```

## 🔧 Configuration Files

### ESLint (`eslint.config.mjs`)

- Based on Next.js recommended config
- **Modified `react/no-unescaped-entities` rule:**
  - ✅ Allows apostrophes (') and quotes (") in JSX text content
  - ❌ Still enforces escaping for `>` and `}`
  - 💡 Use `&apos;` `&quot;` or our `SafeText` utility from `@/lib/text` for dynamic content

### Prettier (`.prettierrc`)

- Semi-colons: enabled
- Single quotes: disabled (use double quotes)
- Tab width: 2 spaces
- Trailing commas: ES5
- Print width: 100 characters
- Includes Tailwind CSS plugin for class sorting

### Lint-Staged (`package.json`)

Runs on staged files only:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

## 🚀 Setup Instructions

The project is already set up! But if you need to reinstall:

```bash
# Install dependencies
npm install

# Husky hooks are automatically installed via the "prepare" script
# If they're not working, run:
npm run prepare
```

## 🔍 How to Use

### Normal Development Workflow

```bash
# Make your changes
git add .
git commit -m "Your message"  # ← Pre-commit hook runs here (lint-staged)
git push                        # ← Pre-push hook runs here (full build)
```

### Bypass Hooks (NOT RECOMMENDED)

If you absolutely need to bypass hooks:

```bash
git commit --no-verify
git push --no-verify
```

⚠️ **Warning:** Bypassing hooks may cause CI failures and failed Vercel deployments!

## 📝 Handling Apostrophes & Quotes in JSX

### The Problem

ESLint's `react/no-unescaped-entities` rule prevents unescaped quotes in JSX by default.

### Our Solution

We've configured ESLint to **allow apostrophes and quotes in text content** while still enforcing safety for other characters.

### Best Practices

#### ✅ Static Text (Allowed)

```tsx
<p>Don't worry, it's fine!</p>
<p>She said "Hello" today</p>
```

#### ✅ Dynamic Text with SafeText Utility

```tsx
import { SafeText, safeText } from "@/lib/text";

// Component approach
<p>
  <SafeText>{userInput}</SafeText>
</p>;

// Function approach
const message = safeText("User's input with quotes");
```

#### ✅ Manual Escaping

```tsx
<p>Monitor your child&apos;s progress</p>
<p>She said &quot;Hello&quot;</p>
```

#### ❌ Avoid in Attributes

```tsx
// Bad
<div title="Don't do this">

// Good
<div title="Don&apos;t do this">
```

## 🐛 Troubleshooting

### Husky Hooks Not Running

```bash
# Reinstall hooks
rm -rf .husky
npm run prepare
chmod +x .husky/pre-commit .husky/pre-push
```

### Pre-Push Hook Too Slow

The pre-push hook runs a full build, which can take time. Options:

1. Bypass occasionally with `git push --no-verify` (not recommended)
2. Trust the CI to catch issues
3. Run `npm run build:ci` manually before pushing

### CI Failing on GitHub

1. Pull the latest changes: `git pull origin main`
2. Run locally: `npm run build:ci`
3. Fix any errors shown
4. Commit and push again

## 📊 Monitoring

- **Local:** Hooks prevent bad commits/pushes
- **Remote:** GitHub Actions provide a safety net
- **Vercel:** Only deploys if CI passes (configure in Vercel settings)

## 🎯 Recommended Vercel Settings

In your Vercel project settings:

1. **Build & Development Settings**
   - Build Command: `npm run build:ci`
   - Install Command: `npm ci`

2. **Git Integration**
   - Enable "Only deploy if checks pass" (requires GitHub Actions)
   - Enable preview deployments for PRs

This ensures Vercel only deploys code that passes all quality checks.
