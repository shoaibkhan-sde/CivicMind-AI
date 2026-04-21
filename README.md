# CivicMind AI 🗳️

> An interactive Election Process Education assistant powered by Google Gemini AI

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)](https://flask.palletsprojects.com)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?logo=google)](https://ai.google.dev)

## Live Demo

🔗 [https://civicmind-ai.web.app](https://civicmind-ai.web.app)

## Screenshots

| Timeline | Voting Guide | AI Chat | Quiz |
|----------|-------------|---------|------|
| 7-stage election lifecycle | Step-by-step wizard | Gemini-powered Q&A | 10-question knowledge test |

## Features

- 🗓 **Interactive Election Timeline** — 7 clickable stages with animated expand/collapse
- 🪜 **Step-by-Step Voting Wizard** — Guided 5-step voting guide with progress bar
- 🤖 **Gemini AI Assistant** — Context-aware election Q&A with suggested questions
- 🧠 **Knowledge Quiz** — 10 MCQ quiz with Firebase leaderboard
- 🌑 **Premium Dark Civic UI** — Deep navy + electric blue + civic gold design system
- ♿ **100% Accessible** — Full ARIA, keyboard nav, screen reader support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Flask 3 + Flask-Limiter + Flask-Talisman |
| AI | Google Gemini 1.5 Flash |
| Database | Firebase Realtime Database |
| Auth | Firebase Auth (Anonymous + Google + Email) |
| Analytics | Google Analytics 4 |
| Fonts | Sora + IBM Plex Sans (Google Fonts) |

## Prerequisites

- Node.js 18+
- Python 3.10+
- A Google Firebase project
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Frontend Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Firebase project values:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://yourproject-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=yourproject
VITE_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Start the development server

```bash
npm run dev
```

App runs at **http://localhost:3000**

## Backend Setup

### 1. Create a virtual environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `backend/.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_SECRET_KEY=your_random_secret_key
FLASK_ENV=development
```

### 4. Start the Flask server

```bash
python app.py
```

Backend runs at **http://localhost:5000**

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in methods: **Anonymous** + **Google** + **Email/Password**
4. Enable **Realtime Database** → Start in test mode
5. Add security rules:
   ```json
   {
     "rules": {
       "quiz_scores": {
         ".read": true,
         ".write": "auth != null"
       }
     }
   }
   ```
6. Copy your web app config into the `.env` file

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Expected output: **30 tests passing** across 7 test files.

## Project Structure

```
CivicMind-AI/
├── .env.example              # Frontend env var template
├── index.html                # HTML entry (GA4, Google Fonts, SEO)
├── vite.config.js            # Vite config with proxy
├── jest.config.js            # Jest test config
├── babel.config.js           # Babel for JSX transforms
├── backend/
│   ├── app.py                # Flask server (Gemini + security)
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend env var template
└── src/
    ├── App.jsx               # Root shell with tab routing
    ├── main.jsx              # React 18 entry point
    ├── firebase.js           # Firebase initialization
    ├── index.css             # Full CSS design system
    ├── components/           # UI components
    ├── hooks/                # Custom React hooks
    ├── utils/                # Utilities (sanitize, a11y, logger, constants)
    └── __tests__/            # Jest test suite
```

## Security

- **Rate limiting**: 10 req/min on `/api/chat`, 20 req/min on `/api/quiz/submit`
- **CSP**: Managed by `flask-talisman` (not meta tags)
- **Input sanitization**: Both client and server side
- **No API keys in frontend**: All secrets in `.env` (gitignored)
- **Firebase rules**: Write requires authentication

## License

MIT — built for hackathon purposes 🚀
