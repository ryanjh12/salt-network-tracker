# Salt Network — Church Onboarding Tracker

A web app for tracking churches through the Salt Network onboarding pipeline.

---

## Step 1: Set Up the Database (Supabase)

You only need to do this once.

1. Go to [supabase.com](https://supabase.com) and log in.
2. Open your project.
3. In the left sidebar, click **SQL Editor**.
4. Click **New query**.
5. Open the file `schema.sql` from this project folder and copy **all** of the text inside it.
6. Paste it into the SQL Editor and click **Run**.
7. You should see a success message. Your database is now ready.

---

## Step 2: Deploy to Vercel

You only need to do this once (or whenever you push updates).

### First-time setup

1. Go to [vercel.com](https://vercel.com) and sign in (create a free account if you don't have one).
2. Click **Add New → Project**.
3. Import your Git repository (GitHub/GitLab/Bitbucket). If you haven't pushed this project to Git yet, see the section below.
4. On the configuration screen:
   - **Framework Preset**: Vite (Vercel usually detects this automatically)
   - **Root Directory**: Leave as-is (or set to the folder containing this README)
5. Scroll down to **Environment Variables** and add these two:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://jzocpvlmvlgjvuttmurc.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_xEgMFRwgRX5BDMGY2geQjw_9fGx7o9g` |

6. Click **Deploy**. Vercel will build and publish your app in about 1–2 minutes.
7. You'll get a public URL like `https://salt-network-tracker.vercel.app`.

### Pushing code to GitHub (if you haven't already)

1. Install [Git](https://git-scm.com/download/win) if you don't have it.
2. Open a terminal in the project folder and run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Create a new repo at [github.com/new](https://github.com/new).
4. Follow the instructions GitHub shows you to push your code.

---

## Step 3: Running Locally (Optional)

If you want to run the app on your own computer:

1. Install [Node.js](https://nodejs.org) (LTS version).
2. Open a terminal in this project folder and run:
   ```
   npm install
   npm run dev
   ```
3. Open your browser to `http://localhost:5173`.

The `.env` file in this folder already has your Supabase credentials — no extra setup needed for local development.

---

## How to Update the App

1. Make your changes to the code.
2. Commit and push to GitHub:
   ```
   git add .
   git commit -m "Describe your change"
   git push
   ```
3. Vercel automatically re-deploys within about 1 minute.

---

## Features

- **Dashboard** — Card view of all churches with color-coded status (On Track / Needs Attention / Stalled)
- **Church Detail** — Full profile with editable info, key leaders, and notes
- **Step Tracker** — Visual progress through Discovery and Assimilation phases
- **Step History** — Log of every completed step with dates and notes
- **Meeting Notes** — Chronological notes with optional Gemini/Google Meet transcript links
- **Add Church** — Simple form to add a new church to the pipeline

---

## Status Logic

| Status | Meaning |
|--------|---------|
| 🟢 On Track | Last activity within 30 days |
| 🟡 Needs Attention | No activity in 30–59 days |
| 🔴 Stalled | No activity in 60+ days |
