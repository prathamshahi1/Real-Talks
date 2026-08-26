# 💬 Real Talks — Full-Stack Real-Time Chat Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19+-61DAFB.svg)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.7+-black.svg)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4+-38B2AC.svg)](https://tailwindcss.com)

**Real Talks** is an enterprise-grade, high-performance, real-time communication platform built on the **MERN Stack** (MongoDB, Express.js, React, Node.js) and **Socket.IO**. It offers instantaneous sub-10ms WebSocket message delivery, multi-user group channels, full lightbox image sharing, 24-hour self-cleaning auto-delete messages (free tier cloud protection), and a vibrant emerald green theme with working light/dark mode toggles.

---

## 🌟 Core Features

- ⚡ **Instant Real-Time Messaging**: Bidirectional WebSocket communication via Socket.IO with rooms, multiplexed channels, and live delivery receipts.
- 👥 **Group Channels & Admin Controls**: Create custom channels with dynamic DiceBear identicons, assign group admins, add/kick members, and maintain admin succession.
- 🖼️ **Media & Image Sharing**: Integrated Multer + Cloudinary pipeline with 5MB validation, image preview with captioning, and full-screen lightbox zoom & download.
- 🔥 **24-Hour TTL Auto-Delete (Free Tier Protection)**: MongoDB native TTL index (`expireAfterSeconds: 86400`) purges expired chats automatically every 60s without CPU overhead.
- 🟢 **Live Multi-Tab Presence & Typing**: Multi-tab active tracking, real-time online status indicators, and live debounced typing indicators.
- 🎨 **Vibrant Emerald Green Design & Dark/Light Mode**: Styled with Tailwind CSS v4, Google Fonts Outfit & Plus Jakarta Sans, frosted glass cards, and instant 1-click theme switching.
- 🔒 **Secure Authentication**: Bcrypt password hashing, JWT authentication stored in secure `HTTP-Only` cookies, rate limiting, and input sanitization.
- 🗑️ **Manual Chat Deletion**: Clear conversation history and delete threads on-demand with instant real-time synchronization.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Custom Emerald Green & Mint theme)
- **Icons**: Lucide React
- **HTTP Client**: Axios (with credentials)
- **Real-Time Client**: Socket.IO Client
- **Emoji Picker**: `emoji-picker-react`

### Backend (Server)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Real-Time Server**: Socket.IO Server
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) + Bcrypt.js + `cookie-parser`
- **File Storage**: Multer + Cloudinary SDK (with local disk fallback)
- **Security**: Express Rate Limit + CORS whitelist

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/prathamshahi1/Real-Talks.git
cd Real-Talks
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5050
NODE_ENV=development
CLIENT_URL=http://localhost:5174
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=demo_cloud
CLOUDINARY_API_KEY=demo_key
CLOUDINARY_API_SECRET=demo_secret
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5050/api
VITE_SOCKET_URL=http://localhost:5050
```

Start the frontend:
```bash
npm run dev
```

Visit **`http://localhost:5174`** in your browser!

---

## 🌐 Production Deployment Guide

### A. Deploy Backend (Render / Railway)
> *Note: Socket.IO requires a stateful Node.js host (like Render, Railway, or Koyeb) rather than serverless functions to maintain persistent WebSocket connections.*

1. Go to [Render.com](https://render.com) and click **New ➔ Web Service**.
2. Connect your GitHub repository `Real-Talks`.
3. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: `your_mongodb_atlas_uri`
   - `JWT_SECRET`: `your_random_secret`
   - `CLIENT_URL`: `https://your-app.vercel.app` (your Vercel frontend URL)
5. Click **Deploy**. Copy your backend URL (e.g. `https://real-talks-api.onrender.com`).

---

### B. Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New ➔ Project**.
2. Import `Real-Talks` from your GitHub.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-backend.onrender.com`
5. Click **Deploy**!

---

## 📜 License
This project is open-source and licensed under the [MIT License](LICENSE).
