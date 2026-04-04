# 🧠 ResumeAI — AI-Powered Resume Analyzer (MERN Stack)

A complete, production-ready SaaS application that analyzes PDF resumes using rule-based scoring + optional Hugging Face AI feedback. Built with MongoDB, Express.js, React.js, and Node.js.

---

## 📁 Project Structure

```
resume-analyzer/
├── backend/
│   ├── config/
│   │   └── aiAnalysisService.js   # AI analysis engine (rules + HuggingFace)
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, profile
│   │   ├── resumeController.js    # Upload, list, get, delete resumes
│   │   └── analysisController.js  # Run AI analysis, fetch results, stats
│   ├── middleware/
│   │   ├── auth.js                # JWT verification middleware
│   │   ├── errorHandler.js        # Global error handler
│   │   └── upload.js              # Multer PDF upload config
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt hooks
│   │   ├── Resume.js              # Resume file metadata schema
│   │   └── Analysis.js            # AI analysis results schema
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── resume.js              # /api/resume/*
│   │   └── analysis.js            # /api/analysis/*
│   ├── uploads/                   # Local file storage (auto-created)
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── AppLayout.js       # Sidebar + navbar shell
    │   │   └── UI.js              # Button, Card, Badge, ScoreRing, etc.
    │   ├── context/
    │   │   └── AuthContext.js     # JWT auth state + axios config
    │   ├── pages/
    │   │   ├── LoginPage.js       # Login form
    │   │   ├── SignupPage.js      # Registration form
    │   │   ├── DashboardPage.js   # Home dashboard with stats
    │   │   ├── UploadPage.js      # Drag-and-drop PDF upload
    │   │   ├── ResultsPage.js     # Full AI analysis report
    │   │   └── HistoryPage.js     # Analysis history list
    │   ├── utils/
    │   │   └── api.js             # Axios API call helpers
    │   ├── App.js                 # Router + route guards
    │   └── index.js               # React entry point
    ├── .env.example
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/resumeanalyzer?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_32_char_minimum_string_here
JWT_EXPIRE=7d
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=ResumeAI
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MongoDB Atlas account (free tier) OR local MongoDB

### Step 1 — Clone and install

```bash
# Backend
cd resume-analyzer/backend
cp .env.example .env
# Edit .env with your values
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### Step 2 — Configure MongoDB

1. Go to https://cloud.mongodb.com
2. Create a free cluster (M0 Sandbox)
3. Create a database user under Security → Database Access
4. Allow all IPs under Security → Network Access (0.0.0.0/0)
5. Copy the connection string into `MONGODB_URI` in `backend/.env`

### Step 3 — Configure Hugging Face (optional, free)

1. Go to https://huggingface.co and create a free account
2. Go to Settings → Access Tokens → New Token (read)
3. Copy the token into `HUGGINGFACE_API_KEY` in `backend/.env`

> **Note:** The app works without a HuggingFace key — it uses a deterministic
> rule-based fallback for the qualitative feedback section. The numeric scoring
> is always rule-based and always available.

### Step 4 — Run

```bash
# Terminal 1: Backend
cd backend
npm run dev      # Uses nodemon for hot-reload

# Terminal 2: Frontend
cd frontend
npm start        # CRA dev server at http://localhost:3000
```

---

## 🌐 Deployment Guide (100% Free)

### Database — MongoDB Atlas (free tier)
Already set up in Step 2 above.

---

### Backend — Render.com (free tier)

1. Push your project to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add Environment Variables (from your .env):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `HUGGINGFACE_API_KEY`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-app.vercel.app`
   - `MAX_FILE_SIZE=5242880`
6. Click **Create Web Service**
7. Note your backend URL: `https://your-app.onrender.com`

> ⚠️ **File uploads on Render**: Render's free tier has an ephemeral filesystem,
> so uploaded files will be deleted on restart. For production, integrate
> Cloudinary (free tier) or Backblaze B2 for persistent file storage.
> The resume text is persisted in MongoDB so re-analysis still works.

---

### Frontend — Vercel (free tier)

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Settings:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add Environment Variables:
   - `REACT_APP_API_URL=https://your-app.onrender.com/api`
5. Click **Deploy**

---

### Fixing CORS after deployment

