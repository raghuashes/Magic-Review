# Magic Review — Production Deployment Guide

This comprehensive guide covers multiple deployment strategies for **Magic Review**:
- **Method 1:** [1-Click Render Blueprint (Full Stack + Managed DB)](#method-1-1-click-render-blueprint-recommended)
- **Method 2:** [Decoupled SaaS Stack (Vercel Frontend + Supabase DB + Render Backend)](#method-2-decoupled-saas-stack-vercel--supabase--render)
- **Method 3:** [Railway Full-Stack Deployment](#method-3-railway-deployment)
- **Method 4:** [Single VPS / Docker Compose Deployment](#method-4-single-vps--docker-compose)
- [Post-Deployment Verification & Admin Access](#post-deployment-verification)

---

## Method 1: 1-Click Render Blueprint (Recommended)

Magic Review includes a production-ready `render.yaml` blueprint that provisions:
1. **Managed PostgreSQL 16 database** (`magicreview-db`)
2. **Spring Boot 3.3.4 (Java 21) API Web Service** (`magic-review-api`)
3. **React 18 / Vite static site with SPA routing** (`magic-review-ui`)

### Deployment Steps:
1. Fork or push this repository to your GitHub account (`https://github.com/raghuashes/Magic-Review.git`).
2. Log in to [Render](https://render.com/).
3. Navigate to **Blueprints** -> click **New Blueprint Instance**.
4. Select your `Magic-Review` repository.
5. Render detects `render.yaml` automatically:
   - Sets up PostgreSQL with SSL connection strings.
   - Generates a secure, cryptographically random `JWT_SECRET`.
   - Links the frontend to the backend host.
6. *(Optional)* Add your `GEMINI_API_KEY` in the Render dashboard under `magic-review-api` -> **Environment**.
7. Click **Apply**. Render will build and deploy the database, backend, and frontend simultaneously!

---

## Method 2: Decoupled SaaS Stack (Vercel + Supabase + Render)

Best for high-traffic production workloads leveraging global CDNs.

### Step 1: Provision Database on Supabase
1. Create a free project at [Supabase](https://supabase.com/) named `magic-review` (Region: `ap-south-1` Mumbai).
2. Go to **Project Settings** -> **Database** -> **Connection string** -> **URI / JDBC**.
3. Note your connection string:
   ```text
   jdbc:postgresql://db.<PROJECT-REF>.supabase.co:5432/postgres?sslmode=require
   ```
4. *Flyway will automatically run all migrations (`V1`, `V2`, `V3`) when Spring Boot boots.*

### Step 2: Deploy Backend to Render
1. In [Render](https://render.com/), click **New +** -> **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name:** `magic-review-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker` (uses `backend/Dockerfile`)
   - **Region:** Singapore (closest to Mumbai Supabase)
   - **Instance Type:** Starter or Free tier
4. Add Environment Variables:
   | Variable | Value |
   | :--- | :--- |
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db.<REF>.supabase.co:5432/postgres?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres` |
   | `SPRING_DATASOURCE_PASSWORD` | `<your-supabase-db-password>` |
   | `JWT_SECRET` | `<random-64-character-secret>` |
   | `JWT_EXPIRATION_MS` | `86400000` |
   | `GEMINI_API_KEY` | *(Your Gemini API key or empty for demo generator)* |
   | `APP_FRONTEND_BASE_URL` | `https://magicreview.vercel.app` |
   | `CORS_ALLOWED_ORIGINS` | `https://magicreview.vercel.app,http://localhost:5173` |
5. Click **Deploy Web Service**.
6. Verify deployment at `https://magic-review-api.onrender.com/actuator/health` (should return `{"status":"UP"}`).

### Step 3: Deploy Frontend to Vercel
1. Go to [Vercel](https://vercel.com/) -> **Add New...** -> **Project**.
2. Select your `Magic-Review` repository.
3. Configure settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://magic-review-api.onrender.com`
5. The `frontend/vercel.json` file handles all client-side SPA routing rewrites:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
6. Click **Deploy**.

---

## Method 3: Railway Deployment

1. Install Railway CLI or connect via [Railway.app](https://railway.app/).
2. Create a new Project -> **Provision PostgreSQL**.
3. Add a Service from GitHub -> select root directory `backend`.
   - Railway auto-detects `backend/Dockerfile`.
   - Set environment variables referencing the PostgreSQL plugin (`${{Postgres.DATABASE_URL}}`).
4. Add a second Service from GitHub -> select root directory `frontend`.
   - Set build command: `npm install && npm run build`
   - Set `VITE_API_BASE_URL` to backend service public domain.

---

## Method 4: Single VPS / Docker Compose

For deploying on a single Ubuntu / Debian VPS (DigitalOcean Droplet, AWS EC2, Hetzner):

1. SSH into your VPS:
   ```bash
   ssh root@your-vps-ip
   ```
2. Install Docker & Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   apt-get install -y docker-compose-plugin
   ```
3. Clone the repository and configure `.env`:
   ```bash
   git clone https://github.com/raghuashes/Magic-Review.git
   cd Magic-Review
   cp .env.example .env
   nano .env # update passwords, JWT_SECRET, and GEMINI_API_KEY
   ```
4. Launch the stack:
   ```bash
   docker compose up -d --build
   ```
5. Check running containers:
   ```bash
   docker compose ps
   ```
   - **Frontend UI:** `http://<your-ip>:5173`
   - **Backend API:** `http://<your-ip>:8080`
   - **Swagger Docs:** `http://<your-ip>:8080/swagger-ui.html`

---

## Post-Deployment Verification

### 1. Health & Actuator Check
```bash
curl -i https://<your-backend-domain>/actuator/health
# Response: HTTP 200 {"status":"UP"}
```

### 2. Swagger / OpenAPI Documentation
Visit `https://<your-backend-domain>/swagger-ui.html` to view interactive documentation for all 18+ endpoints.

### 3. Default Super Admin Access
On the first launch with an empty database, Spring Boot seeds the initial Super Administrator:
- **Email:** `admin@magicreview.in`
- **Password:** `Admin@MagicReview2026!`
- **Admin Portal URL:** `https://<your-frontend-domain>/admin/dashboard`

> [!IMPORTANT]
> Immediately log into `/admin/dashboard` in production and update the default password, or create an additional administrator with strict credentials.

### 4. Merchant Flow Test
1. Visit `https://<your-frontend-domain>/register`.
2. Register a new test merchant with a storefront poster preset.
3. Access the generated QR code at `/dashboard/qr`.
4. Scan or open `/s/<store-slug>` on a mobile device and generate test drafts in `TELUGU_ENGLISH_MIX`, `HINGLISH`, or `ENGLISH`.
