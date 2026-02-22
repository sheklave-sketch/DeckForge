# DeckForge V2 - Deployment Guide

## Prerequisites

- Supabase project: `getucjflokixtpcbpvmi`
- Vercel account: `sheklave-9191s-projects`
- GitHub repo: `sheklave-sketch/DeckForge`
- Database schema already created (via SQL Editor in previous session)

## Step 1: Push to GitHub

```bash
cd deckforge
git add .
git commit -m "Complete DeckForge V2 MVP implementation"
git push origin main
```

## Step 2: Deploy to Vercel

### Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/sheklave-9191s-projects)
2. Click "Add New" → "Project"
3. Import `sheklave-sketch/DeckForge`
4. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `deckforge/` (if repo has multiple projects) or `.` (if repo is just DeckForge)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Add Environment Variables

**IMPORTANT**: Replace the placeholder values below with your actual credentials from your local `.env.local` file.

Add the following environment variables in Vercel project settings:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Database (use Supabase transaction pooler for Vercel)
DATABASE_URL=your-supabase-database-url-with-transaction-pooler

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Stripe (Test Mode)
STRIPE_SECRET_KEY=your-stripe-secret-key-here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key-here

# Admin
ADMIN_SEED_SECRET=your-production-secret-here-change-this

# App URL (will be auto-filled by Vercel)
NEXT_PUBLIC_APP_URL=https://deckforge.vercel.app
```

**Important Notes:**
- Use the **transaction pooler** URL for DATABASE_URL in Vercel (port 6543)
- Direct connection (port 5432) won't work in serverless environment
- Generate a new ADMIN_SEED_SECRET for production

### Deploy

Click "Deploy" and wait for build to complete (~2-3 minutes)

## Step 3: Create Supabase Storage Buckets

Go to [Supabase Storage](https://supabase.com/dashboard/project/getucjflokixtpcbpvmi/storage/buckets):

Create the following buckets:

1. **decks** (Public)
   - For generated PPTX files
   - Public access enabled

2. **logos** (Public)
   - For brand kit logos
   - Public access enabled

3. **samples** (Private)
   - For uploaded sample decks
   - Private, requires authentication

4. **thumbnails** (Public)
   - For slide preview images
   - Public access enabled

## Step 4: Seed Component Library

### Option A: Via API Endpoint (Recommended)

Once deployed, seed the database using the admin endpoint:

```bash
curl -X POST https://deckforge.vercel.app/api/admin/seed \
  -H "Authorization: Bearer your-production-secret-here-change-this" \
  -H "Content-Type: application/json"
```

You should see:
```json
{
  "success": true,
  "message": "Seeded 18 components",
  "components": [...]
}
```

### Option B: Via Supabase SQL Editor

If API seeding fails, manually insert components:

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/getucjflokixtpcbpvmi/sql)
2. Run the seed SQL script (see `prisma/seed.sql` if generated)
3. Or use Prisma seed after fixing connection:
   ```bash
   DATABASE_URL="postgresql://postgres:PASSWORD@db.getucjflokixtpcbpvmi.supabase.co:5432/postgres" npm run db:seed
   ```

## Step 5: Enable Supabase Auth

1. Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/getucjflokixtpcbpvmi/auth/settings)
2. Configure:
   - **Site URL**: `https://deckforge.vercel.app`
   - **Redirect URLs**: Add `https://deckforge.vercel.app/**`
3. Enable email provider (or OAuth providers if desired)

## Step 6: Test Production Deployment

### 1. Test Landing Page
Visit `https://deckforge.vercel.app` and verify:
- Page loads correctly
- All styles render properly
- Navigation links work

### 2. Test Sign Up Flow
- Click "Get started"
- Create a test account
- Verify email confirmation (if enabled)
- Check Supabase Auth dashboard for user

### 3. Test Project Creation
- Log in with test account
- Click "New Project"
- Fill in content and parameters
- Generate deck
- Verify:
  - Generation completes in ~10-20 seconds
  - Download button appears
  - PPTX downloads successfully
  - File opens in PowerPoint/Google Slides

### 4. Test Component Library
- Navigate to Components page
- Verify all 18 components appear
- Test category filtering
- Test search functionality

## Step 7: Monitor & Debug

### Vercel Logs
- Go to Vercel Dashboard → Your Project → Logs
- Monitor for errors during generation

### Supabase Logs
- Go to Supabase Dashboard → Logs
- Check database queries
- Monitor API requests

### Common Issues

**1. Database Connection Errors**
- Verify you're using transaction pooler URL (port 6543)
- Check database isn't paused in Supabase

**2. Storage Upload Failures**
- Verify storage buckets exist
- Check bucket permissions (public vs private)
- Ensure SUPABASE_SERVICE_ROLE_KEY is correct

**3. AI Generation Failures**
- Check ANTHROPIC_API_KEY is valid
- Verify API key has credits
- Monitor Claude API rate limits

**4. Authentication Issues**
- Check Site URL and Redirect URLs in Supabase Auth
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct

## Step 8: Post-Deployment Tasks

### Performance Monitoring
- Enable Vercel Analytics
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API response times

### Security Hardening
- Change ADMIN_SEED_SECRET to strong random value
- Review Supabase RLS policies
- Enable rate limiting in Vercel
- Set up Stripe webhooks for subscription management

### Content Updates
- Update privacy policy and terms of service
- Customize email templates in Supabase Auth
- Add real social media links in footer

## Success Criteria

✅ Landing page loads without errors
✅ User signup and login work
✅ Dashboard shows projects
✅ New project form accepts content
✅ AI generation completes successfully
✅ PPTX downloads and opens correctly
✅ Component library displays all components
✅ No console errors or warnings

## Rollback Plan

If deployment fails:

1. **Revert Vercel Deployment**
   - Go to Vercel → Deployments
   - Find previous working deployment
   - Click "Promote to Production"

2. **Database Rollback**
   - Supabase has automatic backups
   - Restore from backup if needed
   - Re-run migration if schema changed

## Next Steps After MVP

1. **Stripe Integration**
   - Set up webhook endpoint
   - Implement subscription management
   - Add payment flow

2. **Enhanced Features**
   - Chat-based editing
   - Component extraction from PPTX
   - AI component generation
   - Thumbnail generation

3. **Scaling**
   - Upgrade Supabase plan if needed
   - Add CDN for static assets
   - Implement caching strategy
   - Add queue system for background jobs

## Support & Troubleshooting

- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Anthropic**: https://docs.anthropic.com

---

**Deployment completed**: [DATE]
**Production URL**: https://deckforge.vercel.app
**Supabase Project**: getucjflokixtpcbpvmi
**Vercel Team**: sheklave-9191s-projects
