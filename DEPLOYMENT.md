# Magic Review - Production Deployment Guide

This guide provides end-to-end instructions for deploying Magic Review into production:
1. **Database:** Supabase PostgreSQL 16
2. **Backend API:** Render Web Service (Spring Boot 3 + Java 21)
3. **Frontend SPA:** Vercel (React 18 + Vite)

---

## 1. Database Deployment (Supabase PostgreSQL)

1. Sign in to [Supabase](https://supabase.com/) and create a new project named `magic-review`.
2. Choose your nearest region (e.g. `ap-south-1` Mumbai for India).
3. Set a strong database password and note it down.
4. Once provisioned, navigate to **Project Settings** -> **Database** -> **Connection string** -> **URI / JDBC**.
5. Copy the connection parameters:
   - **Host:** `db.<your-project-ref>.supabase.co`
   - **Port:** `5432` or `6543` (transaction pooler)
   - **Database:** `postgres`
   - **User:** `postgres`
   - **Password:** `<your-db-password>`
6. JDBC Connection URL format:
   ```
   jdbc:postgresql://db.<your-project-ref>.supabase.co:5432/postgres?sslmode=require
   ```
7. Flyway will automatically run the schema migrations (`V1__init_schema.sql`) when the Spring Boot backend boots up for the first time.

---

## 2. Backend Deployment (Render Web Service)

1. Sign in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing the Magic Review codebase.
4. Configure the Web Service:
   - **Name:** `magic-review-api`
   - **Region:** Singapore / Frankfurt (or closest to India)
   - **Root Directory:** `backend`
   - **Environment:** `Docker` (uses `backend/Dockerfile`)
   - **Instance Type:** Starter (or Free tier with 512MB RAM)
5. Set Environment Variables in Render:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://db.<your-project-ref>.supabase.co:5432/postgres?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `postgres`
   - `SPRING_DATASOURCE_PASSWORD`: `<your-supabase-db-password>`
   - `JWT_SECRET`: `<64-character-random-hex-or-base64-secret>`
   - `JWT_EXPIRATION_MS`: `86400000`
   - `GEMINI_API_KEY`: `<your-google-gemini-api-key>` (Optional; fallback to demo mode if blank)
   - `APP_FRONTEND_BASE_URL`: `https://magicreview.vercel.app` (your frontend domain)
   - `CORS_ALLOWED_ORIGINS`: `https://magicreview.vercel.app,http://localhost:5173`
6. Click **Deploy Web Service**.
7. Test the health endpoint: `https://magic-review-api.onrender.com/actuator/health`.

---

## 3. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set the project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://magic-review-api.onrender.com`
6. Ensure client-side routing rewrites are configured (already bundled in `vercel.json`):
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
7. Click **Deploy**.
8. Once deployed, copy your production domain (e.g., `https://magicreview.vercel.app`) and update `APP_FRONTEND_BASE_URL` and `CORS_ALLOWED_ORIGINS` in your Render backend settings.

---

## 4. Local Development Quickstart (Docker Compose)

Run the entire stack locally with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- PostgreSQL: `localhost:5432`
