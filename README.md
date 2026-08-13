# AWS Route53 Web Application Clone

A full-stack, enterprise-grade clone of the **AWS Route53 console web application** built with **Next.js 16.3 (React 19, TypeScript)**, **FastAPI 0.136 (Python 3.12, SQLAlchemy 2.0.47, Pydantic 2.13)**, and **SQLite**.

This application replicates the authentic AWS Route53 console look-and-feel, top navigation bar with user account dropdown, sidebar navigation, table interactions, BIND zone import/export, dark mode, keyboard shortcuts, and full persistent CRUD workflows for Hosted Zones and DNS Records.

# Demo Link (Railway): https://route53client-production.up.railway.app/
Credentials to use: *Email*: `admin@example.com` *Password*: `admin123`
---

## 1. Setup Instructions & Deployment Guide

### Option A: Development Setup

#### Prerequisites
- **Python**: 3.12+
- **Node.js**: 20+ & npm

#### 1. Run Backend (FastAPI)
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (any of these work):
uvicorn app.main:app --reload --port 8000
# OR
python main.py
```
> **Backend API**: `http://localhost:8000`  
> **Database**: Auto-provisions `route53.db` on boot with default credentials:
> - **Email**: `admin@example.com`
> - **Password**: `admin123`

#### 2. Run Frontend (Next.js)
Open a separate terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```
> **Web Console**: `http://localhost:3000`

---

## 2. Architecture Overview

### 2.1 System Architecture & Docker Deployment Diagram

```

┌─────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND                     │
│                                                             │
│  Pages → Hooks (state) → API Client (lib/api.ts) → fetch()  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP + Cookie
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                      │
│                                                             │
│  Layer 1: MIDDLEWARE                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  CORS config → Error handler (AppError → JSON)         │  │
│  └────────────────────────────────────────────────────────┘  │
│                               │                              │
│  Layer 2: ROUTE HANDLERS (api/*.py)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Depends(get_current_user) → validates session cookie  │  │
│  │  Depends(get_db) → injects DB session                  │  │
│  │  Pydantic schema → validates request body              │  │
│  └────────────────────────────────────────────────────────┘  │
│                               │                              │
│  Layer 3: SERVICES (services/*.py)                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Business logic: domain validation, auto NS/SOA,       │  │
│  │  zone emptiness check, record uniqueness               │  │
│  └────────────────────────────────────────────────────────┘  │
│                               │                              │
│  Layer 4: DATABASE ACCESS                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  SQLAlchemy ORM → SQLite (route53.db)                  │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Top Navigation & User Account Menu

The top navigation bar matches the official AWS Management Console layout:
- **Left**: AWS Logo & `Route 53` service branding.
- **Right Icons**: CloudShell `[>_]`, Notifications bell, Help `(?)` (triggers Keyboard Shortcuts modal), Settings `⚙`.
- **Region Menu**: `Global` dropdown.
- **User Account Dropdown**: `[User Name] ▼` (e.g., `Admin User ▼`). When clicked, opens a context menu containing:
  - Account ID (`123456789012`) & User Email
  - Dark Mode Toggle (`On`/`Off`)
  - Keyboard Shortcuts help trigger
  - **Sign out** button

### 2.3 Route53 Sidebar Navigation Layout

Matches the authentic AWS Route53 console sidebar layout (Light `#ffffff` background with dark text, collapsible sections, and `New` badges):

```
Route 53                                    → /                          (redirects to /hosted-zones)
──────────────────────────────────────────
Dashboard                                   → /dashboard                 (Coming Soon)
Hosted zones                                → /hosted-zones              (FULL CRUD IMPLEMENTATION)
Health checks                               → /health-checks             (Coming Soon)
Profiles                                    → /profiles                  (Coming Soon)

▸ Global Resolver
    Global resolvers               [New]    → /resolver                  (Coming Soon)
    Shared DNS views               [New]    → /resolver                  (Coming Soon)

▸ VPC Resolver
    VPCs                                    → /resolver                  (Coming Soon)
    Inbound endpoints                       → /resolver                  (Coming Soon)
    Outbound endpoints                      → /resolver                  (Coming Soon)
    Rules                                   → /resolver                  (Coming Soon)
    Query logging                           → /resolver                  (Coming Soon)
    Outposts                                → /resolver                  (Coming Soon)

▸ Domains
    Registered domains                      → /registered-domains        (Coming Soon)
    Requests                                → /registered-domains        (Coming Soon)

▸ IP-based routing
    CIDR collections                        → /cidr-collections          (Coming Soon)

▸ Traffic flow
    Traffic policies                        → /traffic-policies          (Coming Soon)
    Policy records                          → /policy-records            (Coming Soon)

DNS Firewall                                → /dns-firewall              (Coming Soon)
Application Recovery Controller             → /recovery-controller       (Coming Soon)
```

