# 🛡️ P-Guard - Autonomous Patrol & Perimeter Security Platform

P-Guard is a modern web-based command and control dashboard for autonomous patrol robots, perimeter surveillance, and geospatial mission planning.

---

## 📋 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [System Modules & Functionalities](#-system-modules--functionalities)
- [Getting Started](#-getting-started)
- [Backend & Database](#-backend--database)
- [API Reference](#-api-reference)
- [Default Test Credentials](#-default-test-credentials)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)

---

## 🏛️ Architecture Overview

The system consists of a decoupled frontend and backend architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 Angular 20 Single Page App                  │
│  (AuthGuard, Leaflet, MapLibre, Reactive Forms, ModelViewer) │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP Requests                 │
               ▼ (Port 80 / 3000)              │ JSON Responses
┌──────────────────────────────────────────────┴──────────────┐
│                      P-Guard Backend                        │
│   ├── Node.js HTTP Service (server.js)                      │
│   │     └── JSON File Store (backend/data/users.json)       │
│   └── PHP/MySQL Alternative (backend/php/)                  │
│         └── MySQL Database (schema.sql -> api_db)          │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ System Modules & Functionalities

### 1. 🔐 Authentication & Session Security
- **Registration (`/register`)**: Allows new operators and robot fleet managers to create accounts with username, password, immatricule identifier, and email address.
- **Login (`/login`)**: Authenticates users against the backend service and issues a session token.
- **Route Guard (`AuthGuard`)**: Protects application routes from unauthorized access. Unauthenticated users are redirected to `/login`.
- **Session Management**: Automatically stores authenticated session in browser `localStorage` and maintains authentication state via RxJS `BehaviorSubject`.

### 2. 📊 Mission Dashboard (`/dashboard`)
- Central command overview displaying key operational status metrics, active patrol summaries, and robot telemetry.

### 3. 🗺️ Area & Perimeter Selection (`/status`)
- Interactive geospatial map powered by **MapLibre GL** and **Mapbox GL Draw**.
- Enables operators to draw custom patrol zones, define geofences, and manage area boundaries with polygon coordinates.

### 4. 🛣️ Road & Route Conditions (`/roads`)
- Geospatial mapping powered by **Leaflet**.
- Integrates with the **Overpass API** (`overpass-api.de`) to dynamically query street networks, analyze surface types, and optimize patrol paths.

### 5. 📹 Live Video Surveillance Feed (`/live`)
- Real-time video streaming interface for remote visual inspection and robot camera feeds.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher installed)
- [Angular CLI](https://angular.dev/) (`npm install -g @angular/cli`)

### Installation
Clone the repository and install root dependencies:
```bash
git clone https://github.com/gharbimajd/p-guard.git
cd p-guard
npm install
```

### Running the Project

Run both the backend and frontend in separate terminals:

#### 1. Start the Backend API:
```bash
npm run backend
```
*(Or run `node backend/server.js` directly)*
> Server listens simultaneously on `http://localhost:80` and `http://localhost:3000`.

#### 2. Start the Frontend Client:
```bash
npm start
```
*(Or run `ng serve`)*
> Navigate to **[http://localhost:4200](http://localhost:4200)** in your browser.

---

## 💾 Backend & Database

### Option A: Node.js Zero-Config Backend (Default)
The primary backend server is located in [`backend/server.js`](./backend/server.js).
- **Database Engine**: Persistent JSON store in [`backend/data/users.json`](./backend/data/users.json).
- **Features**: Zero setup, no database server installation needed, instant persistence across reboots, built-in CORS configuration.

### Option B: PHP / MySQL Backend (Optional)
If you prefer running with an Apache / MySQL stack (such as XAMPP or WAMP):
1. Start MySQL and Apache in your XAMPP Control Panel.
2. Import [`backend/php/schema.sql`](./backend/php/schema.sql) into phpMyAdmin to create the `api_db` database and `users` table.
3. Deploy the scripts in [`backend/php/`](./backend/php/) to your web server's `htdocs/angular-auth-api` directory.

---

## 📡 API Reference

All requests accept and return JSON with standard CORS headers (`credentials: true`).

| Endpoint | Method | Description | Request Body |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | Health check endpoint | _None_ |
| `/angular-auth-api/login.php` | `POST` | Operator authentication | `{"username": "...", "password": "..."}` |
| `/angular-auth-api/register.php` | `POST` | New user registration | `{"username": "...", "password": "...", "immatricule": "...", "adresse": "..."}` |
| `/api/users` | `GET` | List registered operators | _None_ |

---

## 🔑 Default Test Credentials

You can test logging into the application immediately with any of the following accounts:

| Username | Password | Role | Immatricule |
| :--- | :--- | :--- | :--- |
| `admin` | `password123` | Administrator | `PG-001` |
| `user` | `password123` | Patrol Operator | `PG-002` |

---

## 📁 Project Structure

```text
p-guard/
├── backend/                  # Backend service
│   ├── data/                 # Persistent database storage (users.json)
│   ├── php/                  # PHP backend scripts & MySQL schema.sql
│   ├── package.json          # Backend package config
│   ├── server.js             # Node.js authentication & API server
│   └── README.md             # Backend-specific documentation
├── src/                      # Angular frontend source
│   ├── app/
│   │   ├── components/       # Standalone UI components
│   │   │   ├── dashboard/    # Main mission dashboard
│   │   │   ├── header/       # Navigation header & user status
│   │   │   ├── live-feed/    # Live video stream feed
│   │   │   ├── login/        # Sign-in form component
│   │   │   ├── map/          # MapLibre polygon selection map
│   │   │   ├── register/     # Account registration component
│   │   │   └── selection-section/ # Leaflet road conditions
│   │   ├── services/         # Angular injectable services
│   │   │   ├── auth.ts       # Authentication API service
│   │   │   └── robot-position.ts # Overpass API & robot tracking
│   │   ├── app.routes.ts     # Application routing configuration
│   │   └── auth-guard.ts     # Route guard for protected views
│   └── index.html            # Main HTML entry point
├── angular.json              # Angular workspace configuration
├── package.json              # Project scripts and dependencies
└── README.md                 # Main project documentation
```

---

## 🧰 Tech Stack

- **Frontend Framework**: [Angular 20](https://angular.dev/)
- **State & Reactive Programming**: [RxJS](https://rxjs.dev/)
- **Mapping & GIS**: [Leaflet](https://leafletjs.com/), [MapLibre GL](https://maplibre.org/), [@turf/turf](https://turfjs.org/)
- **3D Visualization**: [@google/model-viewer](https://modelviewer.dev/)
- **Backend**: Node.js HTTP Server / PHP 8+
- **Database**: Local JSON File Store / MySQL (via `schema.sql`)
