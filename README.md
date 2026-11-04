# TaskFlow — AI-Powered Kanban Task Manager

A production-quality, full-stack portfolio project demonstrating React 18, Redux Toolkit, Node.js/Express, MongoDB Atlas, and Mistral AI integration.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| Frontend | _(deploy to Vercel → update here)_ |
| Backend API | _(deploy to Vercel → update here)_ |

---

## ✨ Features

| Feature | Details |
|---------|---------|
| **Authentication** | JWT-based register/login/logout with protected routes and auto-logout on 401 |
| **Boards** | Create, rename, delete Kanban boards (per-user isolation) |
| **Tasks** | Full CRUD with title, description, priority (Low/Medium/High), due date, status |
| **Drag & Drop** | Move tasks between columns with optimistic UI update and rollback on failure |
| **Search & Filter** | Debounced search, filter by priority, sort by due date |
| **AI Task Breakdown** | Enter a goal → Mistral AI suggests 4-6 subtasks → user edits/unticks → creates real tasks |
| **Responsive** | Mobile-first CSS, columns scroll horizontally on small screens |
| **UX Polish** | Toast notifications, loading spinners, empty states, error handling |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI library |
| Vite | Build tool & dev server |
| Redux Toolkit | Global state management |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| @hello-pangea/dnd | Drag-and-drop |
| react-hot-toast | Toast notifications |
| CSS Modules | Scoped component styles |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 18+ | Runtime |
| Express 4 | Web framework |
| MongoDB Atlas + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin resource sharing |
| express-rate-limit | API rate limiting |
| express-validator | Input validation |

### AI
| Technology | Purpose |
|-----------|---------|
| Mistral AI (`mistral-small-latest`) | Subtask generation |
| In-memory cache | Avoids duplicate API calls for repeated goals |

---

## 🏗 Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────┐
│                     React Client (Vite)                      │
│  Pages → Redux Thunks → Axios Interceptors → REST API calls │
└──────────────────────────┬─────────────────────────────────┘
                           │  HTTPS / JSON
┌──────────────────────────▼─────────────────────────────────┐
│               Express Server (Node.js)                       │
│  Routes → Middleware (auth, validate, rate-limit)            │
│         → Controllers → Mongoose Models → MongoDB Atlas      │
│         → aiService → Mistral AI API (server-side only)      │
└────────────────────────────────────────────────────────────┘
```

**Auth flow**: User submits credentials → server validates + hashes password (bcrypt) → issues JWT → client stores token in localStorage → Axios request interceptor attaches `Authorization: Bearer <token>` header on every API call → server's `authMiddleware` validates token on protected routes.

**Drag-and-drop flow**: User drops task in new column → `optimisticUpdateTask` updates Redux state immediately → `PUT /api/tasks/:id` sent to backend → on success: nothing (already updated) → on failure: `rollbackTask` restores previous state + toast error.

**AI flow**: User types goal in TaskForm → Frontend `POST /api/ai/breakdown` → Server calls Mistral API with JSON mode → parses/validates response → returns subtask array → user edits checklist → "Add selected" creates each task via standard task API.

---

## 📁 Folder Structure

```
taskflow/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── app/store.js         # Redux store configuration
│   │   ├── features/
│   │   │   ├── auth/authSlice.js
│   │   │   ├── boards/boardsSlice.js
│   │   │   ├── tasks/tasksSlice.js
│   │   │   └── ai/aiSlice.js
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Navbar/
│   │   │   ├── Spinner/
│   │   │   ├── TaskCard/        # React.memo, Draggable
│   │   │   ├── Column/          # React.memo, Droppable
│   │   │   ├── TaskForm/        # Create/edit task modal
│   │   │   ├── AIBreakdownPanel/# AI subtask suggestions
│   │   │   └── ProtectedRoute/
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Dashboard/       # Board list
│   │   │   ├── BoardView/       # Kanban view
│   │   │   └── NotFound/
│   │   ├── services/api.js      # Axios instance + interceptors
│   │   ├── hooks/useDebounce.js
│   │   ├── utils/constants.js
│   │   └── styles/global.css
│   ├── vercel.json              # SPA rewrite rules
│   └── .env.example
│
├── server/                      # Node.js + Express backend
│   ├── src/
│   │   ├── config/db.js         # Mongoose connection (cached)
│   │   ├── models/              # User, Board, Task schemas
│   │   ├── controllers/         # Auth, Board, Task, AI logic
│   │   ├── routes/              # Express routers
│   │   ├── middleware/          # Auth, validation, rate-limit, errors
│   │   └── services/aiService.js# Mistral API (swap provider here)
│   ├── server.js                # Local dev entry point
│   ├── api/index.js             # Vercel serverless entry
│   ├── vercel.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn
- MongoDB Atlas account (free tier works)
- Mistral AI API key (free tier at [console.mistral.ai](https://console.mistral.ai))

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-small-latest
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Locally

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Environment Variables Reference

### Server Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port for local dev | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWTs (keep long & random) | `s3cr3t_k3y_...` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `CLIENT_URL` | Allowed CORS origin (your frontend URL) | `https://taskflow.vercel.app` |
| `MISTRAL_API_KEY` | Mistral AI API key (never expose to client!) | `abc123...` |
| `MISTRAL_MODEL` | Mistral model to use | `mistral-small-latest` |

### Client Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://taskflow-api.vercel.app/api` |

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | `{name, email, password}` | Register new user |
| POST | `/api/auth/login` | ❌ | `{email, password}` | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | — | Get current user |

### Boards

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| GET | `/api/boards` | ✅ | — | List user's boards |
| POST | `/api/boards` | ✅ | `{title}` | Create board |
| PUT | `/api/boards/:id` | ✅ | `{title}` | Rename board |
| DELETE | `/api/boards/:id` | ✅ | — | Delete board + all tasks |

### Tasks

| Method | Endpoint | Auth | Query Params | Description |
|--------|----------|------|------|-------------|
| GET | `/api/boards/:boardId/tasks` | ✅ | `search, priority, sort, status` | List tasks |
| POST | `/api/boards/:boardId/tasks` | ✅ | — | Create task |
| PUT | `/api/tasks/:id` | ✅ | — | Update task |
| DELETE | `/api/tasks/:id` | ✅ | — | Delete task |

### AI

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/ai/breakdown` | ✅ | 10 req/15min/user | Generate subtasks from goal |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | ❌ | Server health check |

---

## 🚢 Deployment to Vercel

### Backend Deployment

1. Push code to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project**.
3. Import your GitHub repository.
4. Set **Root Directory** to `server`.
5. Set **Framework Preset** to `Other`.
6. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Your frontend Vercel URL (add after deploying frontend) |
| `MISTRAL_API_KEY` | Your Mistral API key |
| `MISTRAL_MODEL` | `mistral-small-latest` |

7. Click **Deploy**. Note the deployment URL.

### Frontend Deployment

1. Go to Vercel → **New Project** → import same repo.
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |

5. Click **Deploy**.
6. Go back to backend project → Settings → Environment Variables → update `CLIENT_URL` to your frontend URL → Redeploy.

---

## 📸 Screenshots

_Add screenshots here after deployment_

| View | Screenshot |
|------|-----------|
| Login | _(screenshot)_ |
| Dashboard | _(screenshot)_ |
| Kanban Board | _(screenshot)_ |
| AI Breakdown | _(screenshot)_ |
| Mobile View | _(screenshot)_ |

---

## 🔗 Git Setup

```bash
cd taskflow
git init
git add .
git commit -m "feat: initial TaskFlow implementation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

---

## 📄 License

MIT
