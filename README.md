# 📊 Creator Dashboard

A comprehensive web application that allows content creators to manage their profile, earn credits, and interact with content through a personalized feed.

## 🚀 Features

- **🔐 User Authentication**
  - Register/Login with JWT
  - Role-based access (User, Admin)

- **💳 Credit Points System**
  - Earn points for logging in daily, completing profile, and interacting with feed
  - Track credits on dashboard
  - Admin panel to view/update user credit balances

- **📰 Feed Aggregator**
  - Fetches posts from Twitter and Reddit
  - Displays them in a scrollable feed
  - Users can save, share, and report posts

- **📈 Dashboard**
  - Users see credit stats, saved feeds, and recent activity
  - Admin sees user analytics and feed activity

##  🧰 Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide React (for icons)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose

##  🛠️ Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB Atlas account (or local MongoDB setup)

### 🛠️ Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/creator-dashboard.git
cd creator-dashboard
```

2. Setup the server
```bash
cd server
npm install
# Update the .env file with your MongoDB URI and JWT secret
```

3. Setup the client
```bash
cd ../client
npm install
```

### Running the Application

1. Start the server
```bash
cd server
npm run dev
```

2. Start the client in a new terminal
```bash
cd client
npm run dev
```

3. Access the application at `http://localhost:5173`

## ☁️ Demo User Accounts

- **Admin Account**
  - Email: admin@example.com
  - Password: admin123

- **User Account**
  - Email: user@example.com
  - Password: user123

## Project Structure

```
creator-dashboard/
├── client/               # Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── main.tsx      # Entry point
│   ├── index.html
│   └── package.json
│
└── server/               # Backend
    ├── src/
    │   ├── controllers/  # API controllers
    │   ├── middleware/   # Express middleware
    │   ├── models/       # Mongoose models
    │   ├── routes/       # API routes
    │   └── index.js      # Entry point
    ├── .env
    └── package.json
```

## Features in Detail

### User Authentication
- Secure JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Daily login rewards

### Credit System
- Credits awarded for:
  - Daily logins (5 credits)
  - Profile completion (50 credits)
  - Content interactions (2 credits)
- Admin can adjust user credits

### Content Feed
- Aggregated content from multiple sources
- Filter by platform
- Infinite scroll loading
- Interactive actions (save, share, report)

### User Dashboard
- Credit statistics and history
- Recent activity log
- Saved content management
- Profile completion tracking

### Admin Features
- User management
- Credit transaction history
- User activity monitoring
- Content moderation tools

## 📄 License

This project is for educational purposes. All APIs and external content are used under respective fair use/public terms.

## 👤 Author

- Name: Prateek Chandra
- Project: Assignment 1 – Creator Dashboard
