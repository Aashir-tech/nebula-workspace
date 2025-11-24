# Nebula Workspace

A next-generation, AI-powered collaborative workspace with fluid UI, real-time collaboration, and intelligent task management.

## ✨ Features

### 🎯 Core Features
- **Multi-View Task Management**: Kanban Board, List View, Grid Gallery, and Bento Dashboard
- **Rich Content Blocks**: Text, code snippets, images, and more
- **Real-time Collaboration**: WebSocket-powered live updates
- **AI Enhancement**: Gemini-powered text improvement and task insights
- **Voice Commands**: Create tasks using voice input

### 🏆 Gamification
- **Daily Streaks**: Track consecutive days of task completion
- **Team Leaderboard**: Compete with teammates (podium-style visualization)
- **Achievement System**: Earn badges and points

### 🔐 Authentication
- **Traditional Auth**: Email/password login with JWT
- **Google OAuth**: One-click login with Google account
- **Secure Sessions**: Token-based authentication with automatic refresh

### 🎨 UI/UX
- **Modern Glassmorphism**: Sleek, translucent design elements
- **Dark Mode**: Eye-friendly dark theme
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Motion-powered transitions
- **Custom Fonts**: Outfit & Space Grotesk for unique aesthetics

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Lightning-fast build tool
- **Motion/Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js** + Express
- **MongoDB** + Mongoose
- **Socket.io** - Real-time updates
- **Passport.js** - OAuth authentication
- **Google Gemini AI** - AI-powered features
- **JWT** - Secure authentication

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Cloud Console account (for OAuth and AI)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd antigravity-workspace

# Install frontend dependencies
npm install

# Install backend dependencies
cd nebula-backend
npm install
```

### 2. Backend Setup

#### Create `.env` file in `nebula-backend/`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nebula
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nebula

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Google AI (Get from https://ai.google.dev/)
GOOGLE_API_KEY=your-google-gemini-api-key

# Google OAuth (Get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Get Google Credentials

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret

**Google Gemini API:**
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Get API key
3. Add to `.env` as `GOOGLE_API_KEY`

#### Start Backend

```bash
cd nebula-backend
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

#### Start Frontend

```bash
# From project root
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Access the App

Open `http://localhost:5173` in your browser and create an account!

---

## 📦 Deployment

### Deploy Backend (Railway/Render)

#### Railway (Recommended)
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway init`
4. Add MongoDB: `railway add mongodb`
5. Set environment variables in Railway dashboard
6. Deploy:
   ```bash
   cd nebula-backend
   railway up
   ```

#### Render
1. Create account at [render.com](https://render.com)
2. Click "New Web Service"
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `cd nebula-backend && npm install && npm run build`
   - **Start Command**: `cd nebula-backend && npm start`
   - **Root Directory**: `/`
5. Add environment variables
6. Deploy

### Deploy Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. From project root:
   ```bash
   vercel
   ```
3. Follow prompts
4. Add environment variable in Vercel dashboard:
   - `VITE_API_URL=<your-backend-url>`

#### Alternative: Netlify
1. Create `netlify.toml` in root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
2. Deploy:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Environment Variables for Production

**Backend (.env):**
```env
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-secret-key>
GOOGLE_API_KEY=<your-api-key>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=https://your-backend.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend.com
```

**Frontend:**
- Update `GOOGLE_CALLBACK_URL` in Google Cloud Console
- Update `Auth.tsx` line 36-38 to use production backend URL

---

## 🐛 Troubleshooting

### Backend won't start
- **Error: OAuth2Strategy requires a clientID**
  - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`
  - Or comment out Google OAuth routes if not using

### MongoDB connection failed
- Ensure MongoDB is running locally: `mongod`
- Or use MongoDB Atlas and update connection string

### Google AI quota exceeded
- Error 429 means free tier limit reached
- Wait for quota reset or upgrade plan at [ai.google.dev/usage](https://ai.google.dev/usage)

### Streak not incrementing
- Check backend logs for "Updating streak for user"
- Ensure tasks are being marked as DONE
- Verify server timezone is correct

### OAuth redirect not working
- Verify callback URL matches Google Console
- Check CORS settings in backend
- Ensure `FRONTEND_URL` is correct in `.env`

---

## 📁 Project Structure

```
antigravity-workspace/
├── components/          # React components
│   ├── Auth.tsx        # Authentication page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Leaderboard.tsx # Team leaderboard
│   ├── TaskCard.tsx    # Task component
│   └── ...
├── context/            # React Context
│   └── StoreContext.tsx
├── services/           # API clients
│   ├── api.ts
│   └── geminiService.ts
├── nebula-backend/     # Backend server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   └── middleware/   # Auth, error handling
│   └── package.json
└── package.json        # Frontend dependencies
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Google Gemini AI for intelligent features
- MongoDB for data persistence
- Vercel & Railway for easy deployments

---

**Built with ❤️ using React, Node.js, and AI**
