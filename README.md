# Automatic Home Energy Management System (AHEMS)

AHEMS is a premium, fully web-based smart-home energy simulation platform built with React, Tailwind CSS, Express, MySQL, Docker, and Nginx. This Phase 1 delivery establishes the production-ready foundation, premium UI shell, route architecture, API structure, database schema, and containerized deployment workflow required for the rest of the product roadmap.

## Stack

- Frontend: React + Vite + Tailwind CSS + Lucide React + Recharts
- Backend: Node.js + Express.js
- Database: MySQL 8
- Auth: JWT
- State: Context API
- Infra: Docker Compose + Nginx reverse proxy

## Project Structure

```text
root/
  client/
  server/
  database/
  nginx/
  docker/
  docker-compose.yml
  README.md
```

## Key Phase 1 Deliverables

- Premium responsive marketing pages
- Role-aware app and admin shells
- Sticky topbar, desktop sidebar, and mobile off-canvas navigation
- Placeholder route pages for every required public, app, and admin URL
- Express API foundation with controllers, services, middleware, validators, and JWT auth scaffolding
- MySQL schema and seed scripts for the full AHEMS data model
- Dockerfiles for frontend and backend
- Docker Compose stack with `frontend`, `backend`, `db`, and `nginx`
- Reverse proxy exposed on port `3002`

## Demo Credentials

These are handled by the Phase 1 simulation-ready API:

- Admin: `admin@ahems.io` / `Admin@12345`
- User: `resident@ahems.io` / `Resident@12345`
- Operator: `operator@ahems.io` / `Operator@12345`

## Local Environment

1. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

2. Build and run with the optional local MySQL container:

   ```bash
   docker compose --profile local-db up --build -d
   ```

3. Open:

   - App: `http://localhost:3002`
   - API health: `http://localhost:3002/api/health`

## VPS Deployment With aaPanel-Managed MySQL

Run these commands from the deployment directory:

```bash
cd /www/wwwroot/ahems.arosoft.io
git pull origin main
cp .env.example .env
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1:3002
curl http://127.0.0.1:3002/api/health
```

If your aaPanel MySQL is running on the same VPS, keep `MYSQL_HOST=host.docker.internal`.
If MySQL is on a separate server, set `MYSQL_HOST` to that host or IP instead.
Import `database/schema/001_ahems_schema.sql` and `database/seed/001_seed_roles_and_demo.sql` into the aaPanel database before starting the stack.

## Rebuild / Restart

```bash
cd /www/wwwroot/ahems.arosoft.io
docker compose down
docker compose up -d --build
docker compose logs -f nginx backend
```

## Notes

- `phpMyAdmin` is intentionally excluded from Docker because it is already managed separately in aaPanel.
- The UI and API are structured for simulation-first workflows, with hardware integrations explicitly out of scope.
- The database schema already includes the core entities required for role management, automation, sensing, monitoring, reporting, and auditability.
