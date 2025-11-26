# Nebula - AI-Powered Task Management System

> **A modern, intelligent task management application with real-time collaboration, AI assistance, and smart notifications.**

Nebula is a full-stack task management system built with React, TypeScript, and Node.js, featuring AI-powered text enhancement, real-time WebSocket collaboration, workspace management, and comprehensive reminder notifications.

---

## 🌟 Features

### ✅ Core Task Management
- **Smart Task Creation** with voice input support
- **Multiple View Modes**: List, Kanban Board, Calendar
- **Drag-and-Drop** task organization
- **Rich Task Editor** with block-based content
- **Priority Levels** (P1-P4) with color coding
- **Custom Labels** for categorization
- **Subtasks** with progress tracking

### 🔔 Smart Reminders & Notifications
- **Real-Time Countdown Timer** - Global notifications show when reminders approach (within 5 minutes)
- **Browser Notifications** - System notifications for important reminders
- **Flexible Reminder Options**:
  - Quick select: 15min, 30min, 1 hour, 2 hours
  - Custom date + time picker with modern UI
- **Visual Indicators** - Bell icons in task cards with relative time display ("in 2h", "tomorrow")

### 👥 Workspace Collaboration
- **Personal & Team Workspaces**
- **Invitation System** - Email-based member invitations with accept/reject flow
- **Notification Panel** - Real-time workspace invite notifications
- **Member Management** - View, invite, and manage team members
- **Leave Workspace** - Members can voluntarily leave teams (with confirmation modal)
- **Task Assignment** - Assign tasks to team members

### 🤖 AI Integration
- **Text Enhancement** - AI-powered text refinement and improvement
- **Voice Input** - Speech-to-text for hands-free task creation

### 📊 Advanced Features
- **Real-Time Sync** - WebSocket integration for live updates
- **Task Comments** - Threaded discussions on tasks
- **Dark Mode** - Beautiful dark theme support
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Task Duplication** - Quick task cloning
- **Archive** - Archive completed tasks

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

**1. Clone the repository**
```bash
git clone <repository-url>
cd nebula
```

**2. Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd nebula-backend
npm install
```

**3. Environment Setup**

Create `.env` file in `nebula-backend/`:
```env
MONGODB_URI=mongodb://localhost:27017/nebula
JWT_SECRET=your_jwt_secret_here
PORT=5001
GEMINI_API_KEY=your_gemini_api_key  # For AI features
```

**4. Start the Application**

```bash
# Terminal 1 - Backend
cd nebula-backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Access the app at `http://localhost:5173`

---

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **@dnd-kit** for drag-and-drop
- **WebSocket** for real-time updates

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Socket.io** for WebSockets
- **Google Gemini AI** integration

### Key Components
```
├── components/
│   ├── Dashboard.tsx           # Main app layout
│   ├── TaskCard.tsx            # Task display with reminder indicator
│   ├── InlineTaskInput.tsx     # Quick task creation
│   ├── ReminderNotifications.tsx # Global reminder system
│   ├── ReminderPicker.tsx       # Modern date/time picker
│   ├── NotificationPanel.tsx    # Workspace invitations
│   ├── InviteModal.tsx         # Member invitation
│   └── LeaveWorkspaceModal.tsx  # Workspace exit confirmation
├── context/
│   ├── StoreContext.tsx        # Global state management
│   └── WebSocketContext.tsx    # Real-time connection
└── services/
    └── api.ts                  # API client
```

---

## 📱 Usage

### Creating Tasks
1. Click "+ Add Task" or press keyboard shortcut
2. Enter task title
3. Add optional details:
   - Due date
   - Priority level
   - Labels
   - Subtasks
   - Reminders
4. Click "Add Task" or press Enter

### Setting Reminders
1. Click the reminder icon while creating/editing a task
2. Choose quick option (15min, 30min, 1h, 2h) OR
3. Select "Custom" for specific date and time
4. Receive countdown notifications when reminder approaches
5. Get browser notifications at reminder time

### Managing Workspaces
1. **Create**: Click "+ New Workspace" (Personal or Team)
2. **Invite Members**: Click team icon → Enter email → Send
3. **Accept Invitations**: Check notification bell → Accept/Reject
4. **Leave**: Click "Leave" button (non-owners only)

---

## 🔮 Future Improvements

### High Priority
- [ ] **Recurring Tasks** - Support for daily/weekly/monthly task repetition
- [ ] **Calendar Integration** - Sync with Google Calendar, Outlook
- [ ] **File Attachments** - Upload and attach files to tasks
- [ ] **Advanced Filters** - Filter by multiple criteria (priority + label + assignee)
- [ ] **Task Dependencies** - Block tasks until prerequisites complete

### AI & Automation
- [ ] **Smart Task Suggestions** - AI recommends tasks based on patterns
- [ ] **Auto-Prioritization** - AI suggests priority based on deadlines and content
- [ ] **Natural Language Input** - "Remind me tomorrow at 3pm to call John"
- [ ] **Smart Scheduling** - AI finds optimal times for tasks

### Collaboration
- [ ] **Real-Time Editing** - Collaborative task editing like Google Docs
- [ ] **Activity Feed** - Timeline of all workspace changes
- [ ] **@Mentions** - Tag team members in comments
- [ ] **Role-Based Permissions** - Admin, Member, Viewer roles
- [ ] **Workspace Templates** - Pre-built structures for common workflows

### Integrations
- [ ] **Slack Integration** - Task notifications in Slack
- [ ] **GitHub Integration** - Link tasks to issues/PRs
- [ ] **Time Tracking** - Pomodoro timer and time logs
- [ ] **APIs** - REST API for third-party integrations

### UX Enhancements
- [ ] **Keyboard Shortcuts** - Complete shortcut system
- [ ] **Offline Mode** - Work without internet, sync when online
- [ ] **Mobile App** - Native iOS and Android apps
- [ ] **Email Reminders** - Send reminders via email
- [ ] **Custom Themes** - User-customizable color schemes
- [ ] **Task Templates** - Reusable task structures

### Analytics & Insights
- [ ] **Productivity Dashboard** - Charts and metrics
- [ ] **Time Reports** - How long tasks take to complete
- [ ] **Team Analytics** - Member productivity and workload
- [ ] **Burndown Charts** - Track project progress

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the MIT License.

---

## 🎯 Project Status

**Current Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** November 2025

---

**Built with ❤️ using React, TypeScript, and Node.js**
