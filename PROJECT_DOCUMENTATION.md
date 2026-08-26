# 📑 Real Talks — Comprehensive Full-Stack Project Documentation

---

## 📌 1. Project Overview & Executive Summary

**Real Talks** is a modern, enterprise-grade, full-stack real-time communication platform engineered using the **MERN stack** (MongoDB, Express.js, React 19, Node.js) and **Socket.IO**.

The platform provides sub-10ms bidirectional messaging, multi-user group channels with role-based admin governance, rich image sharing with an interactive lightbox viewer, automatic 24-hour database self-cleaning (TTL Index) to preserve cloud database free-tier limits, dual-layer authentication (HTTP-Only cookies + Bearer token fallback), and an emerald green theme with a 1-click **Light/Dark mode** switch.

---

## 🔗 2. Live Production Links & Repository

| Resource | URL | Description |
|---|---|---|
| 🌐 **Live Web Application (Frontend)** | [https://real-talks-eight.vercel.app](https://real-talks-eight.vercel.app) | Deployed on Vercel Edge CDN |
| ⚡ **Live WebSocket API (Backend)** | [https://real-talks-gwuw.onrender.com](https://real-talks-gwuw.onrender.com) | Deployed on Render (Node.js 24/7 Service) |
| 🩺 **Backend Health Endpoint** | [https://real-talks-gwuw.onrender.com/api/health](https://real-talks-gwuw.onrender.com/api/health) | Live JSON health check & socket monitor |
| 📦 **GitHub Source Repository** | [https://github.com/prathamshahi1/Real-Talks.git](https://github.com/prathamshahi1/Real-Talks.git) | Complete codebase, CI/CD, and docs |

---

## 🛠️ 3. Complete Tooling & Tech Stack Breakdown

### Frontend Technologies (Client)

| Tool / Library | Version | Purpose & Functionality in Real Talks |
|---|---|---|
| **React** | v19.2.8 | Core UI library for declarative component state and reactive rendering. |
| **Vite** | v8.2.2 | Next-generation frontend build tool and development server with instant HMR. |
| **Tailwind CSS** | v4.3.3 | Utility-first CSS framework styled with an Emerald & Mint custom palette. |
| **Socket.IO Client** | v4.8.3 | Client WebSocket library maintaining persistent TCP connection to the backend. |
| **Axios** | v1.20.0 | Promise-based HTTP client configured with credentials and Bearer token interceptors. |
| **React Router DOM** | v7.18.2 | Client-side routing with protected route guards (/chat, /login, /register). |
| **Lucide React** | v1.34.0 | Modern SVG icon set for clean and consistent UI iconography. |
| **Emoji Picker React** | v4.19.1 | Dynamic theme-aware emoji picker for the chat composer. |
| **Google Fonts** | Outfit & Plus Jakarta Sans | Typography providing clean aesthetics. |

### Backend Technologies (Server)

| Tool / Library | Version | Purpose & Functionality in Real Talks |
|---|---|---|
| **Node.js** | v20+ | JavaScript runtime environment executing backend services. |
| **Express.js** | v4.19.2 | Backend HTTP server framework handling REST endpoints and middlewares. |
| **Socket.IO Server** | v4.7.5 | WebSocket server managing rooms, socket IDs, fan-out broadcasts, and heartbeats. |
| **MongoDB Atlas** | M0 Cloud | Cloud NoSQL database storing user profiles, conversations, and messages. |
| **Mongoose** | v8.3.4 | Object Data Modeling (ODM) library managing database schemas and indexes. |
| **JSON Web Token (JWT)** | v9.0.2 | Cryptographic token generator for secure, stateless session authentication. |
| **Bcrypt.js** | v2.4.3 | One-way password hashing algorithm with automated salting. |
| **Cookie-Parser** | v1.4.6 | Middleware parsing HTTP-Only cookie headers from incoming requests. |
| **Multer** | v1.4.5 | Multipart form-data handling middleware validating and streaming image uploads. |
| **Cloudinary SDK** | v2.1.0 | Cloud media CDN SDK uploading, optimizing, and serving shared images. |
| **Express Rate Limit** | v7.2.0 | Security middleware mitigating brute-force and DDoS attempts (500 req/15 min). |
| **Validator** | v13.12.0 | String sanitization and format validation for emails and usernames. |
| **Dotenv** | v16.4.5 | Environment variable loader isolating secrets from source code. |
| **Nodemon** | v3.1.0 | Development monitor automatically restarting the server on file edits. |

### Cloud & DevOps Infrastructure

| Platform | Role in Project |
|---|---|
| **Vercel** | Hosts the React frontend on global edge CDN with SPA routing rewrites. |
| **Render** | Hosts the persistent Node.js + Express backend service keeping WebSockets alive 24/7. |
| **MongoDB Atlas** | Cloud database cluster hosting document collections with automated TTL pruning. |
| **DiceBear API** | Cloud avatar generator creating bot and identicon avatars based on user/group seeds. |
| **GitHub** | Version control system managing Git history and automated deployments. |

---

## 🎯 4. Key Features Deep-Dive

### A. 24-Hour Auto-Delete Messages (Free-Tier Protection)
- **Problem**: Free MongoDB Atlas clusters provide 512MB storage. Storing endless messages would eventually crash the database.
- **Solution**: Implemented MongoDB native **TTL (Time-To-Live) Index** on `createdAt` with `expireAfterSeconds: 86400`.
- **How it works**: MongoDB runs a lightweight internal C++ background thread every 60 seconds that deletes messages older than 24 hours. This requires **0% server CPU overhead and zero cron jobs**.

### B. Dual-Layer Authentication Architecture
- **Problem**: Cross-domain deployments (Vercel on `vercel.app` vs Render on `onrender.com`) often face issues with third-party cookie restrictions in Safari / Brave.
- **Solution**:
  1. **Layer 1**: Sets an HTTP-Only cookie with `sameSite: 'none'` and `secure: true`.
  2. **Layer 2**: Returns the JWT token in the JSON response body. Axios stores it in `localStorage` and automatically attaches `Authorization: Bearer <token>` on every request via an interceptor.
  3. **Backend Middleware**: Checks `req.cookies.token` first, then seamlessly falls back to `req.headers.authorization`.

### C. Real-Time Group Channels & Admin Governance
- Users can create named channels, generate custom identicon avatars with 1-click, and select participants.
- Admins can add members, remove members, and promote other users to admin.
- If a sole admin leaves the group, the server automatically promotes the next remaining member to admin to prevent abandoned/unmoderated channels.

### D. Media & Image Sharing with Lightbox Zoom
- Users can attach images up to 5MB (PNG, JPEG, WebP, GIF).
- Pre-send preview modal allows users to review the image, inspect file size, and attach an optional text caption.
- Tapping on any sent image opens the fullscreen **Image Lightbox Modal** with high-res zoom and direct download controls.

### E. Theme Customization & Light/Dark Mode
- Styled with a fresh **Emerald Green & Mint** design system.
- Includes a dedicated **Light / Dark Mode Toggle button (☀️ / 🌙)** in the top navigation bar.
- Uses Tailwind CSS v4 custom variant `@custom-variant dark (&:where(.dark, .dark *));` with persistent localStorage synchronization.

---

## 📡 5. Complete REST API Reference

| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/auth/register` | Register new account and issue auth token | Public |
| **POST** | `/api/auth/login` | Authenticate with username/email and password | Public |
| **POST** | `/api/auth/logout` | Invalidate session and update offline timestamp | Private |
| **GET** | `/api/auth/me` | Fetch current authenticated user session | Private |
| **GET** | `/api/users/search?q=...` | Debounced user search matching name/username | Private |
| **PUT** | `/api/users/profile` | Update user name, bio, and avatar | Private |
| **PUT** | `/api/users/password` | Update password with current password check | Private |
| **PUT** | `/api/users/privacy` | Update privacy settings (last seen, online status) | Private |
| **GET** | `/api/conversations` | Fetch all conversations sorted by latest activity | Private |
| **POST** | `/api/conversations/private` | Get existing or create new 1-on-1 private chat | Private |
| **DELETE** | `/api/conversations/:id` | Delete conversation and purge all its messages | Private |
| **GET** | `/api/messages/:conversationId` | Fetch message history for a conversation | Private |
| **POST** | `/api/messages` | Send new text message or image attachment | Private |
| **PUT** | `/api/messages/:id` | Edit an existing text message | Private |
| **DELETE** | `/api/messages/:id` | Soft-delete a message | Private |
| **POST** | `/api/messages/:conversationId/read` | Mark all unread messages as read | Private |
| **POST** | `/api/upload/image` | Upload image to Cloudinary / static server | Private |
| **POST** | `/api/groups` | Create a new group channel | Private |
| **GET** | `/api/groups/:id` | Get full group metadata and roster | Private |
| **POST** | `/api/groups/:id/members` | Add members to group (Admin only) | Private |
| **DELETE** | `/api/groups/:id/members/:memberId` | Remove member from group (Admin only) | Private |
| **POST** | `/api/groups/:id/admins/:memberId` | Promote member to group admin (Admin only) | Private |
| **POST** | `/api/groups/:id/leave` | Leave a group channel | Private |

---

## ⚡ 6. Socket.IO Real-Time Event Catalog

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join_conversation` | Client ➔ Server | `conversationId` | Joins the client's socket to the conversation room. |
| `leave_conversation` | Client ➔ Server | `conversationId` | Leaves the socket room. |
| `send_message` | Client ➔ Server | `Message Object` | Broadcasts a newly saved message to all participants in the room. |
| `receive_message` | Server ➔ Client | `Message Object` | Delivers an incoming message to all clients in the room in real-time. |
| `typing_start` | Client ➔ Server | `{ conversationId, username, userId }` | Broadcasts live typing state to other members in the room. |
| `typing_stop` | Client ➔ Server | `{ conversationId, username, userId }` | Broadcasts typing stop state. |
| `mark_read` | Client ➔ Server | `{ conversationId, readerId }` | Broadcasts read receipt updates. |
| `message_read` | Server ➔ Client | `{ conversationId, readerId }` | Updates blue double checkmarks live. |
| `edit_message` | Client ➔ Server | `Updated Message Object` | Emits edited text to room. |
| `message_edited` | Server ➔ Client | `Updated Message Object` | Re-renders edited message in real-time. |
| `delete_message` | Client ➔ Server | `{ conversationId, messageId }` | Emits soft-delete instruction. |
| `message_deleted` | Server ➔ Client | `{ conversationId, messageId }` | Shows "This message was deleted". |
| `delete_conversation` | Client ➔ Server | `{ conversationId }` | Emits thread deletion signal. |
| `conversation_deleted` | Server ➔ Client | `{ conversationId }` | Removes conversation from participants' sidebars. |
| `get_online_users` | Server ➔ Client | `Array of User IDs` | Emits the complete list of active online user IDs. |
| `user_online` | Server ➔ Client | `{ userId }` | Broadcasts when a user opens the app. |
| `user_offline` | Server ➔ Client | `{ userId }` | Broadcasts when a user disconnects. |

---

## 🎓 7. Technical Interview & Portfolio Questions

1. **Why did you choose Socket.IO over traditional REST polling or Server-Sent Events (SSE)?**
   > *REST polling creates continuous HTTP handshakes that flood the server with empty requests, driving up latency and server costs. Server-Sent Events (SSE) are strictly unidirectional (server-to-client only). Socket.IO establishes a single persistent bidirectional TCP connection, enabling sub-10ms delivery with automatic heartbeats, fallback to long-polling, and room multiplexing.*

2. **How does MongoDB's 24-hour TTL index function without impacting database performance?**
   > *MongoDB builds a specialized B-tree index on the `createdAt` timestamp field. An internal background monitor runs once every 60 seconds, scans the index, and directly removes expired documents. This eliminates the need for Node.js cron workers or timers that can crash or leak memory.*

3. **How did you overcome cross-origin cookie restrictions between Vercel and Render?**
   > *Because Vercel (`vercel.app`) and Render (`onrender.com`) are distinct domains, browsers enforce strict third-party cookie blocking. We implemented a resilient dual-layer authentication strategy: setting cookies with `sameSite: "none"` and `secure: true` combined with an Axios request interceptor that injects the JWT in the `Authorization: Bearer <token>` header. The backend middleware checks both sources.*

---

## 📜 8. Authors & Credits

- **Developer**: Pratham Kumar Shahi ([@prathamshahi1](https://github.com/prathamshahi1))
- **Project Name**: Real Talks
- **Repository**: [https://github.com/prathamshahi1/Real-Talks](https://github.com/prathamshahi1/Real-Talks)
- **License**: MIT License
