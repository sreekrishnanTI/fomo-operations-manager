# FOMO Operations Manager

FOMO (Simple Operations Manager) is a small full-stack application for creating and tracking operations. It is intentionally simple so the project can be used to practice local setup, production hosting, environment variables, networking, PostgreSQL deployment, domains, and HTTPS.

## Technology stack

- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express.js, JavaScript
- Database: PostgreSQL with the `pg` package
- Communication: REST API and browser `fetch()` calls

There is no authentication, Docker, TypeScript, Redux, GraphQL, or UI framework in this project.

## Architecture

The React frontend runs on port 5173 and sends HTTP requests to the Express backend on port 5000. The backend validates requests, runs parameterized SQL queries through a PostgreSQL connection pool, and returns JSON responses. PostgreSQL stores the operations.

```text
React + Vite (5173)
        |
        | fetch()
        v
Express REST API (5000)
        |
        | pg Pool + parameterized SQL
        v
PostgreSQL (fomo_db)
```

## Folder structure

```text
fomo-project/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/
│   ├── routes/
│   │   └── operations.js
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
└── README.md
```

## PostgreSQL setup

Install PostgreSQL for your operating system. During installation, remember the password for the `postgres` user. Make sure the PostgreSQL service is running.

Open `psql` or the PostgreSQL query tool and create the database:

```sql
CREATE DATABASE fomo_db;
```

Connect to `fomo_db`, then create the table:

```sql
CREATE TABLE operations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Backend setup

Open a terminal in the `backend` folder and install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and set the PostgreSQL password and other values for your machine:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=fomo_db
DB_PASSWORD=your_password
DB_PORT=5432
```

Start the backend in development mode:

```bash
npm run dev
```

The API will run at `http://localhost:5000`.

## Frontend setup

Open another terminal in the `frontend` folder and install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The frontend uses `http://localhost:5000` by default. To use another backend URL, create `frontend/.env` with:

```env
VITE_API_URL=https://your-api-domain.example.com
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | Check that the API is running |
| GET | `/api/operations` | Return all operations |
| GET | `/api/operations/:id` | Return one operation |
| POST | `/api/operations` | Create an operation |
| PUT | `/api/operations/:id` | Update an operation |
| DELETE | `/api/operations/:id` | Delete an operation |

Example create request:

```bash
curl -X POST http://localhost:5000/api/operations ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Review metrics\",\"description\":\"Check this week's numbers\"}"
```

Example update request:

```bash
curl -X PUT http://localhost:5000/api/operations/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Review metrics\",\"description\":\"Numbers reviewed\",\"status\":\"completed\"}"
```

## How the pieces communicate

`frontend/src/App.jsx` loads operations with `fetch()` inside `useEffect`. Form submission sends a POST request. The Complete/Pending button sends a PUT request, and Delete sends a DELETE request. After successful responses, React updates its local state so the screen changes without a full page reload.

`backend/server.js` creates the Express app, enables CORS and JSON parsing, and mounts the operations router. `backend/routes/operations.js` handles each REST endpoint. Every database value is passed as a PostgreSQL parameter such as `$1`, rather than concatenated into SQL strings. `backend/db.js` creates the `pg` Pool using values from `.env`.

## Production deployment considerations

- Keep `.env` private and configure environment variables in the hosting platform instead of committing secrets.
- Use a managed PostgreSQL service or a secured PostgreSQL server, and restrict network access.
- Set the frontend `VITE_API_URL` to the deployed HTTPS API URL before building the frontend.
- Configure the backend CORS policy for the real frontend domain instead of allowing every origin.
- Use a process manager such as systemd or PM2 for a long-running Node process on an EC2 server.
- Put HTTPS in front of the frontend and API, using a reverse proxy or a managed load balancer with a valid certificate.
- Run `npm run build` in `frontend` and serve the generated `dist` folder from a static host or web server.
- Add monitoring, database backups, firewall rules, and regular dependency updates before treating the app as production-ready.
