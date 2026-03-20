# ⚡ StreamVault

> A production-quality, YouTube-style video platform built with React, Node.js, Express, and MySQL.  
> Premium **Obsidian Dark** UI — glassmorphism, Framer Motion animations, Syne typography.

---

## 📸 Feature Overview

| Feature | Details |
|---|---|
| 🔐 Auth | JWT register/login, bcrypt passwords, protected routes |
| 🎬 Upload | Drag-and-drop video + thumbnail, real-time progress bar |
| 📺 Watch | HTML5 video player, like/dislike, share, suggested videos |
| 💬 Comments | Live add/delete comments per video |
| 🔔 Subscriptions | Subscribe/unsubscribe, subscription feed |
| 🔍 Search | Full-text search by title, description, channel name |
| 📊 Dashboard | Creator stats (views/likes/comments), video management |
| 👤 Channels | Public channel pages with subscriber count |
| 📱 Responsive | Mobile-first, collapsible sidebar |

---

## 🛠 Tech Stack

```
Frontend          Backend           Database
─────────         ─────────         ─────────
React 18          Node.js           MySQL 8.0
Vite              Express.js        Sequelize ORM
TailwindCSS       JWT Auth
Framer Motion     Multer uploads
Axios             bcryptjs
React Router 6    uuid
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm 9+

### 2. Database Setup

```sql
CREATE DATABASE streamvault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the full schema:

```bash
mysql -u root -p < schema.sql
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=streamvault
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev    # starts on :5000 and auto-syncs MySQL tables
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev    # starts on :5173
```

### 5. All-in-one (from root)

```bash
npm install         # installs concurrently
npm run install:all # installs both backend + frontend
npm run dev         # runs both simultaneously
```

Open **http://localhost:5173** 🎉

---

## 📁 Project Structure

```
streamvault/
├── schema.sql                    # Raw MySQL DDL
├── package.json                  # Root (concurrently runner)
│
├── backend/
│   ├── server.js                 # Express app entry
│   ├── .env.example
│   ├── config/
│   │   └── database.js           # Sequelize pool config
│   ├── models/
│   │   ├── index.js              # Associations
│   │   ├── User.js
│   │   ├── Video.js
│   │   └── associations.js       # Comment, Like, Subscription
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── videoController.js
│   │   ├── commentController.js
│   │   └── subscriptionController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT authenticate + optionalAuth
│   │   └── upload.js             # Multer video/thumbnail/avatar
│   ├── routes/
│   │   ├── auth.js
│   │   ├── videos.js
│   │   └── index.js              # comments + subscriptions
│   └── uploads/
│       ├── videos/
│       ├── thumbnails/
│       └── avatars/
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx               # Router setup
        ├── main.jsx
        ├── index.css             # Design tokens, glass, shimmer
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js            # Axios + videoAPI/commentAPI/etc
        ├── utils/
        │   └── helpers.js        # formatViews, timeAgo, etc
        ├── layouts/
        │   └── MainLayout.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── VideoCard.jsx     # + VideoCardSkeleton
        │   ├── VideoGrid.jsx
        │   └── CommentSection.jsx
        └── pages/
            ├── HomePage.jsx
            ├── WatchPage.jsx
            ├── UploadPage.jsx
            ├── DashboardPage.jsx
            ├── SearchPage.jsx
            ├── ChannelPage.jsx
            ├── SubscriptionsPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            └── NotFoundPage.jsx
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile/avatar |
| GET | `/api/auth/channel/:userId` | ❌ | Get public channel |

### Videos
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/videos` | ❌ | Feed (`?sort=latest|trending|popular&page=1`) |
| GET | `/api/videos/search` | ❌ | Search (`?q=term`) |
| GET | `/api/videos/my` | ✅ | My uploaded videos |
| GET | `/api/videos/user/:userId` | ❌ | User's videos |
| GET | `/api/videos/:id` | Optional | Single video + suggested |
| POST | `/api/videos/upload` | ✅ | Upload (multipart: video + thumbnail) |
| PUT | `/api/videos/:id` | ✅ | Update title/description |
| DELETE | `/api/videos/:id` | ✅ | Delete video |
| POST | `/api/videos/:id/like` | ✅ | Toggle like/dislike |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/comments/:videoId` | ❌ | List comments |
| POST | `/api/comments/:videoId` | ✅ | Add comment |
| DELETE | `/api/comments/:id` | ✅ | Delete own comment |

### Subscriptions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subscriptions` | ✅ | My subscriptions |
| GET | `/api/subscriptions/feed` | ✅ | Videos from subscribed channels |
| GET | `/api/subscriptions/status/:channelId` | ✅ | Check if subscribed |
| POST | `/api/subscriptions/:channelId` | ✅ | Toggle subscribe |

---

## 🎨 Design System

**Palette**
- Background: `#03040a` → `#080c18` → `#0d1225`
- Accent: `#8b5cf6` (Violet) / `#6366f1` (Electric Indigo)
- Aurora: `#22d3ee` (Cyan)
- Text: `#f1f5f9` / `#94a3b8` / `#475569`

**Typography**
- Display: **Syne** (headings, labels)
- Body: **DM Sans** (paragraphs, UI text)
- Mono: **JetBrains Mono** (code, badges)

**Key effects**
- Glassmorphism: `backdrop-filter: blur(20px)` + semi-transparent borders
- Shimmer skeletons: CSS `background-size: 200%` gradient animation
- Card hovers: `scale(1.04)` thumbnail + shadow elevation
- Gradient text: `linear-gradient(135deg, violet → indigo → cyan)` with `background-clip: text`

---

## ☁️ Production Deployment

### Upgrade storage to AWS S3

In `middleware/upload.js`, swap `multer.diskStorage` for `multer-s3`:

```js
import multerS3 from 'multer-s3'
import { S3Client } from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: process.env.AWS_REGION })

storage: multerS3({
  s3,
  bucket: process.env.S3_BUCKET,
  key: (req, file, cb) => cb(null, `videos/${Date.now()}-${file.originalname}`)
})
```

### Environment Variables (production)

```env
NODE_ENV=production
DB_PASSWORD=<strong_password>
JWT_SECRET=<64_char_random_string>
FRONTEND_URL=https://yourdomain.com
```

### Use migrations instead of `sync({ alter: true })`

```bash
npx sequelize-cli db:migrate
```

---

## 📝 License

MIT — build freely, ship boldly.
