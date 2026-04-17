# Automatic Home Energy Management System (AHEMS)

AHEMS is a web-based energy management and automation platform for simulated rooms, appliances, sensors, rules, analytics, alerts, reports, and administration. The application is built for secure dashboard use, not as a marketing website. The root route redirects to the login page and all operational features are available after authentication.

## Stack

- Frontend: React, Vite, Tailwind CSS, Lucide React, Recharts
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT
- State management: Context API
- Deployment: Docker Compose, Nginx

## Core Modules

- Authentication and protected routing
- Resident and admin dashboards
- Room and appliance management
- Sensor simulation and command execution
- Automation rules engine with execution history
- Energy monitoring and tariff-based cost estimation
- Notifications and activity logs
- Reports and exports
- Settings and admin control center

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

## Initial Accounts

The seeded database includes these initial accounts:

- Admin: `admin@ahems.io` / `Admin@12345`
- Resident: `resident@ahems.io` / `Resident@12345`
- Operator: `operator@ahems.io` / `Operator@12345`

## Environment Setup

Create an environment file from the example:

```bash
cp .env.example .env
```

Important variables:

- `APP_PORT=3002`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `CLIENT_PUBLIC_URL`
- `VITE_API_BASE_URL=/api`

The backend container listens on an internal fixed port of `5000` in Docker so that the Nginx proxy can always reach it.

When MySQL is managed outside Docker on the same VPS, keep `MYSQL_HOST=host.docker.internal` unless your server requires a different host value.

## Local Development

Install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

Run the frontend:

```bash
cd client
npm run dev
```

Run the backend:

```bash
cd server
npm run dev
```

Default local endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

## Docker Usage

Run the full stack:

```bash
docker compose up -d --build
```

Run with the optional local MySQL profile:

```bash
docker compose --profile local-db up -d --build
```

Stop the stack:

```bash
docker compose down
```

## Production Deployment

Deployment assumes the project exists at:

```bash
cd /www/wwwroot/ahems.arosoft.io
```

Update and deploy:

```bash
cd /www/wwwroot/ahems.arosoft.io
git pull origin main
docker compose down
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 backend frontend nginx
curl http://127.0.0.1:3002/api/health
curl -I http://127.0.0.1:3002
```

Quick rebuild and restart:

```bash
cd /www/wwwroot/ahems.arosoft.io
git pull origin main
docker compose up -d --build
docker compose restart backend frontend nginx
docker compose ps
curl http://127.0.0.1:3002/api/health
curl -I http://127.0.0.1:3002
```

## Application Routing

Public access:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

Authenticated user area:

- `/app/dashboard`
- `/app/rooms`
- `/app/appliances`
- `/app/sensors`
- `/app/automation-rules`
- `/app/energy-monitoring`
- `/app/notifications`
- `/app/reports`
- `/app/profile`
- `/app/settings`

Admin area:

- `/admin/dashboard`
- `/admin/users`
- `/admin/rooms`
- `/admin/appliances`
- `/admin/categories`
- `/admin/sensors`
- `/admin/automation-rules`
- `/admin/notifications`
- `/admin/reports`
- `/admin/logs`
- `/admin/settings`

## Operational Checks

Use this checklist after deployment:

- Sign in with each seeded role
- Confirm protected routes redirect correctly
- Create and edit rooms
- Create and edit appliances
- Run sensor updates and command actions
- Create, enable, disable, and trigger automation rules
- Confirm notifications load and can be marked read
- Review analytics and energy charts
- Generate reports and verify download output
- Review admin logs and settings

## Notes

- The application is exposed through Docker on port `3002`.
- Nginx routes `/api` traffic to the backend service and serves the frontend for all dashboard routes.
- The backend remains available even if the database is temporarily unavailable, but data-backed features require a valid MySQL connection.
