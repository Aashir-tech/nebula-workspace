# Nebula Backend

Backend API for Nebula Workspace application with MongoDB, JWT authentication, and real-time collaboration.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env` file and update with your values:
     - `MONGO_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `GEMINI_API_KEY`: Your Google Gemini API key
     - `FRONTEND_URL`: Frontend URL (default: http://localhost:5173)

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)

### Tasks
- `GET /api/tasks?workspaceId=xxx` - Get tasks for workspace
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Workspaces
- `GET /api/workspaces` - Get user's workspaces
- `POST /api/workspaces` - Create new workspace
- `POST /api/workspaces/join` - Join workspace via invite code

### AI (Rate limited: 50 requests / 15 minutes)
- `POST /api/ai/enhance` - Enhance text with AI
- `POST /api/ai/insights` - Generate productivity insights
- `POST /api/ai/standup` - Generate daily standup summary

## Features

✅ MongoDB data persistence
✅ JWT authentication & authorization
✅ Password hashing with bcrypt
✅ Gamification (streak tracking)
✅ Real-time collaboration (Socket.io)
✅ AI proxy for Gemini API
✅ Rate limiting on AI endpoints
✅ Security headers (Helmet)
✅ CORS configuration
✅ Error handling middleware

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcryptjs
- **Real-time:** Socket.io
- **AI:** Google Gemini API
- **Security:** Helmet, CORS, Rate Limiting
