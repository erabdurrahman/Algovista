# Algovista — Interactive Data Structures & Algorithms Learning Platform

**Algovista** is a full-stack educational platform built to help computer science students master fundamental Data Structures and Algorithms through interactive step-by-step visualization, line-by-line code execution tracing, custom input analysis, dynamic progress tracking, and on-demand AI explanations.

---

## 🚀 Key Features

* **Interactive Algorithm Visualizer**: Step-by-step playback with forward/backward execution, play/pause controls, and adjustable animation speed.
* **Synchronized Code Highlighting**: Watch the exact line of JavaScript execute in real-time alongside visual array bars and SVG graph nodes.
* **Custom & Random Inputs**: Test algorithms with custom arrays (up to 30 elements), target search keys, and selectable graph starting nodes.
* **AI Algorithm Tutor**: Ask AI to explain the active step, provide high-level intuition, share real-life analogies, or break down time/space complexity.
* **Dynamic Progress Tracking**: Real-time calculation of overall curriculum percentage, category breakdowns, and practice session counters.
* **Full Authentication**: Clean, secure registration and login using bcrypt password hashing and JSON Web Tokens (JWT).
* **Comprehensive Complexity & Real-Life Explanations**: Instant access to best/average/worst-case time complexities and student-friendly analogies.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Declarative, high-performance UI rendering |
| **Styling** | Tailwind CSS v4 | Clean, modern developer-style responsive UI |
| **Routing** | React Router v7 | Client-side declarative page routing |
| **Backend** | Node.js + Express 5 | Lightweight, secure REST API |
| **Database** | MySQL (`mysql2/promise`) | Relational persistence for users, algorithms, and progress |
| **Authentication** | JWT + bcryptjs | Secure password encryption & session management |
| **AI Integration** | OpenAI API (`gpt-4o-mini`) | Server-side AI explanation engine with offline pedagogical fallback |

---

## 📂 Folder Structure

```text
Algovista/
├── client/
│   ├── src/
│   │   ├── algorithms/               # Deterministic algorithm step engines
│   │   │   ├── sorting/              # Bubble Sort, Selection Sort, Insertion Sort
│   │   │   ├── searching/            # Linear Search, Binary Search
│   │   │   ├── graph/                # BFS, DFS
│   │   │   └── algorithmsData.js     # Algorithm metadata, complexities, and code
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx    # Auth route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # User auth state & token persistence
│   │   ├── lib/
│   │   │   └── api.js                # Frontend API client
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── Visualizer.jsx        # Core interactive visualizer & AI panel
│   │   │   ├── Dashboard.jsx         # Dynamic progress & curriculum dashboard
│   │   │   ├── Auth.jsx              # Login and Register forms
│   │   │   └── About.jsx             # Project architecture & viva summary
│   │   ├── App.jsx                   # Navigation bar and routing
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global Tailwind styling
│   └── vite.config.js                # Vite config with backend API proxy
│
├── server/
│   ├── database/
│   │   └── schema.sql                # MySQL initialization script (3 tables + seeds)
│   ├── src/
│   │   ├── db.js                     # MySQL connection pool and auto-table creator
│   │   ├── auth.js                   # JWT registration, login, and auth middleware
│   │   ├── progress.js               # Dynamic progress calculation & upsert routes
│   │   ├── ai.js                     # OpenAI explainer & offline tutor fallback
│   │   └── index.js                  # Express server entry point
│   ├── .env.example                  # Environment variables template
│   └── package.json                  # Backend dependencies
│
├── package.json                      # Root scripts (concurrently client + server)
└── README.md                         # Project documentation
```

---

## 🗄️ Database Schema (MySQL)

The database consists of **3 clean relational tables**:

### 1. `users`
Stores student accounts with bcrypt-hashed passwords.
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `algorithms`
Catalog of supported DSA algorithms.
```sql
CREATE TABLE algorithms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(30) NOT NULL,
    description TEXT,
    slug VARCHAR(50) UNIQUE NOT NULL
);
```

