# Muzi

A modern, real-time collaborative music synchronization platform built with a monorepo architecture. Muzi allows users to create "Spaces" where they can synchronize YouTube playback, manage shared queues, and vote on upcoming tracks.

## 🚀 Features

- **Real-time Synchronization**: Synchronized YouTube playback across all participants in a Space.
- **Collaborative Queue**: Anyone in a Space can add tracks to the shared queue.
- **Voting System**: Real-time upvoting and downvoting to prioritize tracks in the queue.
- **Space Management**: Unique Space IDs for private or public sessions.
- **Authentication**: Secure login with Social Providers (Google) via Better Auth.
- **Modern UI**: Built with React 19, Tailwind CSS 4, and shadcn/ui.

## 🛠️ Tech Stack

### Monorepo Tools
- **Turborepo**: High-performance build system for JavaScript and TypeScript monorepos.
- **pnpm**: Fast, disk space efficient package manager.

### Frontend
- **Next.js 15**: App Router, Server Components.
- **Tailwind CSS 4**: Modern styling with the latest engine.
- **Better Auth**: Comprehensive authentication solution.
- **Socket.io-client**: Real-time communication.

### Backend
- **Node.js (Express)**: Fast and minimalist web framework.
- **Socket.io**: Bidirectional, low-latency communication.
- **Redis**: High-performance in-memory data store for space state and queue management.

### Database & ORM
- **PostgreSQL**: Reliable relational database.
- **Drizzle ORM**: Type-safe TypeScript ORM for productivity and performance.

## 📂 Project Structure

```text
├── apps/
│   ├── web/          # Next.js frontend application
│   └── server/       # Express/Socket.io backend application
├── packages/
│   ├── orm-drizzle/  # Shared database schema and migrations
│   ├── ui/           # Shared UI component library (shadcn/ui)
│   ├── typescript-config/ # Shared TS configurations
│   └── eslint-config/ # Shared linting rules
├── compose.yaml      # Docker Compose for local development
└── turbo.json        # Turborepo configuration
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/) (v10 or later)
- [Docker & Docker Compose](https://www.docker.com/) (Optional, for containerized setup)

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Naseemm123/muzi
cd muzi
```

### 2. Environment Configuration
Copy the `.env.example` file to `.env` and fill in the required variables:
```bash
cp .env.example .env
```

### 3. Local Development (Manual Setup)

If you have PostgreSQL and Redis running locally, follow these steps:

**Install dependencies:**
```bash
pnpm install
```

**Setup the Database:**
```bash
cd packages/orm-drizzle
# Generate migration files
pnpm drizzle-kit generate
# Push schema to your local database
pnpm drizzle-kit push
cd ../..
```

**Run in Development Mode:**
```bash
pnpm dev
```
The applications will be available at:
- **Web**: `http://localhost:3000`
- **Server**: `http://localhost:3001`

---

### 4. Local Development (Docker Setup)

This is the easiest way to get started with all dependencies (DB, Redis) pre-configured.

**Spin up the infrastructure:**
```bash
docker compose up -d
```

This will start:
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379
- **Server**: Port 3001
- **Web**: Port 3000

---

## 🔧 Common Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts all apps in development mode with Turborepo |
| `pnpm build` | Builds all apps and packages |
| `pnpm lint` | Runs ESLint across the entire workspace |
| `pnpm format` | Formats all files with Prettier |

## 🛠️ Working with Database

When you change the database schema in `packages/orm-drizzle/src/db/schema.ts`, follow these steps:

1.  **Generate a new migration:**
    ```bash
    cd packages/orm-drizzle
    npx drizzle-kit generate
    ```
2.  **Apply to local database (Dev):**
    ```bash
    npx drizzle-kit push
    ```

## 📄 License

This project is licensed under the [ISC License](LICENSE).
