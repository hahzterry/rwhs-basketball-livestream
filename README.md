# High School Basketball Livestream System

A web-based livestreaming system that turns a phone camera into a broadcast-quality feed for high school basketball tournaments. It combines live video from up to two mobile devices with real-time scores from Google Sheets and outputs a vertical 9:16 frame ready for Instagram Live via OBS.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [LiveKit Configuration](#livekit-configuration)
- [Deployment](#deployment)
- [Usage](#usage)
- [Google Sheets Integration](#google-sheets-integration)
- [OBS Setup](#obs-setup)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Overview

This system lets a small crew broadcast a high school basketball tournament without a production truck. Two phones capture the action, scores flow in from a Google Sheet, an operator controls which feed goes live, and OBS pushes the result to Instagram Live — all in a vertical 9:16 format that matches Instagram's native layout.

**Who it's for:** School media programs, small sports clubs, and tournament organizers who want a professional-looking livestream on a hobbyist budget.

---

## Architecture

### Frontend — Svelte 5

| Page | Purpose |
|---|---|
| **Camera** (`/camera`) | Mobile-side page that publishes camera and microphone streams to LiveKit |
| **Admin** (`/admin`) | Multi-feed preview and source control for the operator |
| **Output** (`/output`) | Vertical 9:16 frame served as an OBS browser source |

### Backend — Rust

| Component | Purpose |
|---|---|
| **API Server** | Issues LiveKit tokens and serves score data |
| **WebSocket Service** | Pushes real-time score updates to connected clients |

### External Services

| Service | Role |
|---|---|
| **LiveKit** | WebRTC transport for video, audio, and DataChannel commands |
| **Google Sheets** | Source of truth for game scores |
| **OBS** | Captures the output page and pushes to Instagram Live |
| **Instagram Live** | Final broadcast destination |

---

## Requirements

- **Node.js** 18+ (frontend development)
- **Rust** 1.75+ (backend development)
- **Docker** & **Docker Compose** (deployment)
- **LiveKit Server** (self-hosted or cloud)
- **VPS** with sufficient CPU, RAM, and bandwidth

---

## Getting Started

### Backend Setup

**1. Install Rust**

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**2. Navigate to the backend directory**

```bash
cd backend
```

**3. Create and configure the environment file**

```bash
cp .env.example .env
```

Edit `.env` and set your LiveKit API key, secret, and other required values.

**4. Run the backend server**

```bash
cargo run
```

The API server and WebSocket service will start on their configured ports.

---

### Frontend Setup

**1. Navigate to the frontend directory**

```bash
cd frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Create and configure the environment file**

```bash
cp .env.example .env
```

Edit `.env` and point `VITE_API_URL`, `VITE_WS_URL`, and `VITE_LIVEKIT_URL` at your backend.

**4. Run in development mode**

```bash
npm run dev
```

**5. Build for production**

```bash
npm run build
```

---

### LiveKit Configuration

**1.** In the `backend/` directory, review `livekit.yaml`.

**2.** Confirm the API key and secret match the values in your `.env` file.

**3.** If deploying across NAT, ensure a TURN server is configured. LiveKit includes one by default; verify it is reachable from client networks.

---

## Deployment

### Docker Compose (recommended)

From the `backend/` directory:

```bash
docker-compose up -d
```

This starts:

- **Rust backend** — API + WebSocket
- **LiveKit server** — WebRTC media transport
- **Nginx** — reverse proxy in front of both

### Manual Deployment

1. Install **LiveKit Server** on the VPS
2. Build and deploy the **Rust backend** (`cargo build --release`)
3. Build and deploy the **Svelte frontend** (`npm run build`, then serve `dist/` via Nginx or a static host)

The frontend is a static SPA and can be hosted on Vercel, Netlify, or any static file server. The backend and LiveKit server must run on the same VPS or a low-latency cluster.

---

## Usage

### Semi-final Mode

Two courts running simultaneously.

1. Two phones each open `/camera` and publish their feed
2. The operator opens `/admin` and monitors both games side by side
3. The output page renders a top/bottom split of both feeds with live scores overlaid

### Final Mode

One game, two angles.

1. Two phones each open `/camera` and publish from different angles of the same court
2. The operator opens `/admin` and selects which angle goes live
3. The output page renders the selected angle full-frame in 9:16, with the score overlay

---

## Google Sheets Integration

**1.** Create a Google Apps Script bound to your scores spreadsheet.

**2.** Add a trigger that fires on edit (or on a time interval).

**3.** The script POSTs the updated score data to the backend:

```javascript
function sendScores() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = {
    phase: "semi",
    scores: {
      game1: { "Class A": "42", "Class B": "38" },
      game2: { "Class C": "51", "Class D": "47" }
    }
  };

  UrlFetchApp.fetch("https://your-backend.example.com/api/scores", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data)
  });
}
```

**4.** The backend broadcasts the update over WebSocket to every connected Admin and Output page.

---

## OBS Setup

**1.** Add a **Browser Source** in OBS.

**2.** Point the URL at your deployed output page:

```
https://your-frontend.example.com/output
```

**3.** Set the source dimensions to **1080 × 1920** (9:16 vertical).

**4.** Enable **"Shutdown source when not visible"** and **"Refresh browser when scene becomes active"** to keep memory usage low.

**5.** In OBS **Settings → Stream**, configure the Instagram Live RTMP URL and stream key.

**6.** Start streaming.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| **Video not showing** | WebRTC connection failed | Verify the TURN server is reachable; check the browser console for ICE errors; confirm the LiveKit URL in `.env` matches the server |
| **Scores not updating** | WebSocket or Apps Script misconfigured | Check the backend WebSocket port is open; verify the Apps Script trigger is firing; test the POST endpoint manually with `curl` |
| **LiveKit connection errors** | Invalid or expired API key | Confirm the API key/secret in `backend/.env` match `livekit.yaml`; restart the LiveKit server after changes |
| **Output page blank in OBS** | Browser source URL wrong or CORS blocked | Open the URL in a regular browser first; if it loads there but not in OBS, disable hardware acceleration in OBS or add `--disable-web-security` to the browser source |
| **Camera permission denied on mobile** | HTTPS required for `getUserMedia` | Serve the frontend over HTTPS in production; on localhost, most browsers allow it without HTTPS |

---

## Tech Stack

- **Svelte 5** with Runes for reactive state
- **Vite** for the frontend build
- **Rust** with Axum for the API and WebSocket server
- **LiveKit** for WebRTC
- **PostgreSQL** (optional) for persistent score history
- **Docker Compose** for local and VPS deployment

---

## License

MIT
