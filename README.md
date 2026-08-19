# AlgoVista

A simple full-stack DSA learning web app for a B.Tech final-year project.

## Tech Stack
- React (Vite)
- Tailwind CSS
- Node.js + Express
- MongoDB
- OpenAI API (used only in Code Explainer)

## Pages
1. Home
2. Learn
3. Code Explainer
4. Login/Register

## Run locally

### 1) Install dependencies
```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 2) Configure backend env
Create `/home/runner/work/Algovista/Algovista/server/.env` from `.env.example`.

### 3) Start app
```bash
npm run dev
```
Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

## Test
```bash
npm run test
```
