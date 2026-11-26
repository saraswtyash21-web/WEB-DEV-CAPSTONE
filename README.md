# CampusLibrary

CampusLibrary is a MERN library management system for the capstone assignment. Students can browse the catalogue and track loans; librarians and admins manage books, issue and receive returns, and review circulation reports.

## Features

- Student registration and sign-in with bcrypt, short-lived access JWTs, rotated refresh JWTs in HTTP-only cookies, and role-protected staff actions.
- Student self-checkout with a 14-day default loan, plus librarian checkout for another student with a chosen due date.
- Searchable, filterable and paginated catalogue with student self-checkout and librarian/admin book management.
- Student loan history, staff loan desk, availability checks, due dates, and configurable late fees.
- Atomic loan returns so a copy is restored once, even if two returns are attempted at nearly the same time.
- Staff reports for active loans, popular books, overdue items, collection size, student count and late fees assessed.
- Responsive React dashboard with role-aware navigation and loading, error and empty states.

## Requirements

- Node.js 20 or newer and npm.
- MongoDB running locally or a MongoDB Atlas connection string.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, both JWT secrets, and a strong admin password. Keep `.env` private.
2. From the repository root, install packages:

   ```sh
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. Create the first admin account:

   ```sh
   npm run seed:admin --prefix backend
   ```

   The seed script requires `ADMIN_PASSWORD` to be at least 12 characters. Students create their own accounts in the app. The admin can create librarian accounts from the Library team page; public sign-up never accepts privileged roles.

4. (Optional) Add a small sample catalogue for a demo:

   ```sh
   npm run seed:books --prefix backend
   ```

   This inserts ten sample titles once by ISBN and can safely be run again.

5. Start the API and frontend from the root:

   ```sh
   npm run dev
   ```

   The API runs on `http://localhost:5002`; the Vite app runs on `http://localhost:5173`. Sign in with the admin email and password configured in `backend/.env`.

Demo book covers use the Open Library Covers API and are looked up by ISBN.

For a separate frontend API host, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`. Configure `CLIENT_URL` in the backend to match the frontend origin. Set `LATE_FEE_PER_DAY` to configure the per-day fee (default ₹5).

## Project layout

```text
backend/
  src/config/       MongoDB connection
  src/controllers/  Auth, book, loan and student operations
  src/middleware/   Authentication, RBAC and centralized errors
  src/models/       User, Book and IssueRecord schemas
  src/routes/       REST API routes
  scripts/          First-admin seed script
frontend/
  src/components/   Layout, route guard and feedback components
  src/context/      Authentication context
  src/pages/        Sign-in, dashboard, catalogue, loans and reports
docs/               API guide and ER diagram
postman/            Importable API collection
```

## API and database docs

- [API reference](docs/API.md)
- [ER diagram](docs/ER_DIAGRAM.md)
- [Postman collection](postman/CampusLibrary.postman_collection.json)
- [Qwen Coder implementation prompt](QWEN_PROMPT.md)

All endpoints are under `/api`. `GET /api/health` is the service health endpoint. Request/response examples and access rules are in the API reference.

## Deployment notes

Deploy the Express API and React frontend separately or behind one domain. Use a managed MongoDB deployment, set fresh JWT secrets, set `NODE_ENV=production`, configure `CLIENT_URL`, and serve the frontend over HTTPS so the refresh cookie is secure. Do not deploy with the sample credentials or commit environment files.

## Capstone deliverables

- Source repository and setup/API documentation: this repository and the linked docs.
- Data model / ER diagram: `docs/ER_DIAGRAM.md`.
- REST request collection: `postman/CampusLibrary.postman_collection.json`.
- Frontend/backend deployments or a recorded demo: configure a deployment using the notes above before submission.
