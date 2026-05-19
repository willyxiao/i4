---
name: testing-i4
description: Test the i4 SCAS database app end-to-end. Use when verifying UI, API, or migration changes.
---

# Testing the i4 App

## Prerequisites

- Node.js 18+
- Run `npm install` from repo root

## Starting the App

```bash
npm run dev
```

This starts both:
- **Frontend**: Vite dev server on http://localhost:5173
- **Backend**: Express server on http://localhost:3001

The SQLite database (`server/i4.db`) auto-creates and seeds demo data on first run. Delete it to reset.

## Demo Users

| Username | Password | Role |
|---|---|---|
| Willy Xiao | password | Admin |
| Chris Lim | password | Admin |
| Demo Comper | password | Comper (restricted) |

## Demo Clients (seeded)

- John Smith (ClientID 1) — Urgent, Small Claims
- Maria Garcia (ClientID 2) — Never Been Contacted, Housing
- James Williams (ClientID 3) — Phone Tag, Consumer Protection
- Sarah Johnson (ClientID 4) — Undefined, Consumer Protection
- Michael Brown (ClientID 5) — One Message Left, Employment

## Key Test Flows

### 1. Login
- Navigate to http://localhost:5173/login
- Type partial username — typeahead dropdown should appear
- Select user, enter "password", click Log In
- Should redirect to homepage with random quote

### 2. Cases by Priority
- Navbar → "List of Cases by" → Priority
- Should show clients with CaseTypeID IN (1, 11, 21, 22)
- Should NOT show clients with CaseTypeID = 0 (Undefined) or 61 (Resolved) or 99 (Completed)

### 3. Find/Add Client
- Navbar → "Find/Add Client"
- Search by LastName, FirstName, ClientId, Phone, or Email
- Click a result row to navigate to /client/:id
- Click "+ Add New" row to create a new client

### 4. Client Detail (/client/:id)
- Info tab: edit fields (First Name, Last Name, Phone, Email, Address, City, State, ZIP, Language, Notes, Priority, Category)
- Click "Update Client Info" to save
- Contacts tab: view contact history, click "+ New Contact" to add
- Contact modal: Date picker, Type dropdown (only Visible=1 types), Summary textarea
- Click existing contact row to edit (shows Delete button)

### 5. Profile (/profile)
- Shows own user info with "Click to Edit Password" button
- Stats section: pie chart (clients by contact type) + bar chart (clients by month)
- Admin badge shown for admin users

### 6. User Management (admin only)
- "Database Items" → "List All Users" — table of all non-hidden users
- "Database Items" → "Add User" — create new user form
- "Database Items" → "Manage Users" — search/filter users, bulk graduate/hide

### 7. Comper Restrictions
- Login as "Demo Comper" to test restricted access
- Client page should NOT show Delete Client or Merge Client buttons
- Navbar "Database Items" dropdown should NOT show "Add User" or "Manage Users"
- API endpoints with `requireNonComper` middleware will return 403 for compers

### 8. Email
- Email buttons on client page open a modal (To, From, Subject, Message)
- In dev mode, emails are logged to server console — no actual SMTP

### 9. Merge Clients
- On client detail page → "Merge Client" button (admin/non-comper only)
- Opens /merge/:id with two-column layout
- Search for second client by ID on the right
- Middle column shows merged field values
- Click Merge to combine clients

## Common Issues

- If the app shows a blank page, check browser console for errors — might be a Vite HMR issue; hard refresh (Ctrl+Shift+R) usually fixes it
- If login fails, the SQLite DB might be corrupted — delete `server/i4.db` and restart the server to re-seed
- The Vite proxy handles `/api` routes, so API calls from the browser go through localhost:5173 → localhost:3001

## Lint & Typecheck

```bash
npm run lint       # ESLint for both client and server
npm run typecheck  # TypeScript checking for both workspaces
```
