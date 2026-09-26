# CRM WhatsApp Inbox — Frontend

A WhatsApp-style CRM inbox UI built with React 18, TypeScript, Vite, React Router, TanStack Query,
Axios and Tailwind CSS. This is a **frontend-only** project that consumes an existing .NET 8 Web API
with a mock WhatsApp integration. No backend endpoints or auth are implemented here.

## Features

- **Inbox** — conversation list (left), message thread (center) with chat bubbles for Text/Image/Document
  messages, a composer to send outgoing WhatsApp messages, and a details panel (right) to assign a sales
  user or close the conversation.
- **Customers** — table of customers with add/edit modals.
- **Sales Users** — list with an add modal (name + email validation).
- **Simulate Incoming Message** — a form that posts to the mock `/api/whatsapp/webhook` endpoint so you
  can demo the inbox receiving messages without a real WhatsApp connection.
- No real-time transport (no SignalR yet): the conversation list and open conversation's messages are
  polled every 5 seconds via React Query `refetchInterval`, plus a manual "Refresh" button.

## Project structure

```
src/
  api/         Axios client + typed API functions per resource (salesUsers, customers, conversations, whatsapp)
  types/       DTO TypeScript types mirroring the backend contract
  hooks/       React Query hooks (queries + mutations) per resource
  components/  Reusable UI split by feature (inbox, customers, salesUsers, common, layout)
  pages/       Route-level pages (InboxPage, CustomersPage, SalesUsersPage, SimulateWebhookPage)
  utils/       Small helpers (date formatting)
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API base URL

Copy the example env file and point it at your running .NET API:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_API_BASE_URL=https://localhost:7123
```

Use the exact HTTPS port your API is running on (check the `applicationUrl` in your API's
`Properties/launchSettings.json`, or the URL Swagger opens on).

### 3. Run the dev server

```bash
npm run dev
```

The app runs at http://localhost:5173 by default.

### 4. Build for production

```bash
npm run build
npm run preview
```

## Handling the API's HTTPS localhost certificate

The .NET API typically runs on a `https://localhost:{port}` URL with the ASP.NET Core HTTPS
development certificate. If the browser blocks requests (`net::ERR_CERT_AUTHORITY_INVALID` or a
network error in the console), do one of the following:

1. **Trust the dev certificate (recommended, one-time setup):**
   ```bash
   dotnet dev-certs https --trust
   ```
   Restart the API and the browser after trusting the certificate.

2. **Visit the API base URL directly in the browser** (e.g. `https://localhost:7123/swagger`) and
   accept the certificate warning for that origin. This is a quick workaround for local demos.

3. Ensure the API has CORS enabled for the frontend's origin (`http://localhost:5173`) — this must
   be configured on the backend since this project does not modify the API.

If requests fail with a network error, the app shows a toast telling you to check the API is
running and that `VITE_API_BASE_URL` is correct.

## Notes on architecture choices

- **API layer** (`src/api/`) wraps a single shared Axios instance (`apiClient`) so the base URL,
  headers, and error shape parsing (`getApiErrorMessage`) are centralized. Swapping the mock
  WhatsApp backend for a real integration later requires no frontend changes as long as the
  contract stays the same.
- **React Query hooks** (`src/hooks/`) are the only place components should fetch data — no direct
  Axios calls in components. Mutations invalidate the relevant query keys (see
  `src/hooks/queryKeys.ts`) to keep the UI consistent after writes.
- **Polling** — `POLL_INTERVAL_MS` (5s) in `src/hooks/useConversations.ts` controls refetch
  intervals for the conversation list, a single conversation, and its messages. Swap this for
  SignalR/WebSockets later without touching component code.
- **Validation** mirrors backend rules client-side (required phone number, message required for
  Text, mediaUrl required for Image/Document, sales user email format) to fail fast, but the app
  still surfaces backend 400 validation responses via toasts (`getApiErrorMessage`).
