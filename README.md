# Magic Review ✨
### Mobile-First, QR-Based AI Review Generation Multi-Tenant SaaS for Local Indian Businesses

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/raghuashes/Magic-Review)
[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3.3](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=flat&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📖 Overview

**Magic Review** is an ethical, AI-assisted review formulation SaaS tailored for brick-and-mortar retail and service businesses in India (jewellers, restaurants, salons, clinics, clothing boutiques, and repair stores).

Instead of facing writer's block when asked to leave a Google Review, customers scan an in-store QR standee. They pick the service category, tap a few quick tags reflecting their experience (e.g. *"Helpful staff"*, *"Fair pricing"*), select their preferred conversational language, and receive an authentic, tailored draft. With one tap, they copy the draft and jump directly to the verified Google Review URL to post it manually.

### 🛡️ Strict Ethical Standards
1. **Zero Fake Reviews:** The platform NEVER auto-posts reviews via API, nor does it generate fake ratings. The user retains 100% control over reviewing, editing, and publishing.
2. **No Review Gating:** The application does not trap or filter negative feedback. Any customer can edit their draft and proceed to Google Reviews regardless of their sentiment.
3. **Romanized Script Only:** Exactly three language modes are supported:
   - `ENGLISH`: Professional and conversational English.
   - `TELUGU_ENGLISH_MIX`: Natural Telugu phrasing transliterated into English/Latin letters (e.g. *"Mee store lo collection chala bagundhi"*). Native Telugu Unicode characters are strictly forbidden.
   - `HINGLISH`: Vernacular Hindi phrasing transliterated into English/Latin letters (e.g. *"Aapki shop ka collection bahut achha hai"*). Devanagari Unicode characters are strictly forbidden.
4. **Seamless Demo Mode Fallback:** If `GEMINI_API_KEY` is not supplied, the backend seamlessly switches to its internal deterministic demo engine without crashing.

---

## 🚀 Key Features

- **Multi-Tenant Row-Level Isolation:** Every store, category, attribute, and analytics event is strictly isolated by `owner_id` and `store_id`.
- **Custom Store Branding:** Business owners customize brand colors (`primary_color`, `secondary_color`), logos, categories, and review tags.
- **Dynamic QR Code Engine:** Built-in ZXing QR code generator producing PNG streams directly linking to `/s/{slug}`. Printable display previews with one-click download.
- **Analytics & Funnel Tracking:** Real-time metrics tracking Page Views, Drafts Generated, and Google Review clicks with conversion rates.
- **Responsive Mobile-First Customer Page:** Lightning-fast, app-like customer experience designed for smartphones in retail checkout queues.

---

## 🛠️ Tech Stack

- **Backend:** Java 21, Spring Boot 3.3.4, Spring Security 6 (JWT stateless), Spring Data JPA, Hibernate, Flyway Migrations, SpringDoc OpenAPI (Swagger UI), ZXing QR library.
- **Frontend:** React 18, TypeScript (Strict), Vite, Tailwind CSS, Lucide React, Axios, QRCode.react.
- **Database:** PostgreSQL 16.
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) with strict prompt constraints, falling back to `DemoReviewGenerator`.

---

## 🏁 Quickstart

### Prerequisites
- Docker & Docker Compose **OR**
- Java 21 SDK + Maven 3.9+
- Node.js 20+ & npm

### Running via Docker Compose
```bash
# Clone the repository
git clone https://github.com/your-org/magic-review.git
cd magic-review

# Start PostgreSQL, Spring Boot backend, and React frontend
docker-compose up --build
```
Access points:
- **Frontend App:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Swagger Documentation:** http://localhost:8080/swagger-ui/index.html

---

## 📂 Project Structure

```
magic-review/
├── docker-compose.yml
├── .gitignore
├── .env.example
├── README.md
├── DEPLOYMENT.md
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/magicreview/
│       │   ├── config/          # CORS, Security, OpenAPI, RestClient
│       │   ├── controller/      # Auth, Store, Public, Analytics, Category, Attribute
│       │   ├── dto/             # Request & Response DTOs
│       │   ├── entity/          # JPA Entities
│       │   ├── enums/           # Role, LanguageStyle, EventType
│       │   ├── exception/       # GlobalExceptionHandler, Custom exceptions
│       │   ├── integration/     # GeminiApiClient, DemoReviewGenerator
│       │   ├── repository/      # Spring Data Repositories
│       │   ├── security/        # JWT utilities, UserDetailsService, AuthTokenFilter
│       │   └── service/         # Business logic services
│       └── resources/
│           ├── application.yml
│           └── db/migration/V1__init_schema.sql
└── frontend/
    ├── package.json
    ├── Dockerfile
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── components/          # Reusable UI elements, QR modal, cards
        ├── context/             # AuthContext
        ├── layouts/             # DashboardLayout, PublicLayout
        ├── pages/               # Landing, Login, Register, Dashboard, PublicReview
        ├── services/            # Axios API wrappers
        └── types/               # TypeScript interfaces
```
