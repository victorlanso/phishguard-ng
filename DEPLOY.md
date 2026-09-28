# Deployment Guide – PhishGuard NG

## 1. Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (https://vercel.com) – free tier is enough

### Steps

1. **Push your project to GitHub**
   ```bash
   cd phish-app
   git init
   git add .
   git commit -m "Initial PhishGuard NG"
   # Create a new repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/phishguard-ng.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework preset: **Next.js**
   - Click **Deploy**

3. **Add Environment Variables** in Vercel → Project → Settings → Environment Variables:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
   | `RESEND_API_KEY` | your Resend API key |
   | `RESEND_FROM_EMAIL` | `PhishGuard <onboarding@resend.dev>` (or your domain) |

4. **Redeploy** after adding env vars (Deployments → … → Redeploy)

---

## 2. Real Email Sending with Resend

1. Sign up at https://resend.com
2. Go to **API Keys** → Create API Key
3. For testing, you can use the default:
   ```
   RESEND_FROM_EMAIL=PhishGuard Simulation <onboarding@resend.dev>
   ```
   Note: With the free test domain you can only send to **your own Resend account email**.
4. For production:
   - Add and verify your domain in Resend
   - Use something like: `PhishGuard <simulations@yourdomain.com>`
5. Put the key in `.env.local` (local) and in Vercel env vars (production)

### Test sending
1. Create a campaign in `/campaigns`
2. Make sure the demo target emails include an address you control (or update the code to use real user emails)
3. Click **Launch**
4. Check the inbox / Resend dashboard

---

## 3. Custom Domain (Optional)

In Vercel → Project → Settings → Domains:
- Add `app.yourcompany.com` or `phishguard.yourcompany.com`
- Update `NEXT_PUBLIC_APP_URL` to match
- Update Resend domain if you use a custom from-address

---

## 4. After Deployment Checklist

- [ ] App loads at your Vercel URL
- [ ] Login works (if Supabase connected)
- [ ] Report form works
- [ ] Campaign create + tracking links work
- [ ] Opening a tracking link shows the simulation page
- [ ] Results page shows clicks
- [ ] (Optional) Resend sends real emails

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Vercel | Check Node version (set to 20.x in Project Settings) |
| Env vars not working | Redeploy after adding them |
| Emails not sending | Check Resend dashboard logs; free tier only sends to your own email until domain is verified |
| Tracking links point to localhost | Set `NEXT_PUBLIC_APP_URL` to your production URL |
