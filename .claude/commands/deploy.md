Deploy this project to Vercel production.

Steps:
1. Run type check first: `npx tsc --noEmit`
2. If clean, push to main branch: `git push origin main`
3. Vercel auto-deploys on push to main.

If the user wants to check deploy status:
```bash
npx vercel --prod
```

Remind the user that Vercel cron jobs (in vercel.json) will be active after deploy — the `/api/ping` cron keeps the Supabase database alive.
