# Personal Productivity Management System (PPMS)

A full-stack production-ready personal productivity application for task management, habit tracking, study planning, analytics, and AI-powered productivity assistance.

## Features

- **Authentication** - Register, login, email verification, password reset, profile management
- **Task Management** - CRUD, priorities, tags, categories, due dates, reminders, recurring tasks, Kanban board, search/filter/sort
- **Habit Tracker** - Daily/weekly/monthly streaks, habit analytics
- **Study Planner** - Subjects, topics, deadlines, exam schedule, study sessions, Pomodoro timer
- **Dashboard** - Productivity score, task/habit/study progress, upcoming deadlines
- **Analytics** - Productivity, habit, and study trends with completion rates
- **Calendar** - Day/week/month views with drag-and-drop scheduling
- **Notifications** - Real-time (Socket.IO), email reminders, browser notifications
- **AI Assistant** - OpenAI-powered task prioritization, study recommendations, weekly goals

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TypeScript, TailwindCSS, React Query, Zustand, React Hook Form, Framer Motion, Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (access + refresh tokens), bcrypt |
| Real-time | Socket.IO |
| Storage | Cloudinary |
| AI | OpenAI API |
| Testing | Jest/Supertest (backend), Vitest/RTL (frontend) |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Project Structure

```
tracker/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Email, AI, notifications, analytics
│   │   ├── types/          # TypeScript interfaces
│   │   ├── utils/          # Helpers & validation
│   │   └── validators/     # Zod schemas
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── api/            # API client & endpoints
│   │   ├── components/     # UI & layout components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── public/
├── .github/workflows/      # CI/CD pipeline
├── docker-compose.yml
└── README.md
```

## Setup & Installation

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm

### 1. Clone and Install

```bash
git clone <repository-url>
cd tracker
npm run install:all
```

### 2. Environment Variables

**Backend** (`backend/.env`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ppms
JWT_ACCESS_SECRET=your-32-char-minimum-access-secret-key
JWT_REFRESH_SECRET=your-32-char-minimum-refresh-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPENAI_API_KEY=sk-your-openai-key
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development

```bash
# Run both frontend and backend
npm run dev

# Or separately:
cd backend && npm run dev    # http://localhost:5000
cd frontend && npm run dev   # http://localhost:5173
```

### 4. Run with Docker

```bash
# Set environment variables in .env file at root
docker-compose up --build
```

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# All tests
npm test
```

## Deployment

### MongoDB Atlas

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP (or `0.0.0.0/0` for cloud deploys)
3. Copy the connection string to `MONGODB_URI`

### Backend (Render)

1. Connect your GitHub repo to [render.com](https://render.com)
2. Use the `backend/render.yaml` blueprint or create a Web Service:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check:** `/api/health`
3. Set all environment variables from `backend/.env.example`
4. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend (Vercel)

1. Import project at [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Set environment variables:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-app.onrender.com`
4. Deploy

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/verify-email/:token` | Verify email |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password/:token` | Reset password |
| GET | `/auth/profile` | Get profile |
| PUT | `/auth/profile` | Update profile |
| POST | `/auth/avatar` | Upload avatar |
| PUT | `/auth/change-password` | Change password |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks (with filters) |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/tasks/kanban` | Get Kanban board |
| PATCH | `/tasks/kanban/order` | Update Kanban order |
| GET | `/tasks/categories` | List categories |
| GET | `/tasks/tags` | List tags |

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/habits` | List habits |
| POST | `/habits` | Create habit |
| PUT | `/habits/:id` | Update habit |
| DELETE | `/habits/:id` | Delete habit |
| POST | `/habits/:id/track` | Track completion |
| DELETE | `/habits/:id/track` | Untrack completion |
| GET | `/habits/analytics` | Habit analytics |
| GET | `/habits/trends` | Habit trends |

### Study

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/study/subjects` | Manage subjects |
| GET/POST | `/study/plans` | Manage study plans |
| GET/POST | `/study/sessions` | Study sessions |
| GET | `/study/exams` | Exam schedule |
| GET | `/study/progress` | Study progress |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard data |
| GET | `/analytics/*` | Analytics endpoints |
| GET | `/calendar/events` | Calendar events |
| POST | `/calendar/schedule` | Schedule task |
| GET | `/notifications` | List notifications |
| POST | `/ai/prioritize` | AI task prioritization |
| POST | `/ai/study-recommendations` | AI study tips |
| POST | `/ai/weekly-goals` | AI weekly goals |
| GET | `/health` | Health check |

### Authentication Header

```
Authorization: Bearer <access_token>
```

## Database Collections

- **Users** - User accounts and preferences
- **Tasks** - Task management with Kanban support
- **Habits** - Habit tracking with completions
- **Subjects** - Study subjects
- **StudyPlans** - Study topics and deadlines
- **StudySessions** - Study/Pomodoro sessions
- **Notifications** - User notifications
- **Analytics** - Daily productivity metrics
- **RefreshTokens** - JWT refresh token storage

## Security

- Helmet security headers
- CORS with origin whitelist
- Rate limiting (general + auth endpoints)
- Input validation with Zod
- MongoDB query sanitization
- XSS protection headers
- bcrypt password hashing (12 rounds)
- JWT access (15min) + refresh (7d) tokens

## License

MIT
