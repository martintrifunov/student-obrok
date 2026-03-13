# Student Obrok 🍽️🎓

Student Obrok is a modern web application designed to help university students find affordable, budget-friendly meal deals around their location via an interactive 3D map. 

Built with a feature-sliced React frontend (Vite, Zustand, TanStack Query, MapLibre GL) and a robust Express 5 / MongoDB backend. Routing is handled via a dedicated OSRM instance.

---

## 🚀 Quick Start (Development)

The entire development environment is fully containerized.

1. Clone the repository.
2. Ensure you have Docker and Docker Compose installed.
3. Configure your `.env` and `apps/client/.env` files (See [ENV_TEMPLATES.md](./ENV_TEMPLATES.md)).
4. Download the necessary OpenStreetMap `.osrm` data and place it in `/data/map`.
5. Run the dev environment:

```bash
docker compose -f docker-compose.dev.yml up --build
```
*   **Frontend:** `http://localhost:3500`
*   **Backend API:** `http://localhost:5000`
*   **OSRM Routing:** `http://localhost:5001`

---

## 🌍 Production Deployment

Production relies on Nginx for reverse-proxying and Let's Encrypt (Certbot) for automated SSL generation and renewal.

### First-Time Server Setup
When deploying to a brand new VPS, you must generate the initial SSL certificates. We have automated the "Chicken and Egg" Nginx/SSL problem. 

Simply run:
```bash
./init-ssl.sh
```
This script will generate dummy certs, boot Nginx, fetch real Let's Encrypt certificates, reload the web server, and start the application.

### CI/CD automated deployments
This project uses GitHub Actions for CI/CD. 
To deploy a new version to production:
1. Push your code to the `main` branch.
2. In GitHub, go to **Releases** -> **Draft a new release**.
3. Create a tag using Calendar Versioning (e.g., `v2026.03.13.1`).
4. Publish the release.

The GitHub Action will automatically SSH into the VPS, pull the tagged code, inject the dynamic version number into the frontend, and rebuild the Docker containers with zero manual intervention. SSL renewals are handled automatically in the background via the Docker containers.