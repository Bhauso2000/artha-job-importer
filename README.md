# 📥 Artha Job Importer

A full-stack MERN-based job feed importer system using XML feeds, BullMQ queues, Redis, MongoDB, cron scheduling, and real-time updates with Socket.IO.

---

## 🚀 Features

* 🔄 **Cron Scheduler**: Fetches external job feeds (XML format) every hour.
* 📦 **BullMQ Queue**: Jobs are batched and pushed to Redis-backed queue.
* ⚙️ **Worker**: Listens to queue and inserts/updates jobs in MongoDB.
* 📊 **Logs**: Stores each import as a log in `ImportLog` collection.
* ⚡ **Socket.IO**: Emits real-time import status to the frontend.
* 🌐 **Frontend (Next.js)**: Displays import history live with WebSocket support.

---

## 📁 Folder Structure

```bash
.
├── crons/
│   └── cron.js           # Cron job that fetches and queues jobs
├── jobs/
│   ├── worker.js         # BullMQ worker to process job batches
│   └── queue.js          # BullMQ queue setup
├── model/
│   ├── Job.js            # Job schema
│   └── ImportLog.js      # Import log schema
├── server/
│   ├── app.js            # Express app config & routes
│   ├── server.js          # Main server startup with Socket.IO
│   ├── route/
│   │   └── history.js    # GET /api/history route
│   └── socket.js         # Socket.IO + Redis adapter setup
client/
├── .env                     # Environment variables
├── .env.example             # Sample environment config
├── .gitignore
├── README.md
├── next.config.ts           # Next.js config
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json

├── public/                  # Static assets (images, etc.)
│
├── lib/                     # Shared utilities
│   ├── api.ts               # Axios instance with base URL
│   └── socket.ts            # Socket.IO client setup
│
├── app/                     # Next.js 13+ App Directory
│   ├── layout.tsx           # App layout
│   ├── globals.css          # Global styles (Tailwind)
│   ├── page.tsx             # Default route (Home or redirect)
│   └── import-history/      # Import history route
│       └── page.tsx  
```

---

## 🛠️ Environment Configuration

### 🔧 `.env` (Backend)

```env
BATCH_SIZE=50
MAX_CONCURRENCY=5
REDIS_URL=redis://localhost:6379
PORT=8081
MONGO_URI=mongodb://localhost:27017/job_import
SOCKET_SERVER_URL=http://localhost:8081
```

### 🌐 `.env.local` (Frontend - Next.js)

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:8081
IMPORT_API_BASE_URL=http://localhost:8081
```

---

## 📦 Installation

```bash
# Install backend dependencies
npm install
```

---

## 🐳 Redis via Docker

```bash
docker run --name artha-redis -p 6379:6379 -d redis
```

---

## 🔁 Start All Backend Services

```bash
npm run dev:all
```

This runs:

* `dev`: Express API server
* `worker`: BullMQ worker (job processor)
* `cron`: XML job feed fetcher that runs every hour

---

## 🧑‍💻 Frontend Setup (Next.js)

```bash
# Navigate to frontend folder
cd client/my-app

# Install dependencies
npm install

# Create .env.local with:
# NEXT_PUBLIC_SOCKET_URL=http://localhost:8081
# IMPORT_API_BASE_URL=http://localhost:8081

# Run frontend
npm run dev
```

> The frontend connects to the Socket.IO backend and displays real-time job import status and logs.

---

## 📜 Scripts

| Command                      | Description                            |
| ---------------------------- | -------------------------------------- |
| `npm run dev`                | Start Express API server               |
| `npm run worker`             | Start BullMQ job processor             |
| `npm run cron`               | Start cron-based XML feed importer     |
| `npm run dev:all`            | Run API, worker, and cron concurrently |
| `npm run dev` (in `client/`) | Run frontend (Next.js) app             |

---

## 🔌 Real-Time Logs

* **Socket Event**: `import_status`
* Emitted from backend worker to Socket.IO server.
* Frontend subscribes to live updates and displays them instantly.

---

## 🧾 Example Log Object

```json
{
  "_id": "64e38c3d8c9e3f47f92f1db3",
  "timestamp": "2025-07-13T12:00:00Z",
  "sourceUrl": "https://jobicy.com/?feed=job_feed",
  "totalFetched": 50,
  "totalImported": 48,
  "newJobs": 45,
  "updatedJobs": 3,
  "failedJobs": [
    {
      "error": "Missing job ID",
      "data": { ... }
    }
  ]
}
```

---

## ✅ Tech Stack

* **Backend**: Node.js, Express, BullMQ, Redis, Mongoose, Socket.IO
* **Frontend**: Next.js, TailwindCSS
* **Database**: MongoDB
* **Queue**: Redis (Docker)
* **Realtime**: Socket.IO + Redis Pub/Sub

---

## 📄 License

MIT

---