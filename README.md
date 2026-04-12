# Resume Analyzer

Resume Analyzer is a full-stack web application for uploading resumes, extracting content from PDF files, and running an AI-based review to help users understand strengths, gaps, and improvement opportunities.

The project is split into two parts:

- `backend/` — Node.js, Express, MongoDB API for authentication, resume upload, storage, and analysis
- `frontend/` — React single-page application for the user interface, navigation, and results screens

## What the app does

- Lets users sign up, log in, and manage a session
- Accepts resume uploads through the UI
- Stores resume data and analysis history in MongoDB
- Sends resume content to an AI analysis service for feedback
- Shows dashboards, upload flow, analysis results, and past history

## Main Features

- Authentication with protected routes
- Resume upload and file handling
- AI resume analysis and result viewing
- Analysis history and dashboard stats
- Toast notifications and client-side routing

## Project Structure

```text
backend/
  config/            AI analysis service integration
  controllers/       Request handlers for auth, resume, and analysis
  middleware/        Auth, upload, and error handling middleware
  models/            MongoDB models for users, resumes, and analysis
  routes/            API route definitions
  server.js          Express app entry point

frontend/
  src/
    components/      Shared layout and UI pieces
    context/         Authentication state management
    pages/           Login, signup, dashboard, upload, results, history
    utils/           API helper functions
```

## Tech Stack

- Frontend: React, React Router, Axios, React Hot Toast
- Backend: Node.js, Express, MongoDB, Mongoose
- Security and utilities: Helmet, CORS, rate limiting, bcryptjs, JWT, Multer, pdf-parse

## Requirements

- Node.js 18+ recommended
- MongoDB connection string
- An AI service key for resume analysis

## Environment Variables

Create a `.env` file in `backend/` with the following values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
HUGGINGFACE_API_KEY=your_ai_service_key
MAX_FILE_SIZE=26214400
```

For the frontend, you can optionally set:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Installation

Install dependencies separately for each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running Locally

Open two terminals and run both apps:

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

The frontend runs on `http://localhost:3000` and the backend runs on `http://localhost:5000` by default.

## Available Scripts

Backend:

- `npm run dev` - start the API with nodemon
- `npm start` - start the API with Node.js

Frontend:

- `npm start` - start the React development server
- `npm run build` - create a production build
- `npm test` - run the test runner

## Core Pages and Components

- `LoginPage` and `SignupPage` for authentication
- `DashboardPage` for summary views and quick actions
- `UploadPage` for submitting resumes
- `ResultsPage` for analysis output
- `HistoryPage` for previous uploads and reviews
- `AppLayout` for the protected app shell and navigation
- `AuthContext` for auth state across the frontend

## API Areas

- Authentication routes for sign up, login, and current user info
- Resume routes for upload, listing, retrieval, and deletion
- Analysis routes for running analysis, viewing results, history, and stats

## Notes

- Uploaded files are served from the backend `uploads/` folder.
- The app is configured to allow the local frontend during development and the deployed frontend URL listed in the backend CORS settings.
- Do not commit secrets or production credentials to the repository.