---

## 3. Database Schema & Data Modeling

### 3.1 Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : "has"
    USERS ||--o{ HOSTED_ZONES : "owns"
    HOSTED_ZONES ||--o{ DNS_RECORDS : "contains"

    USERS {
        TEXT id PK "uuid4"
        TEXT email "unique"
        TEXT password_hash "bcrypt"
        TEXT display_name
        TEXT created_at "ISO-8601"
        TEXT updated_at "ISO-8601"
    }

    SESSIONS {
        TEXT id PK "uuid4 token"
        TEXT user_id FK
        TEXT created_at "ISO-8601"
        TEXT expires_at "ISO-8601"
    }

    HOSTED_ZONES {
        TEXT id PK "Z + alphanumeric"
        TEXT name "FQDN with trailing dot"
        TEXT comment "user description"
        INTEGER is_private_zone "0 or 1"
        INTEGER record_set_count "denormalized"
        TEXT user_id FK
        TEXT created_at "ISO-8601"
        TEXT updated_at "ISO-8601"
    }

    DNS_RECORDS {
        TEXT id PK "uuid4"
        TEXT hosted_zone_id FK
        TEXT name "FQDN"
        TEXT type "A AAAA CNAME TXT MX NS PTR SRV CAA SOA"
        INTEGER ttl "seconds"
        TEXT value "record value or JSON string"
        TEXT routing_policy "Simple"
        TEXT created_at "ISO-8601"
        TEXT updated_at "ISO-8601"
    }
```

### 3.2 Database Tables

- **`users`**: User login accounts (`id`, `email`, `password_hash`, `display_name`, `created_at`, `updated_at`)
- **`sessions`**: Active session tokens (`id`, `user_id`, `created_at`, `expires_at`)
- **`hosted_zones`**: DNS Hosted Zones (`id`, `name`, `comment`, `is_private_zone`, `record_set_count`, `user_id`, `created_at`, `updated_at`)
- **`dns_records`**: DNS Record Sets (`id`, `hosted_zone_id`, `name`, `type`, `ttl`, `value`, `routing_policy`, `created_at`, `updated_at`)

---

## 4. API Overview

### 4.1 Endpoint Reference Table

#### Authentication (`/api/auth`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Log in user & attach HttpOnly `session_id` cookie | No |
| `POST` | `/api/auth/logout` | Revoke session & clear cookie | Yes |
| `GET` | `/api/auth/me` | Fetch active user identity & mocked AWS account info | Yes |

#### Hosted Zones (`/api/hosted-zones`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/hosted-zones` | List hosted zones (supports `search`, `page`, `page_size`) | Yes |
| `POST` | `/api/hosted-zones` | Create hosted zone & auto-generate NS + SOA records | Yes |
| `GET` | `/api/hosted-zones/{zone_id}` | Fetch single hosted zone by ID | Yes |
| `PUT` | `/api/hosted-zones/{zone_id}` | Update hosted zone comment / privacy type | Yes |
| `DELETE` | `/api/hosted-zones/{zone_id}` | Delete hosted zone (requires custom records removed) | Yes |
| `POST` | `/api/hosted-zones/{zone_id}/import` | **Import BIND zone file** (`.zone` text content) | Yes |
| `GET` | `/api/hosted-zones/{zone_id}/export` | **Export hosted zone** as BIND `.zone` or `.json` file | Yes |

#### DNS Records (`/api/hosted-zones/{zone_id}/records`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/hosted-zones/{zone_id}/records` | List DNS records (supports `search`, `type`, `page`, `page_size`) | Yes |
| `POST` | `/api/hosted-zones/{zone_id}/records` | Create new DNS record in hosted zone | Yes |
| `GET` | `/api/hosted-zones/{zone_id}/records/{record_id}` | Fetch single DNS record details | Yes |
| `PUT` | `/api/hosted-zones/{zone_id}/records/{record_id}` | Update existing DNS record | Yes |
| `DELETE` | `/api/hosted-zones/{zone_id}/records/{record_id}` | Delete DNS record | Yes |

---

## 5. Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| <kbd>g</kbd> then <kbd>h</kbd> | Navigate to **Hosted Zones** |
| <kbd>c</kbd> | Navigate to **Create Hosted Zone** |
| <kbd>d</kbd> | Toggle **Dark / Light Mode** |
| <kbd>?</kbd> | Open **Keyboard Shortcuts Help Modal** |