In `backend/.env` (on Render), update:
```env
FRONTEND_URL=https://your-app.vercel.app
```

The `corsOptions` in `server.js` reads this variable automatically.

---

### Connecting Frontend ↔ Backend

After both are deployed:
1. Copy your Render backend URL (e.g., `https://resume-api.onrender.com`)
2. In Vercel, set `REACT_APP_API_URL=https://resume-api.onrender.com/api`
3. Redeploy the frontend — it will now point to the production backend

---

## 🔒 Security Features

- Passwords hashed with bcrypt (12 salt rounds)
- JWT authentication with configurable expiry
- Rate limiting on all API routes (100/15min) and auth routes (10/15min)
- Helmet.js security headers
- CORS restricted to allowed origins
- File type validation (PDF only) + size limit (5MB)
- All resume routes require valid JWT
- User can only access their own resumes/analyses (enforced at DB query level)

---

## 🤖 AI Analysis Engine

### How scoring works

The rule-based engine (always available, no API needed) analyzes:

| Category | What's measured |
|----------|----------------|
| Formatting | Section presence, contact info, LinkedIn/GitHub |
| Keywords | Tech skills matched, power verbs, quantified achievements |
| Experience | Experience/projects sections, action verbs, metrics |
| Education | Education section, degree level, certifications |
| Skills | Technical skill count, soft skill count |

### Hugging Face integration (optional)

When `HUGGINGFACE_API_KEY` is set, the engine sends a prompt to:
- Model: `mistralai/Mistral-7B-Instruct-v0.1` (free inference API)
- Generates a 3-4 sentence qualitative paragraph

If the API key is missing or the call fails, a deterministic template-based
feedback paragraph is generated from the rule-based results.

---

## 📊 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login, get JWT |
| GET | /api/auth/me | ✅ | Get current user |
| PUT | /api/auth/update-profile | ✅ | Update name |
| POST | /api/resume/upload | ✅ | Upload PDF |
| GET | /api/resume | ✅ | List user's resumes |
| GET | /api/resume/:id | ✅ | Get single resume |
| DELETE | /api/resume/:id | ✅ | Delete resume |
| POST | /api/analysis/analyze/:resumeId | ✅ | Run AI analysis |
| GET | /api/analysis/:resumeId | ✅ | Get analysis result |
| GET | /api/analysis/history | ✅ | All analyses |
| GET | /api/analysis/stats | ✅ | Dashboard stats |
| GET | /health | ❌ | API health check |

---

## 🎨 UI Design System

| Token | Value |
|-------|-------|
| Primary | `#6C63FF` (violet) |
| Accent | `#00D4AA` (teal) |
| Background | `#0B0E1A` (deep navy) |
| Card | `#111627` |
| Display font | Syne (Google Fonts) |
| Body font | DM Sans (Google Fonts) |

---

## 📦 Key Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| express | HTTP server framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT creation & verification |
| multer | PDF file upload handling |
| pdf-parse | Extract text from PDF |
| axios | HTTP client for HuggingFace API |
| helmet | Security HTTP headers |
| cors | Cross-origin resource sharing |
| express-rate-limit | API rate limiting |
| morgan | HTTP request logger |

### Frontend
| Package | Purpose |
|---------|---------|
| react-router-dom | Client-side routing |
| axios | API HTTP client |
| react-dropzone | Drag-and-drop file upload |
| react-hot-toast | Toast notifications |

---

## 🔧 Troubleshooting

**PDF text extraction returns empty:**
- Ensure the PDF has selectable text (not a scanned/image-based PDF)
- Test with a text-based PDF generated from Word or Google Docs

**HuggingFace API timeout:**
- The free inference API can be slow on cold starts
- The app automatically falls back to template-based feedback
- Consider upgrading to HuggingFace Pro for guaranteed availability

**MongoDB connection fails:**
- Check your Atlas cluster is running and not paused
- Verify the connection string includes correct username/password
- Ensure 0.0.0.0/0 is in the IP allowlist

**CORS errors in production:**
- Set `FRONTEND_URL` to your exact Vercel deployment URL
- Redeploy the backend after changing env vars on Render

---

## 📝 License

MIT — free to use, modify, and deploy commercially.
