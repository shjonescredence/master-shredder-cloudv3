# Capture Assistant Backend

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Endpoints
- `POST /api/chat` — Chat endpoint. Accepts `{ message, context?, model? }` in JSON body.

## Project Structure
- `src/index.ts` — Main server entry
- `src/routes/` — Express route handlers
- `src/services/` — OpenAI client logic
