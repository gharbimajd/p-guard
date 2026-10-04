const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const PORTS = [80, 3000];
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed initial users if users.json does not exist
if (!fs.existsSync(USERS_FILE)) {
  const initialUsers = [
    {
      id: 1,
      username: 'admin',
      password: 'password123',
      immatricule: 'PG-001',
      adresse: 'admin@pguard.com',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      username: 'user',
      password: 'password123',
      immatricule: 'PG-002',
      adresse: 'user@pguard.com',
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
  console.log('[DB] Initialized users database with default users (admin / user)');
}

function getUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading users file:', err);
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DB] Error writing users file:', err);
    return false;
  }
}

// Helper: send JSON with CORS headers
function sendJson(res, statusCode, data, reqOrigin) {
  const allowedOrigin = reqOrigin || 'http://localhost:4200';
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Parse request body as JSON
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        // Fallback for form-encoded or plain string
        resolve({ raw: body });
      }
    });
    req.on('error', err => reject(err));
  });
}

// Main request handler
async function requestHandler(req, res) {
  const reqOrigin = req.headers.origin || 'http://localhost:4200';
  const urlPath = req.url.split('?')[0];
  const method = req.method.toUpperCase();

  console.log(`[REQ] ${method} ${urlPath}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': reqOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Content-Length': '0'
    });
    return res.end();
  }

  // Health check
  if (urlPath === '/' || urlPath === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'P-Guard Backend API',
      timestamp: new Date().toISOString()
    }, reqOrigin);
  }

  // GET /api/users or /angular-auth-api/users (Debug view)
  if (method === 'GET' && (urlPath === '/api/users' || urlPath === '/angular-auth-api/users')) {
    const users = getUsers().map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    return sendJson(res, 200, { success: true, count: users.length, users }, reqOrigin);
  }

  // POST /angular-auth-api/login.php or /api/login or /login.php
  if (
    method === 'POST' &&
    (urlPath === '/angular-auth-api/login.php' ||
     urlPath === '/api/login' ||
     urlPath === '/login.php')
  ) {
    const body = await parseJsonBody(req);
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    if (!username || !password) {
      return sendJson(res, 400, {
        success: false,
        message: 'Username and password are required'
      }, reqOrigin);
    }

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      const { password: _, ...userData } = user;
      const fakeToken = 'pguard_jwt_' + crypto.randomBytes(16).toString('hex');
      console.log(`[AUTH] Login successful for user: "${username}"`);
      return sendJson(res, 200, {
        success: true,
        message: 'Login successful',
        data: userData,
        token: fakeToken
      }, reqOrigin);
    } else {
      console.log(`[AUTH] Login failed for user: "${username}" (invalid credentials)`);
      return sendJson(res, 401, {
        success: false,
        message: 'Username ou mot de passe incorrect'
      }, reqOrigin);
    }
  }

  // POST /angular-auth-api/register.php or /api/register or /register.php
  if (
    method === 'POST' &&
    (urlPath === '/angular-auth-api/register.php' ||
     urlPath === '/api/register' ||
     urlPath === '/register.php')
  ) {
    const body = await parseJsonBody(req);
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();
    const immatricule = (body.immatricule || '').trim();
    const adresse = (body.adresse || body.adressgmail || body.email || '').trim();

    if (!username || !password) {
      return sendJson(res, 400, {
        success: false,
        message: 'Champs manquants'
      }, reqOrigin);
    }

    const users = getUsers();
    const existing = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() ||
           (adresse && u.adresse && u.adresse.toLowerCase() === adresse.toLowerCase())
    );

    if (existing) {
      console.log(`[AUTH] Registration conflict for username: "${username}" or email: "${adresse}"`);
      return sendJson(res, 422, {
        success: false,
        message: "Erreur: Nom d'utilisateur ou Email déjà pris."
      }, reqOrigin);
    }

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1,
      username,
      password,
      immatricule,
      adresse,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    console.log(`[AUTH] Registration successful for new user: "${username}" (ID: ${newUser.id})`);
    return sendJson(res, 201, {
      success: true,
      message: 'Inscription réussie !'
    }, reqOrigin);
  }

  // 404 for unhandled routes
  return sendJson(res, 404, {
    success: false,
    message: `Route not found: ${method} ${urlPath}`
  }, reqOrigin);
}

// Start listeners on both Port 80 and Port 3000 for maximum compatibility
PORTS.forEach(port => {
  const server = http.createServer(requestHandler);
  server.listen(port, () => {
    console.log(`[P-GUARD BACKEND] Server listening on http://localhost:${port}`);
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[P-GUARD BACKEND] Port ${port} is already in use, skipping.`);
    } else if (err.code === 'EACCES') {
      console.warn(`[P-GUARD BACKEND] Permission denied for port ${port} (requires admin privileges).`);
    } else {
      console.error(`[P-GUARD BACKEND] Server error on port ${port}:`, err);
    }
  });
});
