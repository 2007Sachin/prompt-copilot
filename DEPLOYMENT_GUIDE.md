# Deployment Guide - PromptCopilot

## Prerequisites

Before deploying, ensure you have:
- ✅ Clerk account with publishable key
- ✅ Supabase project with database configured
- ✅ API keys for LLM providers (OpenAI, Groq, Anthropic, Gemini)
- ✅ Vercel/Netlify account (recommended) or other hosting platform

---

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for provisioning to complete

### 1.2 Run SQL Setup
1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `supabase-setup.sql`
3. Run the SQL script
4. Verify tables are created:
   - `prompts`
   - `usage_stats`

### 1.3 Verify RLS Policies
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('prompts', 'usage_stats');

-- Should show: rowsecurity = true
```

### 1.4 Get Supabase Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL (`VITE_SUPABASE_URL`)
   - Anon/Public Key (`VITE_SUPABASE_ANON_KEY`)

---

## Step 2: Clerk Authentication Setup

### 2.1 Create Clerk Application
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Enable sign-in methods (Email, Google, etc.)

### 2.2 Configure Clerk
1. Go to Dashboard → API Keys
2. Copy Publishable Key (`VITE_CLERK_PUBLISHABLE_KEY`)
3. (Optional) Customize sign-in/sign-up pages

### 2.3 Configure JWT Template (for Supabase RLS)
1. Go to JWT Templates in Clerk
2. Create Supabase template
3. Add custom claims if needed

---

## Step 3: Environment Variables

### 3.1 Create `.env.production` file
```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx

# Optional: Default API Keys (NOT RECOMMENDED for production)
# Users should provide their own keys in Settings
VITE_OPENAI_API_KEY=
VITE_GROQ_API_KEY=
VITE_ANTHROPIC_API_KEY=
VITE_GEMINI_API_KEY=
```

### 3.2 Security Note
⚠️ **NEVER** commit API keys to git
⚠️ Provide default keys only for development
⚠️ In production, users should provide their own keys

---

## Step 4: Build & Test Locally

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Test Production Build
```bash
npm run build
npm run preview
```

### 4.3 Verify Functionality
- [ ] Sign in/sign up works
- [ ] Generate prompt works
- [ ] Prompts save to database
- [ ] Usage stats tracked
- [ ] Settings page works
- [ ] History loads correctly

---

## Step 5: Deploy to Vercel (Recommended)

### 5.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 5.2 Login to Vercel
```bash
vercel login
```

### 5.3 Deploy
```bash
# First deployment
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: promptcopilot
# - Directory: ./
# - Framework preset: Vite
```

### 5.4 Add Environment Variables in Vercel
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.production`
3. Redeploy

### 5.5 Deploy to Production
```bash
vercel --prod
```

---

## Alternative: Deploy to Netlify

### Option A: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Option B: Git Integration
1. Push code to GitHub
2. Connect repository in Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy

---

## Step 6: Post-Deployment Verification

### 6.1 Functional Testing
- [ ] Navigate to deployed URL
- [ ] Create account / Sign in
- [ ] Generate a prompt
- [ ] Check Supabase for saved data
- [ ] Verify usage stats appear
- [ ] Test on mobile devices

### 6.2 Check Database
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM prompts;
SELECT COUNT(*) FROM usage_stats;
```

### 6.3 Monitor Errors
- Check browser console
- Check Vercel/Netlify logs
- Check Supabase logs

---

## Step 7: Configure Custom Domain (Optional)

### On Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed
4. Wait for SSL certificate provisioning

### On Netlify:
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS
4. Enable HTTPS

---

## Production Monitoring

### Recommended Tools:
1. **Error Tracking**: Sentry, LogRocket
2. **Analytics**: PostHog, Mixpanel
3. **Performance**: Vercel Analytics, Google Lighthouse
4. **Uptime**: UptimeRobot, Pingdom

### Add Sentry (Example)
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

---

## Troubleshooting

### Issue: "Environment configuration errors"
- **Fix**: Ensure all required env vars are set in hosting platform

### Issue: "Supabase connection failed"
- **Fix**: Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Fix**: Verify RLS policies are configured

### Issue: "Authentication not working"
- **Fix**: Check `VITE_CLERK_PUBLISHABLE_KEY`
- **Fix**: Verify Clerk application is active

### Issue: "Prompts not saving"
- **Fix**: Check Supabase tables exist
- **Fix**: Verify RLS policies allow user access
- **Fix**: Check browser console for errors

### Issue: "API calls failing"
- **Fix**: Ensure users have added API keys in Settings
- **Fix**: Check API key validity
- **Fix**: Verify provider is supported

---

## Security Checklist

Before going live:
- [ ] RLS policies enabled and tested
- [ ] Environment variables secured
- [ ] No API keys in frontend code
- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] Error messages don't expose sensitive data
- [ ] Rate limiting considered
- [ ] User data properly isolated

---

## Maintenance

### Regular Tasks:
1. Monitor error logs weekly
2. Check database usage monthly
3. Update dependencies quarterly
4. Review user feedback
5. Backup database regularly (Supabase handles this)

### Updates:
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix issues
npm audit fix
```

---

## Support & Documentation

- **Clerk Docs**: https://clerk.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide

---

## Success Criteria

Your app is production-ready when:
✅ Users can sign up/sign in
✅ Prompts generate correctly
✅ Data saves to database
✅ Multi-user isolation works
✅ No errors in console
✅ Mobile responsive
✅ HTTPS enabled
✅ Error tracking configured