### 3. `progress`
Tracks user completion, practice counts, and timestamps.
```sql
CREATE TABLE progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    algorithm_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    practice_count INT DEFAULT 0,
    last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id, algorithm_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (algorithm_id) REFERENCES algorithms(id) ON DELETE CASCADE
);
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=algovista

JWT_SECRET=algovista_super_secret_jwt_key_2026

# Optional: Add OpenAI API Key for live AI tutoring
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

CORS_ORIGIN=http://localhost:5173
```

> **Note**: If `OPENAI_API_KEY` is not provided, Algovista automatically uses its built-in pedagogical tutor model so all explanations work out of the box during college vivas and presentations!

---

## 📥 Installation & Running Locally

### Prerequisites
* **Node.js**: v18 or newer
* **MySQL**: Running via XAMPP, WampServer, or MySQL service on port 3306.

### Step 1: Initialize MySQL Database
You can either import `server/database/schema.sql` into phpMyAdmin / MySQL Workbench, or simply start the server (the server will automatically create the database and tables on startup).

```bash
mysql -u root -p < server/database/schema.sql
```

### Step 2: Install Dependencies
From the root project directory:
```bash
npm install
npm --prefix client install
npm --prefix server install
```

### Step 3: Start the Application
Run both frontend and backend concurrently:
```bash
npm run dev
```

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend**: [http://localhost:5000](http://localhost:5000)

---

## 📊 Supported Algorithms

| Algorithm | Category | Difficulty | Time (Best / Avg / Worst) | Space |
| :--- | :--- | :--- | :--- | :--- |
| **Bubble Sort** | Sorting | Easy | $O(n)$ / $O(n^2)$ / $O(n^2)$ | $O(1)$ |
| **Selection Sort** | Sorting | Easy | $O(n^2)$ / $O(n^2)$ / $O(n^2)$ | $O(1)$ |
| **Insertion Sort** | Sorting | Easy | $O(n)$ / $O(n^2)$ / $O(n^2)$ | $O(1)$ |
| **Linear Search** | Searching | Easy | $O(1)$ / $O(n)$ / $O(n)$ | $O(1)$ |
| **Binary Search** | Searching | Medium | $O(1)$ / $O(\log n)$ / $O(\log n)$ | $O(1)$ |
| **Breadth First Search (BFS)** | Graph | Medium | $O(V + E)$ | $O(V)$ |
| **Depth First Search (DFS)** | Graph | Medium | $O(V + E)$ | $O(V)$ |

---

## 🔄 How the System Works

### 1. Visualization Pipeline (Deterministic State Generator)
```text
User Input (Array / Graph)
        ↓
Algorithm Step Generator (e.g., bubbleSort.js)
        ↓
Array of Discrete Frame States [ { array, comparing, action, explanation, codeLine } ]
        ↓
React State Timer & Playback Loop
        ↓
Synchronized UI Update: Array Bars + Code Highlighter + Status Banner
```

### 2. Progress & AI Backend Communication
```text
Browser (React) ─── POST /api/progress/update ───► Express ───► MySQL (Upsert Record)
Browser (React) ─── POST /api/ai/explain ────────► Express ───► OpenAI API / Fallback Tutor
```

---

## 🎓 College Project / Viva Q&A Guide

**Q1: How does step-by-step visualization work without locking the browser?**  
**A:** The frontend does not use blocking loops (like `while(true)` with `sleep`). Instead, the algorithm generates a pure list of immutable state frames. A React `useEffect` timer ticks through the frames index-by-index, allowing the user to pause, step backward, or change speed seamlessly.

**Q2: How is user progress calculated?**  
**A:** Progress is calculated dynamically in the backend using SQL queries on the `progress` and `algorithms` tables (`(completedCount / totalAlgorithms) * 100`). This ensures no duplicate progress records or stale data.

**Q3: How is the OpenAI API kept secure?**  
**A:** The frontend never interacts with OpenAI directly and never stores the API key in client-side code. All requests route through `POST /api/ai/explain` on the Express backend, where the secret key is securely stored in `.env`.
