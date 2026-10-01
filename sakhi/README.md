# Sakhi

Sakhi is a conversational guide to a small set of Indian public-benefit schemes. It asks a short series of questions, suggests possible matches, and links to official sources. Matches are informational only and are not an official eligibility decision.

## Run locally

Use Node.js 18 or newer.

1. In `backend`, run `npm install` and `npm run dev`.
2. In `frontend`, run `npm install` and `npm run dev`.
3. Open the Vite URL shown in the frontend terminal (usually `http://localhost:5173`).

The backend listens on port `5001` by default (`5000` is commonly occupied by AirTunes on macOS). The assistant works without an API key. To enable Gemini for follow-up questions, copy `.env.example` to `backend/.env`, replace `your_api_key_here` with your Gemini API key, and restart the backend. Eligibility matching remains deterministic and uses the data in `backend/data/scheme.json`.

## Project structure

- `frontend/`: Vite + React chat experience, voice input, and spoken responses.
- `backend/`: Express API, in-memory sessions, scheme data, deterministic eligibility matching, and optional Gemini responses.

Session answers are held temporarily in backend memory and are cleared when a chat is restarted or the server restarts. The scheme list is intentionally small; verify every rule and current application detail against the linked official sources before relying on it.