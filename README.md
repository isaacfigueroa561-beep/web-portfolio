# Isaac Figueroa — Portfolio

## Stack
React 18 + Vite + Tailwind CSS v4 + Framer Motion

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

### Option A — GitHub + Vercel (recommended)
1. Push this folder to a new GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Build settings are auto-detected (Vite)
4. Click Deploy

### Option B — Vercel CLI
```bash
npm install -g vercel
npm run build
vercel deploy --prod ./dist
```

## Contact Form
The contact form (`/api/contacts`) calls a backend API. On Vercel it will silently fail unless you deploy the API separately. To disable the form or point it at a different endpoint, update the `fetch("/api/contacts", ...)` call in `src/App.tsx`.

## Custom Domain
In Vercel → your project → Settings → Domains → add `isaacfigueroa.com`
