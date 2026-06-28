# Job Application Backend

Express + MongoDB REST API for the job application form.

---

## Project Structure

```
backend/
├── config/
│   └── db.js               # MongoDB connection
├── middleware/
│   └── validate.js         # express-validator rules
├── models/
│   └── JobApplication.js   # Mongoose schema
├── routes/
│   └── applications.js     # All API routes
├── .env                    # Environment variables (don't commit)
├── .env.example            # Safe template to commit
├── .gitignore
├── package.json
└── server.js               # Entry point
```

---

## Setup & Run

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Make sure MongoDB is running
Open **MongoDB Compass** → connect to `mongodb://localhost:27017`
No extra setup needed — the database `job_applications` is created automatically.

### 3. Start the backend
```bash
# Development (auto-restarts on file change)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

### 4. Update your React frontend
- Replace your `job.jsx` with the new `job.jsx` provided
- Add the error styles from `job-errors.css` to the bottom of your `job.css`

### 5. Run both together
Open two terminals:
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd your-vite-app && npm run dev
```

---

## API Endpoints

| Method | Endpoint                          | Description                |
|--------|-----------------------------------|----------------------------|
| POST   | `/api/applications`               | Submit new application     |
| GET    | `/api/applications`               | Get all applications       |
| GET    | `/api/applications/:id`           | Get single application     |
| PATCH  | `/api/applications/:id/status`    | Update status              |
| DELETE | `/api/applications/:id`           | Delete application         |
| GET    | `/api/health`                     | Health check               |

---

## Query Parameters (GET /api/applications)

| Param        | Example             | Description                     |
|--------------|---------------------|---------------------------------|
| `page`       | `?page=2`           | Page number (default: 1)        |
| `limit`      | `?limit=20`         | Results per page (default: 10)  |
| `status`     | `?status=pending`   | Filter by status                |
| `experience` | `?experience=5%2B`  | Filter by experience            |
| `position`   | `?position=engineer`| Filter by position (partial)    |
| `search`     | `?search=john`      | Search name, email, position    |

---

## Application Status Flow

```
pending → reviewing → accepted
                    → rejected
```

Update via: `PATCH /api/applications/:id/status`
```json
{ "status": "reviewing" }
```

---

## Viewing Data in MongoDB Compass

1. Open Compass → connect to `mongodb://localhost:27017`
2. Click database **job_applications**
3. Click collection **jobapplications**
4. All submitted applications appear here in real time

---

## Example Request & Response

**POST /api/applications**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1 555 000 1234",
  "position": "Frontend Engineer",
  "experience": "2-4",
  "coverLetter": "I'm excited to apply..."
}
```

**Response 201**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1 555 000 1234",
    "position": "Frontend Engineer",
    "experience": "2-4",
    "coverLetter": "I'm excited to apply...",
    "status": "pending",
    "createdAt": "2024-06-04T10:00:00.000Z",
    "updatedAt": "2024-06-04T10:00:00.000Z"
  }
}
```
