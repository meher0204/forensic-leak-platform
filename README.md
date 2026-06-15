# Forensic Leak Platform

A forensic watermarking and leak attribution platform that lets investigators upload original images, generate recipient-specific watermarked copies, and identify the source of leaked images.

---

## Project Overview

The Forensic Leak Platform allows security teams to embed invisible, unique identifiers into watermarked copies of sensitive images. When a watermarked image is leaked, the platform can extract the watermark from the suspected leaked copy and determine which recipient was the source — enabling swift and decisive action against insider threats.

The watermark is embedded using LSB (Least Significant Bit) steganography, making it imperceptible to the human eye while remaining recoverable from re-photographed, re-encoded, or compressed images.

---

## Key Features

- **Forensic Watermark Generation** — Embed unique, recipient-bound watermark IDs into image copies using LSB steganography. The 12-character ID format (`WMK-XXXXXXXX`) is repeated across the image to improve extraction reliability.
- **Leak Source Detection** — Upload a suspected leaked image and receive a ranked match result with confidence scores. The engine scans the image for embedded watermarks and cross-references them against known recipients.
- **Investigation Management** — Automatically create investigations when a leak is detected. Each investigation stores the evidence image, detection results, and matched recipient information. Investigators can review, print, or export investigation reports as PDF.
- **Role-Based Access Control** — Two roles (Admin and Investigator) with distinct permission levels. Admins have full system visibility; investigators can only access their own data.
- **User-Owned Data Isolation** — Investigators see only the recipients, images, copies, and investigations they created. Admins can view and manage all data across the platform.
- **Cookie-Based Authentication** — Server-side sessions with httpOnly cookies for secure, instant-logout authentication without JWT complexity or client-side token management.
- **Global Search** — Search across images, recipients, watermarked copies, and investigations from a single search bar.
- **Admin Dashboard** — System overview with aggregate statistics, user management (promote, demote, activate, deactivate), and per-user activity views.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3 / FastAPI / Uvicorn |
| Frontend | React 19 / TypeScript 6 / Vite 8 |
| Styling | Tailwind CSS 4 |
| Database | SQLite via SQLAlchemy 2.0 |
| Image Processing | Pillow |
| Authentication | Server-side sessions (httpOnly cookies) |
| Watermarking | LSB steganography (distributed, repeated embedding) |

---

## User Roles

### Admin

- Full visibility into all platform data (images, copies, recipients, investigations)
- Access to the administrative panel with system-wide statistics
- User management: promote investigators to admins, demote admins, activate or deactivate accounts
- Can download any watermarked copy regardless of ownership
- Delete demo/reset data (preserves user accounts)
- View per-user activity summaries and resource counts

### Investigator

- Create and manage their own recipients, image uploads, and watermarked copies
- Run leak detection on suspected leaked images
- Access investigation reports for leaks they have detected
- Data isolation: can only see resources they created
- Cannot delete copies that have been used in investigations
- Can download watermarked copies they generated

---

## Local Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 20+
- npm

### Backend Setup

```bash
# Clone the repository and navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy the environment file and edit as needed
cp .env.example .env

# Start the development server
uvicorn main:app --reload --port 8000
```

The backend starts on `http://localhost:8000`. The SQLite database (`database.sqlite3`) is created automatically on first startup. Inline migrations run on every startup to add or update schema columns as needed.

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Copy the environment file (optional — defaults work for local development)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend starts on `http://localhost:5173`. The Vite dev server proxies `/api/*` requests to `http://localhost:8000`, so no CORS configuration is needed during development.

### First User

