# Human Resource Management — Backend

REST API backend for a Human Resource Management (HRM) system, built with **Node.js**, **TypeScript**, **Express 5**, **Prisma ORM**, and **InversifyJS**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript 6 |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Database | MySQL |
| DI Container | InversifyJS |
| Logging | Pino |
| Security | Helmet, CORS, express-rate-limit |

---

## Requirements

- Node.js >= 18
- MySQL >= 8
- npm >= 9

---

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure the variables in `.env`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/hrm_db"
PORT=3000
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

---

## Database

```bash
# Create migration and apply schema
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

### Schema

| Model | Fields | Description |
|---|---|---|
| `Employee` | `id`, `email`, `name`, `role`, `department`, `createdAt`, `updatedAt` | Employee record |

**Role:** `ADMIN` \| `MANAGER` \| `STAFF`

---

## Running the Application

```bash
# Development (hot-reload)
npm run dev

# Build
npm run build

# Production
npm start
```

---

## API Endpoints

Base URL: `http://localhost:3000`

### Health Check

```
GET /health
```

Response:
```json
{ "status": "OK", "message": "HRM Service is running" }
```

### Employees

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/employees` | Get paginated list of employees |

#### Query Parameters — `GET /api/employees`

| Parameter | Type | Default | Limit |
|---|---|---|---|
| `page` | number | `1` | >= 1 |
| `limit` | number | `20` | 1 – 100 |

---

## Project Structure

```
src/
├── server.ts                  # Entry point, Express setup
├── constants/
│   └── types.ts               # DI tokens (TYPES)
├── containers/
│   └── inversify.config.ts    # InversifyJS container configuration
├── controllers/
│   └── EmployeeController.ts  # HTTP request/response handling
├── interfaces/
│   ├── IEmployeeRepository.ts
│   └── IEmployeeService.ts
├── middlewares/
│   ├── errorHandler.ts        # Global error handler
│   └── requestId.ts           # Attaches X-Request-ID to each request
├── repositories/
│   └── EmployeeRepository.ts  # Database queries via Prisma
├── routes/
│   └── employeeRoutes.ts      # Route definitions
├── services/
│   └── EmployeeService.ts     # Business logic
└── utils/
    └── Logger.ts              # Pino logger wrapper
```

---

## Security

- **Helmet** — secures HTTP response headers
- **CORS** — only allows origins configured via `ALLOWED_ORIGINS`
- **Rate Limit** — max 100 requests per 15 minutes per IP
- **Request ID** — each request is tagged with `x-request-id` for log tracing
- **Body size limit** — request body capped at `10kb`

---

## Lint

```bash
npm run lint        # Check for lint errors
npm run lint:fix    # Auto-fix lint errors
```