# StreamVault

A full-stack video sharing platform built with React, Node.js, and MySQL. Upload, watch, comment, and subscribe — all in a clean dark UI.

Live demo users are seeded with `node seed.js` (password: `Password1`).

---

## What it does

- Register and log in with JWT authentication
- Upload videos with thumbnails and tags
- Watch videos with an HTML5 player
- Like, dislike, and comment on videos
- Subscribe to channels and get a personalized feed
- Search by title, description, or channel name
- Manage your uploads from a creator dashboard

---

## Tech

**Frontend** — React 18, Vite, TailwindCSS, Framer Motion, Axios, React Router 6

**Backend** — Node.js, Express, Sequelize ORM, Multer, bcryptjs, JWT

**Database** — MySQL 8.0

---

## Getting started

You need Node.js 18+, MySQL 8.0+, and npm installed.

### 1. Clone the repo

```bash
git clone https://github.com/ayusht28/streamvault.git
cd streamvault
```

### 2. Create the database

Open MySQL and run:

```sql
CREATE DATABASE streamvault;
```

### 3. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials and a JWT secret:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=streamvault
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

You should see `Database connected` and `Database synced` in the terminal. All tables are created automatically.

### 4. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Seed demo data (optional)

```bash
cd backend
node seed.js
```

This creates 5 users, 20 videos, comments, likes, and subscriptions. All demo accounts use `Password1` as the password.

| Email                 | Password  |
| --------------------- | --------- |
| alex@streamvault.io   | Password1 |
| jordan@streamvault.io | Password1 |
| miles@streamvault.io  | Password1 |
| sarah@streamvault.io  | Password1 |
| demo@streamvault.io   | Password1 |

---

## Project structure

```
streamvault/
├── backend/
│   ├── config/          # Sequelize database config
│   ├── controllers/     # Route logic (auth, videos, comments, subscriptions)
│   ├── middleware/       # JWT auth, Multer file uploads
│   ├── models/          # Sequelize models and associations
│   ├── routes/          # Express route definitions
│   ├── uploads/         # Local file storage (videos, thumbnails, avatars)
│   ├── seed.js          # Demo data seeder
│   └── server.js        # App entry point
│
├── frontend/
│   └── src/
│       ├── components/  # Navbar, Sidebar, VideoCard, CommentSection
│       ├── context/     # Auth context (global login state)
│       ├── hooks/       # useToast
│       ├── layouts/     # MainLayout (Navbar + Sidebar wrapper)
│       ├── pages/       # All page components
│       ├── services/    # Axios API calls
│       └── utils/       # Helper functions (formatViews, timeAgo, etc.)
│
├── schema.sql           # Raw MySQL table definitions
└── README.md
```

---

## API endpoints

### Auth

| Method | Endpoint                    | Protected | Description              |
| ------ | --------------------------- | --------- | ------------------------ |
| POST   | `/api/auth/register`        | No        | Create account           |
| POST   | `/api/auth/login`           | No        | Login, returns JWT       |
| GET    | `/api/auth/me`              | Yes       | Get logged in user       |
| PUT    | `/api/auth/profile`         | Yes       | Update profile or avatar |
| GET    | `/api/auth/channel/:userId` | No        | Get public channel info  |

### Videos

| Method | Endpoint                | Protected | Description                |
| ------ | ----------------------- | --------- | -------------------------- |
| GET    | `/api/videos`           | No        | Homepage feed              |
| GET    | `/api/videos/search?q=` | No        | Search videos              |
| GET    | `/api/videos/:id`       | No        | Single video + suggestions |
| GET    | `/api/videos/my`        | Yes       | Your uploaded videos       |
| POST   | `/api/videos/upload`    | Yes       | Upload video + thumbnail   |
| PUT    | `/api/videos/:id`       | Yes       | Edit title or description  |
| DELETE | `/api/videos/:id`       | Yes       | Delete your video          |
| POST   | `/api/videos/:id/like`  | Yes       | Like or dislike            |

### Comments

| Method | Endpoint                 | Protected | Description              |
| ------ | ------------------------ | --------- | ------------------------ |
| GET    | `/api/comments/:videoId` | No        | Get comments for a video |
| POST   | `/api/comments/:videoId` | Yes       | Add a comment            |
| DELETE | `/api/comments/:id`      | Yes       | Delete your comment      |

### Subscriptions

| Method | Endpoint                               | Protected | Description                     |
| ------ | -------------------------------------- | --------- | ------------------------------- |
| GET    | `/api/subscriptions`                   | Yes       | Your subscriptions              |
| GET    | `/api/subscriptions/feed`              | Yes       | Videos from subscribed channels |
| GET    | `/api/subscriptions/status/:channelId` | Yes       | Check subscription status       |
| POST   | `/api/subscriptions/:channelId`        | Yes       | Subscribe or unsubscribe        |

---

## Notes

**Passwords** are hashed with bcrypt. There is no way to recover a plain text password — only reset it.

**Uploaded files** are stored locally in `backend/uploads/`. For production, swap Multer disk storage for an S3 bucket using `multer-s3`.

**The `.env` file** must never be committed to Git. It is already in `.gitignore`.

**Tables** are created automatically when the backend starts using `sequelize.sync()`. You do not need to run `schema.sql` manually unless you prefer to set up the tables yourself.

---

## License

MIT
