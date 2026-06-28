# Dev Productivity Platform

![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen)
![React](https://img.shields.io/badge/React-19-61dafb)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ed)

Dev Productivity Platform is an enterprise-style full-stack productivity application for software developers and small teams.

It provides a practical workspace for organizations, clients, projects, tasks, daily time tracking, reports, Excel import/export, account settings, and application metadata. The project is built as a Spring Boot REST API, a React/Vite frontend, and a PostgreSQL database.

## Screenshots

### Login

![Login](docs/screenshots/login.png)

### Time Tracking

![Time Tracking](docs/screenshots/time-tracking.png)

### Reports

![Reports](docs/screenshots/reports.png)

### Administration

![Administration](docs/screenshots/administration.png)

## Features

- JWT authentication with Sign In and Sign Up.
- BCrypt password storage and account password change.
- Multi-user data isolation across organizations, clients, projects, tasks, time entries, settings, reports, and import/export.
- Organizations, Clients, Projects, Tasks, Software Products, Settings, Administration, Reports, and About pages.
- Daily time tracking with worklog entries and monthly summaries.
- Work effort reports grouped by client and task.
- Full Excel import/export for user-owned data.
- Scheduled full data export configuration.
- Docker support for local development.

## Technology Stack

### Backend

- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA / Hibernate
- PostgreSQL
- Apache POI

### Frontend

- React
- Vite
- Axios

### Infrastructure

- Docker
- Docker Compose
- Nginx

## Architecture

```text
Browser
  -> Nginx / React UI
  -> Spring Boot REST API
  -> PostgreSQL
```

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Run Locally With Docker Compose

`docker-compose.yml` is a local development configuration, not a production deployment template.

From the project root:

```bash
docker compose up -d --build
```

Open the application:

```text
http://localhost
```

Create a user through the Sign Up form, then use the application normally.

## Services

Docker Compose starts three services:

- `postgres` - PostgreSQL database on port `5432`
- `backend` - Spring Boot API on port `8080`
- `frontend` - Nginx-served React application on port `80`

The frontend proxies `/api/` requests to the backend service through Nginx.

## Local Development

### Backend

```bash
cd backend
mvn test
mvn spring-boot:run
```

By default, the backend uses the `dev` profile. The dev profile keeps local defaults convenient, including `ddl-auto=update`, SQL logging, and a local JWT fallback secret.

The default local database URL is:

```text
jdbc:postgresql://localhost:5432/dev_platform
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8080`.

## Production Environment Variables

Set these variables for any non-dev deployment:

```text
DATABASE_URL=jdbc:postgresql://<host>:<port>/<database>
DATABASE_USERNAME=<database-user>
DATABASE_PASSWORD=<database-password>
JWT_SECRET=<strong-random-secret-at-least-32-characters>
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.example
```

Production notes:

- Do not run production with the `dev` profile.
- `JWT_SECRET` is required outside the `dev` profile.
- The demo/local JWT secret is rejected outside the `dev` profile.
- Production defaults disable SQL logging and do not use `ddl-auto=update`.
- Do not publish real `.env` files, database dumps, Excel exports, backup files, or local machine paths.

## Useful Commands

Build and start all local services:

```bash
docker compose up -d --build
```

View running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop services:

```bash
docker compose down
```

Stop services and remove the local database volume:

```bash
docker compose down -v
```

## Project Structure

```text
.
+-- backend/              # Java Spring Boot backend
+-- frontend/             # React + Vite frontend
+-- docker-compose.yml    # Local PostgreSQL, backend, frontend stack
+-- README.md
```

## Future Improvements

- Email verification.
- Forgot password flow.
- More granular roles and permissions.
- Database migrations with Flyway or Liquibase.
- Additional automated security and API tests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
