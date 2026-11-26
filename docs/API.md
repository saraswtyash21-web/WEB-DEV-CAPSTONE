# CampusLibrary API

Base URL for local development: `http://localhost:5002/api`. JSON errors use `{ "message": "..." }`. Access-protected requests send `Authorization: Bearer <accessToken>`; the refresh token is an HTTP-only cookie scoped to `/api/auth`.

## Roles

- **Public:** register, login, refresh, book catalogue.
- **Student:** own loans and returns.
- **Librarian / admin:** catalogue changes, all loans, issuing, student list and reports.

Public registration always assigns `student`. Create the first admin with the seed script, then provision librarian accounts from the admin-only team page or endpoint.

## Authentication

| Method | Path | Access | Body / result |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | `{ name, email, password }`; creates a student, sets refresh cookie, returns `{ accessToken, user }` (201). |
| POST | `/auth/login` | Public | `{ email, password }`; sets refresh cookie, returns `{ accessToken, user }`. |
| POST | `/auth/refresh` | Refresh cookie | Rotates refresh token, returns a new `{ accessToken, user }`. |
| POST | `/auth/logout` | Public | Clears refresh cookie and stored refresh hash. |
| GET | `/auth/me` | Signed in | Returns `{ user }`. |
| GET | `/auth/staff` | Admin | Lists librarian accounts. |
| POST | `/auth/staff` | Admin | Creates a librarian with `{ name, email, password }`. Admin accounts remain seed-only. |

Example registration:

```json
{ "name": "Aanya Sharma", "email": "aanya@example.edu", "password": "a-long-password" }
```

## Books

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/books?page=1&limit=12&search=biology&category=Science&available=true` | Public | Search, category, availability and pagination. Returns `{ books, page, pages, total }`. |
| GET | `/books/stats` | Public | Total catalogue titles and copies available. |
| GET | `/books/:id` | Public | Returns `{ book }`. |
| POST | `/books` | Librarian/admin | Creates a title; accepts title, author, category, optional ISBN/description/coverUrl and totalCopies. |
| PATCH | `/books/:id` | Librarian/admin | Updates book details or total copies. Available count is derived from stock already on loan. |
| DELETE | `/books/:id` | Librarian/admin | Fails with 409 if an active loan exists. |

Example create body:

```json
{ "title": "The Living Planet", "author": "M. Rao", "category": "Science", "isbn": "9780000000001", "description": "An introduction to ecology.", "totalCopies": 4 }
```

## Loans and reports

| Method | Path | Access | Notes |
| --- | --- | --- | --- |
| GET | `/issues?status=active` | Student/staff | Students receive only their own loans. `status`: `active`, `returned`, or `all`; add `overdue=true` for overdue active loans. |
| GET | `/issues/students` | Librarian/admin | Student picker list: `{ students: [{ id, name, email }] }`. |
| POST | `/issues` | Student or librarian/admin | Students self-checkout with `{ bookId }` (14-day loan by default). Staff issue with `{ studentId, bookId, dueDate }`. Returns `{ issue }` (201). |
| POST | `/issues/:id/return` | Owner or staff | Returns once, restores stock, records fee. Returns `{ issue, lateDays, fine, fineRatePerDay }`. |
| GET | `/issues/reports/summary` | Librarian/admin | Summary, most-borrowed books and overdue loans. |
| GET | `/health` | Public | `{ status: "ok", service: "campuslibrary-api" }`. |

Example issue body:

```json
{ "studentId": "<student ObjectId>", "bookId": "<book ObjectId>", "dueDate": "2026-12-10T00:00:00.000Z" }
```

Typical status codes: `200` success, `201` created, `400` invalid input, `401` missing/expired authentication, `403` role/ownership denied, `404` missing record, `409` duplicate/stock conflict, `500` unexpected server failure.
