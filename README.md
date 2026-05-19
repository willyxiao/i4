# SCAS i4

The next-generation database for the Small Claims Advisory Service, rebuilt with React TypeScript + Node.js TypeScript.

Originally developed by Willy Xiao, this database serves the needs of the Small Claims Advisory Service, an organization that provides information for residents of Massachusetts going through the small claims court system. Their website is [masmallclaims.org](http://masmallclaims.org).

## Quick Start

```bash
npm install
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173). Open http://localhost:5173.

### Demo Users

| User | Password | Role |
|------|----------|------|
| Willy Xiao | password | Admin |
| Chris Lim | password | Admin |
| Demo Comper | password | Comper |

The SQLite database auto-creates and seeds demo data on first run.

## Database

The app supports both **SQLite** (local dev) and **MySQL** (production).

### Local Development (default)
No configuration needed. A SQLite file (`server/i4.db`) is auto-created with demo data.

### Production (MySQL)
Set these environment variables to connect to the existing MySQL database:

```bash
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=your-database
MYSQL_PORT=3306  # optional, defaults to 3306
```

When `MYSQL_HOST` is set, the app uses MySQL. The production database schema is unchanged — the Node.js app connects to the same MySQL tables the PHP app used.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router v6 + Recharts
- **Backend**: Node.js + Express + TypeScript + mysql2 + better-sqlite3 + express-session
- **Database**: MySQL (production) / SQLite (local dev)

## Project Structure

```
├── client/          # React frontend
│   └── src/
│       ├── api/     # API client functions
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── types/
├── server/          # Express backend
│   └── src/
│       ├── routes/  # API route handlers
│       ├── middleware/
│       ├── db.ts    # Database abstraction (MySQL/SQLite)
│       └── seed.ts  # Demo data seeding
└── package.json     # Root workspace config
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run build` | Build both for production |
| `npm run start` | Run production server |
| `npm run lint` | Run linters |
| `npm run typecheck` | Run TypeScript type checking |

## Features

- **Login**: Session-based authentication with username typeahead
- **Find/Add Client**: Search clients by name, phone, email, or ID; add new clients
- **Client Details**: Edit client info, manage contacts with rich text, email integration
- **Cases**: View cases by priority, date, or user assignment
- **User Management**: Add users, graduate compers, manage admin access
- **Profile & Stats**: View profile, change password, see activity charts
- **Merge Clients**: Combine duplicate client records
- **Email**: Send emails to clients or other SCAS members (logged in dev mode)

## How to Use

### New User
If you are a new comper for SCAS, your training director should create a new account under Database > Add User. New users are automatically considered "compers" with certain editing rights.

### Find/Add Client
When you receive a new contact from a client (emails, appointments, phone calls), go to Find/Add Client. Enter as much information as possible to find existing clients. Click on their name to open the client page, or click "Add New" for new clients.

### Editing a Client
- **Client Information**: Change fields on the client page and click "Update Client Info"
- **New Contact**: Click "+ New Contact", set the date to when the contact occurred, select the type, and add a comprehensive summary
- **Edit Contact**: Click on any contact row to edit it

### Tips
- **Email**: From each client page, email other SCAS users or legal research via the sidebar buttons
- **Merge**: Non-compers can merge duplicate clients via the sidebar "Merge Client" button
- **Admin**: Executives and tech directors can manage users under Database > Manage Users
