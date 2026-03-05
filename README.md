# Anzen Industries Backend (Minimal)

Lightweight Node/Express backend for telemetry ingestion and retrieval using Supabase.

## 1. Setup
```bash
npm install
```

Copy env file:
```bash
cp .env.example .env
```

Fill `.env`:
```bash
PORT=4000
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## 2. Create table in Supabase
Open SQL Editor and run:
```sql
-- paste contents of supabase-schema.sql
```

## 3. Start server
```bash
npm run dev
```

## 4. API endpoints
- `GET /health`
- `GET /api/telemetry?limit=100`
- `POST /api/telemetry`

Example POST body:
```json
{
  "reactorId": "RXN-001",
  "reactorName": "Reactor Alpha",
  "location": "California Facility - Bay 1",
  "status": "running",
  "temperature": 35.1,
  "ph": 7.38,
  "pressure": 1.21,
  "flowRate": 152,
  "enzymeActivity": 89.5,
  "substrateConcentration": 12.4,
  "productYield": 81.2,
  "dissolvedOxygen": 92,
  "uptimeHours": 16.3,
  "unresolvedAlerts": 1,
  "capturedAt": "2026-03-05T10:00:00.000Z"
}
```

