# Deploying Sarathi to Vercel

This guide walks you through deploying the Sarathi static website to Vercel.

Sarathi is a fully static site (HTML, CSS, JS, and JSON data) with no build step, so Vercel deploys it as-is.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free Hobby plan is sufficient)
- One of:
  - A GitHub / GitLab / Bitbucket account (for Git-based deploys), **or**
  - [Node.js](https://nodejs.org/) installed (for CLI deploys)

---

## Method 1: Deploy via Vercel Dashboard (Git-based)

This is the recommended approach — every push to your Git branch redeploys automatically.

### Step 1: Push the project to a Git repository

```bash
cd sarathi-app
git init
git add .
git commit -m "Initial Sarathi commit"
git branch -M main
git remote add origin https://github.com/<your-username>/sarathi-app.git
git push -u origin main
```

### Step 2: Import the project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** and select your `sarathi-app` repo
3. On the configuration screen:
   - **Framework Preset**: `Other` (Vercel auto-detects this is a static site)
   - **Root Directory**: leave as `./` (or set to `sarathi-app` if the repo includes the parent folder)
   - **Build Command**: leave empty
   - **Output Directory**: leave empty (Vercel will serve files from the root)
   - **Install Command**: leave empty
4. Click **Deploy**

Vercel will deploy in ~10–30 seconds and give you a URL like `https://sarathi-app.vercel.app`.

### Step 3: Test your deployment

Open the URL and verify:
- Language selector works
- Random word generator flips cards
- Word search returns verses
- JSON data files load (check Network tab in DevTools)

Every subsequent `git push` to `main` will trigger an automatic production deployment. Pushes to other branches produce preview deployments.

---

## Method 2: Deploy via Vercel CLI

Useful for one-off deploys or when you don't want to use Git.

### Step 1: Install the Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Log in

```bash
vercel login
```

### Step 3: Deploy

From inside the `sarathi-app` directory:

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

On first run, the CLI will ask:
- **Set up and deploy?** → Yes
- **Which scope?** → choose your account
- **Link to existing project?** → No
- **Project name?** → `sarathi-app` (or your choice)
- **Directory with your code?** → `./`
- **Modify settings?** → No

The CLI prints the deployed URL when finished.

---

## Configuration

The repo includes a `vercel.json` that sets:

- **Clean URLs**: `/random` instead of `/random.html`
- **Cache headers**:
  - JSON data files: 1 day browser cache, 7 day CDN cache, 30 day stale-while-revalidate
  - CSS/JS: 1 hour browser cache, 1 day CDN cache
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

If you update the JSON data, Vercel's CDN will serve stale content for up to a day. To force-refresh, redeploy or call the [purge cache API](https://vercel.com/docs/edge-network/caching#purging-the-cache).

A `.vercelignore` excludes `DEPLOYMENT.md`, `README.md`, and editor files from the deployment bundle.

---

## Custom Domain

1. In the Vercel dashboard, open your project → **Settings** → **Domains**
2. Click **Add** and enter your domain (e.g., `sarathi.example.com`)
3. Follow the DNS instructions:
   - For an apex domain: add an `A` record to `76.76.21.21`
   - For a subdomain: add a `CNAME` to `cname.vercel-dns.com`
4. Vercel automatically issues a Let's Encrypt TLS certificate

---

## Updating Your Site

### Git-based (Method 1)

```bash
git add .
git commit -m "Update word data"
git push
```

Vercel redeploys automatically.

### CLI (Method 2)

```bash
vercel --prod
```

---

## Cost

The Hobby plan is free and covers this project easily:
- 100 GB bandwidth / month
- Unlimited static deployments
- Automatic HTTPS and global CDN

The full Sarathi bundle (HTML + CSS + JS + ~2.5 MB JSON data) sits well under the free tier limits.

---

## Troubleshooting

### Clean URLs break old `.html` links
With `cleanUrls: true`, `/random.html` redirects to `/random`. Any hard-coded links to `.html` inside the app still work because Vercel handles the redirect transparently.

### JSON data files return 404
Make sure the `data/` folder was committed (it isn't gitignored anywhere). Check the **Deployments** tab in Vercel → click the deployment → **Source** to confirm the files are present.

### Cached old version after update
Hard-refresh in your browser (`Ctrl + Shift + R`). If still stale, redeploy from the Vercel dashboard — clicking **Redeploy** with **Use existing build cache** unchecked forces a fresh build.

### CORS errors
None expected — the app fetches JSON from the same origin. If you split data onto another domain later, add `Access-Control-Allow-Origin` headers in `vercel.json`.

---

## Migrating from AWS S3

If you previously deployed to S3:
1. Deploy to Vercel using either method above
2. Update your DNS to point at Vercel (see Custom Domain section)
3. Once traffic has moved, you can delete the S3 bucket and any CloudFront distribution

The previous S3 deployment instructions are preserved in Git history if you ever need them.
