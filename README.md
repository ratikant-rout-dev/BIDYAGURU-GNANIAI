# 🎓 Bidya Guru — Speak. Learn. Grow.
> **Desktop-First Multilingual AI Voice Career & Communication Mentor**

Bidya Guru is an AI-powered voice guidance platform designed for college students and technology career aspirants. It allows students to speak naturally in **Odia**, **Hindi**, or **English** to discover career pathways, analyze current skills, receive a personalized step-by-step career roadmap, practice communication skills, and receive structured AI evaluation.

---

## 🌟 Core Features

- **🎙️ Voice-to-Voice AI Mentorship**: Natural conversation powered by **Gnani Vachana Speech Engine** (STT & TTS) and **Google Gemini Flash AI**.
- **🌐 Multilingual Support**: Seamless interaction in **English** (`en-IN`), **Hindi** (`hi-IN`), and **Odia** (`or-IN`).
- **🎯 Career Field & Skill Gap Detection**: Conversational detection of target roles, known skills, developing skills, and missing industry skills.
- **🛣️ Personalized Career Roadmap**: Step-by-step sequential learning journey with interactive milestone status tracking (`Locked`, `In Progress`, `Completed`).
- **🗣️ Communication & Interview Practice**: Spoken practice on core interview prompts with AI scoring for answer structure, clarity, and relevance.
- **📊 Progress Dashboard**: Real-time progress analytics, roadmap completion percentage, and skill mastery tracking.
- **🔐 Production-Grade Security**: Argon2/Bcrypt password hashing, JWT Access + Refresh token rotation, HttpOnly cookies, Helmet security headers, CORS origin control, and Zod schema validation.

---

## 🏛️ System Architecture

```
                       ┌────────────────────────────┐
                       │  React Desktop Web Client  │
                       │     (Vite + Tailwind)      │
                       └──────────────┬─────────────┘
                                      │ REST / Audio
                                      ▼
                       ┌────────────────────────────┐
                       │   Node.js + Express API    │
                       │    (Modular MVC + Zod)     │
                       └───────┬────────────┬───────┘
                               │            │
            ┌──────────────────┴──┐      ┌──┴──────────────────┐
            ▼                     ▼      ▼                     ▼
     ┌──────────────┐     ┌───────────┐ ┌───────────┐   ┌────────────┐
     │MongoDB Atlas │     │Gnani Voice│ │Gemini 3.5 │   │   Argon/   │
     │   Database   │     │ (STT/TTS) │ │ Flash AI  │   │ JWT Tokens │
     └──────────────┘     └───────────┘ └───────────┘   └────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (Tested on v22)
- **npm** v9+

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
# Backend starts on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

### 4. Running the Automated Test Suite
To verify all production API endpoints, database connections, and AI/voice services:
```bash
cd backend
node tests/api.test.js
```

---

## 🧪 Verification Suite Status
All **11/11 tests pass** against live integrations:
- `Health Check API`: **PASS**
- `User Registration (Argon/Bcrypt + JWT)`: **PASS**
- `User Login & Token Issue`: **PASS**
- `Protected Route /api/v1/me`: **PASS**
- `Gemini Career Goal & Skill Gap Detection`: **PASS**
- `Gemini Personalized Career Roadmap Generation`: **PASS**
- `Roadmap Item Status Interactive Update`: **PASS**
- `Communication Practice & Gemini Feedback Analysis`: **PASS**
- `Gnani Vachana Voice Synthesis (TTS WAV Audio)`: **PASS**
- `Voice-to-Voice Mentorship Pipeline (Gemini AI + Gnani Audio)`: **PASS**
- `Progress Analytics & Dashboard Summary`: **PASS**

---

## 📁 Repository Structure

```
BIDYA GURU/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Environment configuration
│   │   ├── controllers/     # Auth, Career, Roadmap, Voice, Comm, Progress
│   │   ├── services/        # Core business & aggregation logic
│   │   ├── models/          # Mongoose Schemas (User, CareerProfile, Roadmap, etc.)
│   │   ├── routes/          # API v1 routes
│   │   ├── middleware/      # Auth, Zod Validation, RateLimiter, ErrorHandler
│   │   ├── validators/      # Zod request schemas
│   │   ├── utils/           # JWT & Password hashing utilities
│   │   └── integrations/
│   │       ├── gnani/       # Gnani Vachana STT & TTS service
│   │       └── gemini/      # Gemini Flash AI service with failover & fallbacks
│   ├── tests/               # Automated end-to-end API test suite
│   ├── server.js            # Server entrypoint
│   └── .env                 # Environment credentials
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Header, UI widgets
│   │   ├── context/         # AuthContext & Language state
│   │   ├── screens/         # Dashboard, Talk, Profile, Roadmap, Comm, Progress, Settings
│   │   ├── api.js           # API client layer
│   │   └── App.jsx          # Main application layout
│   └── vite.config.js       # Vite & Tailwind configuration
├── prd.md                   # Product Requirements Document
├── trd.md                   # Technical Requirements Document
└── env.md                   # Environment documentation
```

