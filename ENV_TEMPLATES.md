# Environment Variables Configuration

This project requires environment variables to be set in **two distinct locations**: the root directory (for Docker, backend, and database) and the client directory (for Vite build-time variables).

## 1. Root Directory (`/.env`)
Create a `.env` file at the root of the project. This configures the backend and database.

```env
# --- JWT Secrets ---
ACCESS_TOKEN_SECRET="your_secure_access_secret_here"
REFRESH_TOKEN_SECRET="your_secure_refresh_secret_here"

# --- Admin Initial Setup ---
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="super_secure_password"

# --- MongoDB Configuration ---
# Must match the credentials below
DATABASE_URI="mongodb://admin:super_secure_password@obrok_db:27017/obrok?authSource=admin"
MONGO_INITDB_ROOT_USERNAME="admin"
MONGO_INITDB_ROOT_PASSWORD="super_secure_password"

# --- Express API Config ---
CLIENT_ORIGIN="https://obrok.net"
SERVER_ORIGIN="https://obrok.net/api"
PORT=5000
```

## 2. Client Directory (`/apps/client/.env`)
Create a `.env` file inside the `apps/client` folder. These must start with `VITE_` to be exposed to the React frontend.

```env
# For local dev, use http://localhost:5000. For prod, use your domain.
VITE_API_URL="https://obrok.net"
VITE_OSRM_URL="https://obrok.net/route/v1"
VITE_DEFAULT_VISIBLE_VENDORS="Vero,Ramstore"

# Automatically injected by GitHub Actions during production deployment
VITE_RELEASE_VERSION="v2026.03.13.1"
```