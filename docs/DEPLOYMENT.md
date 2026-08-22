# Deployment Guide

This app deploys as two separate services: the **frontend** (static site) on
**Vercel**, and the **backend** (Node/Express API) on **Render**.

## 1. Deploy the backend to Render

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. Go to https://dashboard.render.com → **New +** → **Web Service**.
3. Connect your repository and select it.
4. Configure the service:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free or Starter (either works for an MVP)
5. Under **Environment Variables**, add:
   - `OPENAI_API_KEY` = your OpenAI key
   - `GEMINI_API_KEY` = your Gemini key
   - `GEMINI_MODEL` = `gemini-1.5-flash` (optional)
   - `CORS_ORIGIN` = your Vercel frontend URL (you can update this after step 2 gives you the URL — use `https://your-app.vercel.app`, comma-separated if you have multiple domains)
   - `PORT` — leave unset; Render sets this automatically and Express reads `process.env.PORT`
6. Click **Create Web Service**. Render will build and deploy; note the resulting
   URL, e.g. `https://speakwise-ai-backend.onrender.com`.
7. Verify it's live: visit `https://<your-backend>.onrender.com/api/health`.

> **Note:** Render's free tier spins down idle services. The first request after
> inactivity may take 30-60 seconds while it wakes up — this is normal.

## 2. Deploy the frontend to Vercel

1. Go to https://vercel.com/new and import the same repository.
2. Configure the project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = the Render backend URL from step 1, e.g.
     `https://speakwise-ai-backend.onrender.com`
4. Click **Deploy**.
5. Once deployed, copy your Vercel URL (e.g. `https://speakwise-ai.vercel.app`).

## 3. Close the loop on CORS

Go back to your Render service → **Environment** → update `CORS_ORIGIN` to your
real Vercel URL from step 2 (comma-separate if you also want to allow a custom
domain or `localhost:5173` for continued local testing):

```
CORS_ORIGIN=https://speakwise-ai.vercel.app,http://localhost:5173
```

Save — Render will redeploy automatically with the new value.

## 4. Verify end-to-end

1. Open your Vercel URL.
2. Go to **Practice**, spin the wheel, start a short prep, record a few seconds
   of audio, and confirm:
   - Transcription returns text (tests the OpenAI key + CORS + Render wake-up)
   - Analysis returns scores (tests the Gemini key)
3. Check **History** and **Progress** to confirm `localStorage` state persists
   across a page reload.

## Custom Domains (optional)

- **Vercel:** Project → Settings → Domains → add your domain, follow the DNS instructions.
- **Render:** Service → Settings → Custom Domain → add your domain, follow the DNS instructions.
  Remember to also add the custom frontend domain to `CORS_ORIGIN` on the backend.

## Updating environment variables later

Both platforms redeploy automatically when you change environment variables
through their dashboards — no code change needed. Rotate `OPENAI_API_KEY` or
`GEMINI_API_KEY` any time by updating the value on Render.

## Cost Notes

- Vercel's free tier comfortably hosts a static Vite build.
- Render's free tier works for demos; for production traffic, consider a paid
  instance so the backend doesn't spin down between requests.
- OpenAI Whisper and Gemini are both billed per usage — monitor usage in each
  provider's dashboard, especially during public demos.
