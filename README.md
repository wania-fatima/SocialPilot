# SocialPilot — Setup Guide
## FA23-BDS-042 & FA23-BDS-043

---

## What You're Building

| Module | What it does |
|--------|-------------|
| Module 1 | User Signup / Login / Profile Management |
| Module 2 | Campaign Input Form (niche, platforms, tone, goals) |
| Module 3 | Content Calendar Dashboard (30-day visual grid with post details) |

**Stack:** React (frontend) + Node.js/Express (backend) + MongoDB (database)

---

## Prerequisites — Install These First

### 1. Node.js
Download from: https://nodejs.org/en (LTS version)
After install, open Command Prompt and check:
```
node --version    ← should print v18 or higher
npm --version     ← should print 9 or higher
```

### 2. MongoDB
You said you have MongoDB installed. Make sure it's running:
```
# Windows — open Command Prompt as Administrator:
net start MongoDB

# OR run directly:
mongod
```
MongoDB should be running on mongodb://localhost:27017

---

## Step-by-Step Setup

### Step 1: Set Up the Backend

Open a terminal/Command Prompt in the `socialpilot/backend` folder:

```bash
cd socialpilot/backend
npm install
```

This installs: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv

The `.env` file is already created with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/socialpilot
JWT_SECRET=your_super_secret_key_change_this_in_production_123456
```

Start the backend:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

Test it by visiting: http://localhost:5000/api/health
You should see: `{"status":"SocialPilot API is running!"}`

---

### Step 2: Set Up the Frontend

Open a **NEW** terminal in `socialpilot/frontend`:

```bash
cd socialpilot/frontend
npm install
npm start
```

Your browser will open automatically at http://localhost:3000

The `"proxy": "http://localhost:5000"` in package.json means API calls
from React automatically go to your backend (no CORS issues).

---

## How the App Works (for your understanding)

```
Browser (React)          Backend (Express)         Database (MongoDB)
     |                         |                          |
     |-- POST /api/auth/login →|                          |
     |                         |-- User.findOne(email) -->|
     |                         |<-- user data ------------|
     |<-- JWT token + user ----|                          |
     |                         |                          |
     |-- GET /api/campaigns    |                          |
     |   (with JWT token) ---->|                          |
     |                         |-- Campaign.find(user) -->|
     |<-- campaign list -------|                          |
```

**JWT (JSON Web Token):** When you log in, the server gives you a "token"
(like a key card). Every subsequent request includes this token in the
header so the server knows who you are.

---

## Project File Structure

```
socialpilot/
├── backend/
│   ├── models/
│   │   ├── User.js          ← MongoDB schema for users
│   │   └── Campaign.js      ← MongoDB schema for campaigns & posts
│   ├── routes/
│   │   ├── auth.js          ← /api/auth/signup, login, me
│   │   ├── campaigns.js     ← /api/campaigns (CRUD)
│   │   └── profile.js       ← /api/profile (get/update)
│   ├── middleware/
│   │   └── auth.js          ← JWT verification middleware
│   ├── .env                 ← Environment variables (never commit this!)
│   └── server.js            ← Main Express app
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.js   ← Global login state (React Context)
        ├── pages/
        │   ├── LoginPage.js     ← Module 1: Login
        │   ├── SignupPage.js    ← Module 1: Registration
        │   ├── ProfilePage.js   ← Module 1: Profile management
        │   ├── DashboardPage.js ← Module 3: Campaign list + stats
        │   ├── NewCampaignPage.js ← Module 2: Campaign input form
        │   └── CampaignDetailPage.js ← Module 3: Calendar view
        ├── components/
        │   └── Navbar.js        ← Navigation bar
        ├── App.js               ← Routes (which page shows where)
        └── index.css            ← All styles
```

---

## Use Cases Implemented

### Module 1 — User Authentication & Profile
- UC1.1: User signs up with name, email, password
- UC1.2: User logs in, gets JWT token
- UC1.3: Protected routes redirect to login if not authenticated
- UC1.4: User views and edits brand profile (name, niche, tone, platforms)
- UC1.5: User changes password
- UC1.6: User logs out (token cleared)

### Module 2 — Campaign Input & Configuration
- UC2.1: User fills campaign form (name, brand, niche, tone, platforms, goals, duration)
- UC2.2: User selects target platforms (checkboxes)
- UC2.3: User selects campaign goals
- UC2.4: User sets duration (7/15/30 days) and start date
- UC2.5: System generates 30-day content calendar on submission

### Module 3 — Dashboard & Content Calendar
- UC3.1: User sees all their campaigns with stats
- UC3.2: User opens campaign to see visual calendar grid
- UC3.3: Each cell shows platform, post type, caption preview, performance flag
- UC3.4: User clicks a cell to see full post details
- UC3.5: User approves or rejects individual posts
- UC3.6: User edits post caption inline
- UC3.7: User filters calendar by platform or status
- UC3.8: Dashboard shows aggregate stats (total reach, approved count)

---

## Troubleshooting

**"Cannot connect to MongoDB"**
→ Make sure MongoDB is running: `net start MongoDB` (Windows)

**"Cannot find module '...'"**
→ Run `npm install` in the correct folder

**"Network Error" in React**
→ Make sure backend is running on port 5000

**Port already in use**
→ Change PORT in .env to 5001, and update proxy in frontend/package.json

---

## For Your Submission

You have implemented:
✅ Module 1: User Auth (signup, login, JWT, profile edit, password change)
✅ Module 2: Campaign Input (full form with validations, multi-select)
✅ Module 3: Dashboard & Calendar (visual grid, post details, approve/reject)
✅ MongoDB models with proper schemas
✅ Protected REST API endpoints
✅ React frontend with routing and state management
