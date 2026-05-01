# CivicMind AI 🗳️

> An interactive Election Process Education assistant powered by Google Gemini AI, featuring advanced gamification and a premium civic design system.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)](https://flask.palletsprojects.com)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-Deployed-4285F4?logo=google-cloud)](https://cloud.google.com/run)

## Live Demo

🔗 [https://civicmind-ai-651952507170.us-central1.run.app](https://civicmind-ai-651952507170.us-central1.run.app)

## Recent Major Updates (Gamification & AI)

We have transformed CivicMind AI into a high-engagement learning platform with the following core features:

### 🎮 Advanced Gamification Loop
- **Hearts & Lives System**: Users start with 5 hearts. Wrong answers in mission challenges cost a heart, encouraging careful learning. Hearts regenerate over time or can be reset.
- **XP & Dynamic Leagues**: Earn XP for every correct action. Compete in leagues (Bronze, Silver, Gold, Platinum, Diamond) based on your total XP.
- **Daily Goals & Streaks**: Complete challenges to fill your daily XP bar. Maintain a daily streak to maximize your learning momentum.
- **Mascot Interaction**: Sage the Owl, your civic mentor, reacts dynamically to your progress and provides encouraging feedback.

### 🦉 Sage AI Mentor (Enhanced)
- **Context-Aware Chat**: Sage knows where you are in your civic journey (e.g., "Registration Stage") and tailors advice accordingly.
- **Robust AI Engine**: Powered by Gemini 1.5 Flash with a definitive stability fix forcing the `v1` stable API endpoint via `client_options`.
- **Intelligent Fallbacks**: Optimized model selection and error handling to ensure 100% availability even during high traffic.

### 🔄 Data Persistence & Sync
- **Atomic Two-Phase Sync**: Progress is instantly saved to **LocalStorage** for offline access and synced to **Firebase Realtime Database** for cross-device persistence.
- **Safe State Management**: Atomic resets for mission data, XP, and streaks through the settings panel.

## Features

- 🗓 **Interactive Election Journey** — 7-stage learning lifecycle with mission-based challenges.
- 🪜 **Step-by-Step Voting Wizard** — Guided 5-step voting guide with animated progress.
- 🤖 **Sage AI Assistant** — Wise, warm civic mentor owl providing context-aware Q&A.
- 🧠 **Knowledge Quiz** — Gamified MCQ challenges with heart-based life system.
- 🌑 **Premium Glassmorphic UI** — Luminous dark mode design with civic gold accents.
- ♿ **Accessibility First** — 100% ARIA compliance, keyboard navigation, and screen reader support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Context API (State Management) |
| **Backend** | Flask 3 + Gunicorn + Flask-Limiter |
| **AI Engine** | Google Gemini 1.5 Flash (via `google-generativeai`) |
| **Persistence** | Firebase Realtime Database + LocalStorage API |
| **Deployment** | Google Cloud Run (Containerized via Docker) |
| **Testing** | Jest + React Testing Library (30+ tests passing) |

## Infrastructure & Stability

- **Cloud Run Deployment**: Fully containerized and deployed on Google Cloud Run for high scalability.
- **API Version Hardening**: Forces `generativelanguage.googleapis.com/v1/` to bypass SDK versioning issues.
- **Security**:
  - Rate limiting (10 req/min for AI chat).
  - Backend sanitization of all user inputs.
  - CORS and security headers managed via `flask-talisman`.

## Prerequisites

- Node.js 18+
- Python 3.10+
- A Google Cloud Project with Gemini API enabled.
- Firebase Project for authentication and database.

## Local Setup

### 1. Frontend
```bash
npm install
cp .env.example .env # Fill in Firebase config
npm run dev
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Fill in GEMINI_API_KEY
python app.py
```

## Running Tests

```bash
npm test # Runs all frontend and logic tests
```

## License

MIT — built for educational impact 🚀
