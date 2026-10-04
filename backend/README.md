# P-Guard Backend

This folder contains the backend for the **P-Guard** system.

## 🚀 Quick Start (Node.js Backend - Recommended)

The Node.js backend requires **no external dependencies** or databases to be installed or configured. It uses Node's built-in HTTP module with a persistent JSON file store (`backend/data/users.json`).

### Start the Backend
From the project root:
```bash
npm run backend
```
Or from inside the `backend` folder:
```bash
node server.js
```

The server automatically listens on both:
- **Port 80**: Direct compatibility with existing `http://localhost/angular-auth-api/...`
- **Port 3000**: Standard alternative port (`http://localhost:3000/...`)

### Default Test Accounts
| Username | Password | Immatricule | Email / Adresse |
| :--- | :--- | :--- | :--- |
| `admin` | `password123` | `PG-001` | `admin@pguard.com` |
| `user` | `password123` | `PG-002` | `user@pguard.com` |

---

## 📡 API Endpoints

- `POST /angular-auth-api/login.php` (also `/api/login`)
  - Request body: `{ "username": "admin", "password": "password123" }`
  - Response: `{ "success": true, "message": "Login successful", "data": { ... }, "token": "..." }`
- `POST /angular-auth-api/register.php` (also `/api/register`)
  - Request body: `{ "username": "...", "password": "...", "immatricule": "...", "adresse": "..." }`
  - Response: `{ "success": true, "message": "Inscription réussie !" }`
- `GET /api/users` (also `/angular-auth-api/users`): View all registered users (excluding passwords).
- `GET /api/health`: Health status of the backend.

---

## 🐘 Alternative: PHP / XAMPP Backend

If you prefer running Apache/PHP with MySQL:
1. Import `backend/php/schema.sql` into phpMyAdmin / MySQL to create the `api_db` database and `users` table.
2. Ensure Apache and MySQL are running in your XAMPP Control Panel.
3. The PHP files are available in `backend/php/`. Copy or symlink them into your XAMPP `htdocs/angular-auth-api` directory.
