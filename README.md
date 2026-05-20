<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# AI Dev Account Manager

Internal dashboard for managing AI development accounts, token usage, and project handoffs.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4)](https://tailwindcss.com/)

</div>

## Overview

AI Dev Account Manager is a web-based internal tool for teams that work with multiple AI service accounts (Gemini, OpenAI, etc.). It provides centralized management of accounts, projects, token quotas, and developer handoffs — all backed by Firebase.

**Key Features:**

- **Dashboard** — Real-time overview of active accounts, projects, token usage, and quota alerts.
- **Account Registry** — Manage AI service accounts with provider tagging, token limits, and status tracking (active / cooldown / banned).
- **Project Management** — Track development projects with type, priority, status, and group organization.
- **Project Groups** — Logical grouping of related projects.
- **Provider Registry** — Maintain a catalog of AI providers.
- **Project Detail & Handoffs** — Per-project view with linked AI assets, context variables, and structured handoff notes for seamless developer transitions.
- **Multi-language Support** — English and Vietnamese (EN/VI).
- **Role-based Access** — Admin and Developer roles with Firestore security rules enforcement.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.8, Vite 6 |
| Styling | Tailwind CSS 4, shadcn/ui (base-nova), Lucide icons |
| State | Zustand |
| Forms | React Hook Form + Zod validation |
| Routing | React Router DOM 7 |
| Backend | Express (dev server with Vite middleware) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google sign-in) |
| AI | Google Gemini API (`@google/genai`) |
| Animation | Motion (Framer Motion) |
| Charts | Recharts |

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── layout/          # AppLayout, AppSidebar, AuthLayout, Header
│   │   └── ui/              # shadcn/ui components (button, card, dialog, table, etc.)
│   ├── contexts/            # LanguageContext (i18n)
│   ├── hooks/               # Custom hooks (use-mobile)
│   ├── lib/                 # Firebase config, Firestore utilities, helpers
│   ├── locales/             # EN/VI translations
│   ├── pages/               # Dashboard, Accounts, Projects, ProjectDetail,
│   │                        #   ProjectGroups, Providers, Login
│   ├── store/               # Zustand auth store
│   ├── types/               # TypeScript interfaces & types
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── server.ts                # Express + Vite dev server
├── firestore.rules          # Firestore security rules
├── firebase-blueprint.json  # Entity schemas & Firestore collections
├── firebase-applet-config.json  # Firebase project config
├── security_spec.md         # Security specification & test scenarios
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── components.json          # shadcn/ui config
```

## Data Model

| Collection | Description |
|------------|-------------|
| `users` | User profiles with role (admin / developer) |
| `accounts` | AI service accounts with provider, token limits, and status |
| `providers` | AI provider registry |
| `projects` | Development projects with type, priority, and linked accounts |
| `project_groups` | Logical groupings of related projects |
| `transfers` | Immutable log of project-to-account transfers |
| `sessions` | Development session tracking with token usage |
| `handoffs` | Context handoff documents for project continuity |

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- A **Firebase** project with Firestore and Authentication enabled
- A **Gemini API key** (for AI features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/trunhquang/ai_dev_manager_account.git
cd ai_dev_manager_account

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and set:
#   GEMINI_API_KEY=your_gemini_api_key
#   APP_URL=http://localhost:3000
```

### Development

```bash
npm run dev        # Start dev server (Express + Vite HMR) on http://localhost:3000
```

### Build & Production

```bash
npm run build      # Build for production (Vite)
npm run preview    # Preview production build
npm run start      # Start production server
```

### Lint

```bash
npm run lint       # TypeScript type-check (tsc --noEmit)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (auto-injected by AI Studio at runtime) |
| `APP_URL` | Application URL for self-referential links and callbacks |

See [`.env.example`](.env.example) for details.

## Security

The app enforces role-based access control via Firestore security rules:

- **Admin** — Full CRUD on all collections; can manage account status and token limits.
- **Developer** — Read access to accounts and projects; can update sessions, handoffs, and limited project fields.
- All writes are validated against entity schemas (type, range, enum checks).
- Default deny policy — no access unless explicitly granted.

See [`security_spec.md`](security_spec.md) for the full security specification and attack scenario coverage.

## AI Studio

This app is built for [Google AI Studio](https://ai.studio). View the live app:

https://ai.studio/apps/9e95acee-b047-438a-bf77-8e1189e27c84

## License

Private — Internal use only.
