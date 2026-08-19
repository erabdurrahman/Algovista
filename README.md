# AlgoVista

AlgoVista is a full-stack DSA learning platform with protected user accounts, structured curriculum, progress tracking, practice submission history, and AI-based code explanation.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS
- Backend: Node.js, Express, Mongoose
- Auth/Security: JWT, bcrypt, Helmet, Rate Limiting
- AI: OpenAI API (Code Explainer)
- Testing: Vitest, Jest, Supertest

## Key Features
- User registration/login with JWT-based auth
- Protected learning dashboard and code explainer
- Structured DSA topics (beginner → advanced)
- Topic progress tracking, completion stats, streak days
- Practice submissions (language + notes + code)
- AI code explanation with input limits and usage throttling
- Security middleware (CORS, Helmet, request rate limits)

## Environment Setup
Create `/home/runner/work/Algovista/Algovista/server/.env` from `.env.example`.

Required variables:
- `PORT`
- `MONGODB_URI` (optional but recommended; if absent, app runs in memory mode)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `CORS_ORIGIN`

## Local Run
### 1) Install dependencies
```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 2) Start app
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API Overview
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT token required)

### Learn
- `GET /api/learn/topics`
- `GET /api/learn/topics/:slug`
- `GET /api/learn/progress` (JWT token required)
- `POST /api/learn/progress/:topicId/complete` (JWT token required)
- `POST /api/learn/submissions` (JWT token required)
- `GET /api/learn/submissions` (JWT token required)

### Code Explainer
- `POST /api/explain` (JWT token required)

## Testing & Quality
```bash
npm run lint
npm run test
npm run build
```

## Deployment/Ops Notes
- Set strong random `JWT_SECRET`
- Restrict `CORS_ORIGIN` to frontend domain
- Use production MongoDB and secure network access
- Configure monitoring/log shipping for backend
- Keep dependency and vulnerability scans in CI

## Current Limitations
- Code execution/judging pipeline is not implemented yet
- Leaderboard and collaborative features are pending
- Advanced analytics/alerts are basic and can be expanded
