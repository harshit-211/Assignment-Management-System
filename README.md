# JoinEazy — Student, Group & Assignment Management System

A role-based full-stack web application where students form their own groups,
manage members, and confirm assignment submissions, while professors post
assignments and track group-wise submission progress.

---

## 1. Overview of implementation

The system has two roles sharing one login flow, differentiated by a `role`
field (`student` / `admin`) set at registration and enforced via JWT on every
protected route.

**Students** can:
- Register and log in
- Create a group (auto-joining it as the first member) and add other students by email
- View assignments posted to their group(s), with a direct OneDrive submission link
- Confirm submission through a two-step flow ("Yes, I have submitted" → final confirm)
- See a live progress bar of their group's completed vs. total assignments

**Professors (Admins)** can:
- Create assignments (title, description, due date, OneDrive link) targeted at
  all groups or specific ones
- View a per-assignment table of every group's submission status
- View an overall completion-rate summary across all assignments they've posted

The stack follows the assignment brief: **React + Tailwind CSS** on the
frontend, **Node.js + Express + PostgreSQL** on the backend, **JWT** for
authentication, and **Docker** for containerized local setup and deployment.

---

## 2. Setup & run instructions

### Option A — Docker (recommended)

Requires only Docker and Docker Compose installed.

```bash
git clone <your-repo-url>
cd Assignment-Management-System
docker compose up --build
```

This starts three containers:
| Service | URL | Notes |
|---|---|---|
| PostgreSQL | `localhost:5433` (mapped) | tables created automatically from `db/init.sql` on first run |
| Backend (Express) | http://localhost:3000 | REST API |
| Frontend (React + Vite) | http://localhost:5173 | the actual app |

> Tables are created automatically **only on a fresh volume**. If you rebuild
> after already having run it once, and need a clean database again, run
> `docker compose down -v` first (this drops the Postgres volume) before
> `docker compose up --build`.

### Option B — Run locally without Docker

**Backend:**
```bash
cd Backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, PORT
npm run dev
```
You'll need a local PostgreSQL instance running, with a database created and
the schema from `db/init.sql` run against it manually (e.g. via pgAdmin's
Query Tool or `psql`).

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend's address
npm run dev
```

### Environment variables

**`Backend/.env`**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/JoinEazy
JWT_SECRET=some_long_random_string
PORT=3000
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:3000/api
```

---

## 3. API endpoint details

All routes except `/auth/*` require an `Authorization: Bearer <token>` header.
Routes marked **(admin)** additionally require the logged-in user's role to be `admin`.

### Auth
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, role }` | Creates a user, returns `{ user, token }` |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ user, token }` |

### Groups
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/groups` | `{ name }` | Creates a group; creator auto-joins |
| POST | `/api/groups/:id/members` | `{ email }` | Adds an existing student to the group by email |
| GET | `/api/groups/mine` | — | Groups the logged-in user belongs to |
| GET | `/api/groups/:id` | — | Group detail + member list |

### Assignments
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/assignments` **(admin)** | `{ title, description, due_date, onedrive_link, target_type, group_ids? }` | `target_type` is `"all"` or `"group"`; `group_ids` required only for `"group"` |
| PUT | `/api/assignments/:id` **(admin)** | any of the fields above | Edits an assignment |
| GET | `/api/assignments` | — | Admin: assignments they created. Student: assignments visible to their group(s) |

### Submissions
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/submissions/:assignmentId/confirm` | `{ group_id }` | Step 1 of the two-step confirm — creates a `pending` record |
| POST | `/api/submissions/:assignmentId/verify` | `{ group_id }` | Step 2 — finalizes as `confirmed` |
| GET | `/api/submissions/assignment/:id` **(admin)** | — | Every group's status for one assignment |
| GET | `/api/submissions/group/:id` | — | One group's status across all its assignments, plus a progress count |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` **(admin)** | Total assignments, overall completion %, per-assignment confirmed/total counts |

---

## 4. Database schema & relationships

```mermaid
erDiagram
    USERS ||--o{ GROUPS : creates
    USERS ||--o{ GROUP_MEMBERS : joins
    GROUPS ||--o{ GROUP_MEMBERS : has
    USERS ||--o{ ASSIGNMENTS : posts
    ASSIGNMENTS ||--o{ ASSIGNMENT_GROUPS : "targeted at"
    GROUPS ||--o{ ASSIGNMENT_GROUPS : "targeted by"
    ASSIGNMENTS ||--o{ SUBMISSIONS : has
    GROUPS ||--o{ SUBMISSIONS : submits
    USERS ||--o{ SUBMISSIONS : confirms

    USERS {
        int id PK
        string name
        string email
        string password_hash
        string role
    }
    GROUPS {
        int id PK
        string name
        int created_by FK
    }
    GROUP_MEMBERS {
        int id PK
        int group_id FK
        int user_id FK
    }
    ASSIGNMENTS {
        int id PK
        string title
        text description
        timestamp due_date
        string onedrive_link
        string target_type
        int created_by FK
    }
    ASSIGNMENT_GROUPS {
        int id PK
        int assignment_id FK
        int group_id FK
    }
    SUBMISSIONS {
        int id PK
        int assignment_id FK
        int group_id FK
        int confirmed_by FK
        string status
        timestamp confirmed_at
    }
```