1. Open `http://localhost:5173/register` and create an account.
2. The first registered user is automatically granted the `admin` role.
3. All subsequent users default to the `investigator` role.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./database.sqlite3` | SQLAlchemy database connection string. |
| `SECRET_KEY` | `change-me` | Used for session token generation. Change this in production. |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Additional CORS origin. The dev defaults (5173, 5174) are always allowed. |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty)* | Base URL for API requests. Leave empty during local development (the Vite proxy handles this). Uncomment and set for production deployments. |

---

## How the Platform Works

### 1. Upload an Image

An investigator uploads a sensitive image (PNG, JPEG, or WebP, up to 50 MB). The original is stored on the server and linked to the investigator's account.

### 2. Create Recipients

The investigator creates recipient entries — each representing a person who will receive a uniquely watermarked copy (e.g., "Alice — Marketing Team", "Bob — QA Department").

### 3. Generate Watermarked Copies

The investigator selects one or more recipients and initiates watermark generation. For each recipient:

- A unique watermark ID (`WMK-XXXXXXXX`) is generated.
- The ID is embedded into the original image's pixel data using LSB steganography.
- The watermark is distributed across the image in three repetitions for redundancy.
- A watermarked copy is saved and linked to the recipient.

### 4. Distribute Copies

The investigator downloads each watermarked copy and sends it to the corresponding recipient. The download is logged for audit purposes.

### 5. Detect a Leak

If a watermarked image is leaked publicly, the investigator uploads the suspected leaked image to the detection endpoint. The platform:

1. Extracts the watermark ID from the image's LSB data.
2. Scans every possible bit-offset within one ID-length window.
3. Decodes candidates into ASCII strings and validates them against the `WMK-XXXXXXXX` pattern.
4. Reports the most frequently found valid ID with a confidence score based on repetition count.

### 6. Investigate the Leak

When a leak is detected, an investigation is automatically created. The investigation record includes:

- The original image that was leaked.
- The matched recipient's name and watermark ID.
- The evidence image uploaded for detection.
- A confidence score for the match.

The investigator can view the detection report, examine the evidence, and export or print the investigation as a PDF.

---

## Screenshots

<!-- Screenshots will be added here once the UI is finalized. -->

---

## Current Limitations

- **Single-server setup** — The application is designed to run on a single machine with a local SQLite database. Horizontal scaling would require migrating to PostgreSQL and adding shared file storage.
- **SHA-256 password hashing** — Passwords are hashed with unsalted SHA-256. This is acceptable for a learning/demo platform but production deployments should use bcrypt or argon2.
- **LSB steganography resilience** — While the watermark is repeated across the image for redundancy, aggressive compression, heavy cropping, or significant color quantization may degrade extraction reliability.
- **No email/push notifications** — The platform does not notify investigators when a leak is detected. Detection results must be checked manually.
- **No concurrent processing** — Watermark generation and leak detection run synchronously in the request handler. Large images or batch operations may cause noticeable delays.
- **SQLite concurrent writes** — SQLite serialises write operations. Under concurrent load, some requests may experience latency or timeout.

---

## Future Improvements

- [ ] **PostgreSQL support** — Replace SQLite with PostgreSQL for better concurrency, reliability, and production readiness.
- [ ] **bcrypt/argon2 password hashing** — Upgrade from SHA-256 to a salted, memory-hard hashing algorithm.
- [ ] **Batch watermark generation** — Allow generating hundreds of watermarked copies in a single request with background task processing.
- [ ] **Email notifications** — Notify investigators by email when a leak detection matches a known watermark.
- [ ] **Webhook integration** — Trigger external workflows (e.g., Slack alerts, incident management systems) when a leak is confirmed.
- [ ] **Image comparison view** — Side-by-side overlay of the original, watermarked, and leaked images with pixel-level diff highlighting.
- [ ] **Leak timeline** — Track distribution and re-distribution of watermarked copies over time.
- [ ] **API keys for programmatic access** — Allow automated uploads and leak detection via API tokens.
- [ ] **Docker deployment** — Containerized setup with Docker Compose for one-command deployment.
- [ ] **Rate limiting and audit logging** — Protect public endpoints from abuse and maintain a comprehensive audit trail of all platform actions.