**Relationship notes:**
- A user can create many groups (1—N), and belongs to many groups through
  `group_members` (N—M), which also records who created each group.
- Only admins create assignments (1—N from `users`).
- An assignment targeted at `"group"` links to specific groups via
  `assignment_groups` (N—M); an assignment targeted at `"all"` needs no rows
  here and is visible to every group.
- `submissions` is the join between one assignment and one group, unique per
  pair — this is what the two-step confirm flow writes to, and what both the
  student progress bar and the admin status table read from.

Full `CREATE TABLE` statements live in [`db/init.sql`](./db/init.sql), and run
automatically when the Docker Postgres container first initializes.

---

## 5. Architecture overview

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────┐        SQL        ┌──────────────┐
│   React + Tailwind   │  ───────────────────────▶ │   Express (Node.js)  │ ──────────────────▶ │  PostgreSQL   │
│   (Vite, port 5173)  │ ◀─────────────────────────│   (port 3000)        │ ◀────────────────── │  (port 5432)  │
└─────────────────────┘       JWT in header        └──────────────────────┘                     └──────────────┘
```

- **Frontend** (`frontend/`): React (Vite) with React Router for role-based
  routing (`ProtectedRoute` gates `/dashboard`/`/assignments` for students and
  `/admin/*` for admins). Auth state and the JWT live in `AuthContext` +
  `localStorage`. All API calls go through a single Axios instance
  (`api/axios.js`) that auto-attaches the token and redirects to `/login` on
  a `401`.
- **Backend** (`Backend/`): Express, organized as
  `routes/ → controllers/ → config/db.js` (a single `pg` connection `Pool`).
  `middleware/auth.js` verifies the JWT and attaches `req.user`;
  `middleware/roleCheck.js` gates admin-only routes. Multi-step writes (e.g.
  creating a group and adding its creator as a member) run inside explicit
  Postgres transactions via `pool.connect()` + `BEGIN`/`COMMIT`.
- **Database**: PostgreSQL, six normalized tables (see §4). Foreign keys use
  `ON DELETE CASCADE` where a child row is meaningless without its parent
  (e.g. `group_members`, `submissions`).
- **File delivery**: submitted work itself is never uploaded to this
  system — students upload directly to a professor-shared OneDrive
  link stored on the assignment; this app only tracks *confirmation status*,
  not the files themselves.

---

## 6. Key design and deployment decisions

- **Two-step submission confirm is two real API calls, not a UI-only
  double-click.** `/confirm` writes a `pending` row, `/verify` flips it to
  `confirmed`. This means a group's "I'm about to submit" intent is recorded
  even if they never complete the second step — useful for a professor to see
  partial progress rather than nothing.
- **`target_type` on assignments (`all` vs `group`)** avoids forcing every
  assignment to explicitly list every group when it's meant for the whole
  class, while still allowing group-specific assignments via the
  `assignment_groups` join table.
- **JWT over sessions**: stateless auth fit a small, fast-to-build API
  better than server-side session storage, and matches the "JWT-based"
  requirement in the brief directly.
- **Transactions for multi-write operations** (group creation + auto-join,
  assignment creation + group targeting) ensure partial failures don't leave
  orphaned rows — e.g. a group without its creator as a member.
- **Docker Compose over a single Dockerfile**: the app has three genuinely
  separate processes (DB, API, frontend) that need to discover each other by
  service name rather than `localhost`, which Compose handles natively via
  its internal network.
- **`db/init.sql` mounted into Postgres's `docker-entrypoint-initdb.d/`**
  instead of a separate migration tool: for a project this size, an
  auto-run schema script is simpler to reason about and verify than adding a
  migration framework, at the cost of not supporting incremental schema
  changes after first boot (acceptable for this scope).
- **Vite dev server (not a production nginx build) in `docker-compose.yml`**:
  chosen to match the local development port (`5173`) exactly, so the
  containerized environment mirrors local `npm run dev` behavior. A
  production-ready `Dockerfile.prod` (multi-stage build served by nginx) is
  included separately for actual deployment.

