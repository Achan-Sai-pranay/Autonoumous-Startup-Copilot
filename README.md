# LaunchPilot AI — Version 1 (Hackathon Foundation)

**Your Autonomous AI Co-Founder.** Enter a startup idea, click one button,
and 8 AI agents run in sequence to produce a full startup blueprint.

---

## 1. Complete Folder Structure

```
launchpilot-ai/
├── backend/
│   ├── server.js          # Express app + the one API route
│   ├── agents.js          # All 8 agent prompts + orchestrator
│   ├── gemini.js          # Gemini API wrapper
│   ├── package.json
│   └── .env.example       # copy to .env and add your key
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       └── components/
│           ├── LoadingTimeline.jsx
│           └── BlueprintDashboard.jsx
│
└── README.md
```

Total: **11 source files.** No auth, no database, no PDF export, no history —
by design, for V1.

---

## 2. Files You Need to Create Manually

Only **one** file — everything else is generated already:

- `backend/.env` — copy from `backend/.env.example` and paste in your real
  Gemini API key. This file is intentionally not committed/generated for you
  since it holds a secret.

---

## 3. Installation Steps

### Backend

```bash
cd launchpilot-ai/backend
npm install
cp .env.example .env
# now open .env and paste your GEMINI_API_KEY
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

### Frontend

```bash
cd launchpilot-ai/frontend
npm install
```

---

## 4. Environment Variables

Set in `backend/.env`:

| Variable         | Required | Description                          |
|------------------|----------|---------------------------------------|
| `GEMINI_API_KEY` | Yes      | Your Gemini API key                   |
| `PORT`           | No       | Backend port (defaults to `5000`)     |

---

## 5. Commands to Run

**Backend** (from `launchpilot-ai/backend`):
```bash
npm start
```
You should see: `LaunchPilot AI backend running on http://localhost:5000`

**Frontend** (from `launchpilot-ai/frontend`, in a separate terminal):
```bash
npm run dev
```
Vite will print a local URL, typically `http://localhost:5173`.

Both must be running at the same time.

---

## 6. What to Test First

1. Open `http://localhost:5173` — you should see the dark-mode landing page
   with the hero text and idea input box.
2. Type a simple idea, e.g. `"I want to build an AI platform for placement
   preparation."`
3. Click **Generate Blueprint**.
4. You should see the 8-step loading checklist animate.
5. After roughly 20–40 seconds (8 sequential Gemini calls), the full
   dashboard should render with all 8 cards populated.
6. If something breaks, check the **backend terminal** first — it logs the
   exact agent that failed and why.

---

## 7. Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `Missing GEMINI_API_KEY` | `.env` not created or key not pasted in | Copy `.env.example` to `.env` and add your key |
| `Failed to generate blueprint... Is the backend running?` (frontend) | Backend isn't running or is on a different port | Start the backend with `npm start`, confirm it's on port 5000 |
| `CORS` errors in browser console | Backend not running, or frontend pointed at wrong URL | Confirm `API_URL` in `App.jsx` matches your backend port |
| `Gemini API request failed (400)` | Malformed request or invalid API key | Double check the key was copied correctly, no extra spaces |
| `Gemini API request failed (429)` | Rate limit hit (free tier has limits) | Wait a minute and try again, or reduce request frequency |
| One specific agent fails every time (e.g. `Roadmap Agent failed`) | Gemini returned non-JSON text for that prompt | Re-run — occasionally the model ignores the JSON-only instruction; retrying usually fixes it |
| Blank white/unstyled page | Tailwind not installed correctly | Re-run `npm install` in `frontend/`, restart `npm run dev` |

---

## 8. Version 1 Verification Checklist

- [ ] `backend/.env` created with a valid `GEMINI_API_KEY`
- [ ] `npm install` succeeded in both `backend/` and `frontend/`
- [ ] Backend starts cleanly and logs the running port
- [ ] Frontend loads at the Vite dev URL with dark-mode styling visible
- [ ] Typing an idea and clicking **Generate Blueprint** shows the loading
      checklist
- [ ] All 8 dashboard cards render with real (non-empty) content
- [ ] Submitting an empty idea shows a validation error instead of crashing
- [ ] Stopping the backend and clicking Generate shows a friendly error
      message instead of a blank screen

Once every box is checked, Version 1 is confirmed working and you're ready
to plan Version 2 (auth, Supabase, history, PDF export, idea scoring,
budget estimation, risk analysis, external APIs).

---

## 9. Manual Setup Required

- A Gemini API key (free tier is enough for testing) — see step 3 above.
- Node.js 18+ installed (needed for native `fetch` support used in
  `gemini.js`).

---

## Version 2 Additions

V2 is an incremental upgrade on top of V1 — no folder restructuring, no new
required setup steps beyond a fresh `npm install` in `frontend/` (for
`lucide-react`).

**New/changed backend behavior:**
- A 9th agent, the **AI Critic**, runs last and reviews the entire
  blueprint. In one response it also returns the **Startup Score** (6
  metrics + overall), **SWOT Analysis**, **Risk Analysis** (technical/
  business/financial/market, each with severity + mitigation), and
  **Budget Estimation** (prototype/MVP/beta/full product) — one extra
  Gemini call instead of five, to stay lightweight.
- The **Roadmap Agent** now returns 4–6 `milestones` (week + title + tasks)
  instead of flat week1/week2/week3 strings.
- `gemini.js` now retries failed requests automatically with exponential
  backoff (1s → 2s → 4s), up to 3 retries per call.
- If an agent still fails after retries, that section is marked
  `{ error: true, message: "Generation unavailable. Please retry." }` and
  the pipeline **continues** — one bad agent can no longer break the whole
  report.
- `POST /api/generate-blueprint` now streams newline-delimited JSON
  (NDJSON) progress events as each agent starts/finishes/fails, followed by
  a final `{ "type": "result", "data": {...} }` line. This is what powers
  the real (not simulated) "currently running agent" indicator.

**New/changed frontend behavior:**
- `App.jsx` reads the streaming response with `fetch()` + `ReadableStream`
  (axios was removed — it doesn't expose the browser streaming API as
  simply) and updates the loading UI live as real events arrive.
- `LoadingTimeline.jsx` now reflects real backend state (pending / running
  / done / failed per agent) instead of a timer, and includes the 9th "AI
  Critic" step.
- `BlueprintDashboard.jsx` gained: an animated Startup Score board, a
  4-quadrant SWOT grid, a Risk Analysis section with severity badges, a
  Budget Estimation grid, a milestone-based Roadmap timeline, an AI Critic
  Review card, icons throughout (`lucide-react`), and hover/transition
  polish. Any section whose agent failed shows a friendly "Generation
  unavailable. Please retry." notice instead of breaking the page.

### Version 2 Verification Checklist

- [ ] `npm install` re-run in `frontend/` (picks up `lucide-react`)
- [ ] Backend and frontend both start with no console errors
- [ ] Generating a blueprint shows the loading list ticking through all
      **9** steps in real time, with a "Currently running: ___" line that
      updates as each agent actually completes (not on a fixed timer)
- [ ] Dashboard renders: Startup Score bars, SWOT (4 cards), Risk Analysis
      (4 categories with Low/Medium/High badges + mitigation), Budget
      Estimation (4 stages), the new milestone-based Roadmap timeline, and
      the AI Critic Review at the bottom
- [ ] Temporarily set `GEMINI_API_KEY` to an invalid value, generate a
      blueprint, and confirm: the backend logs retry attempts (1s/2s/4s
      backoff) in the terminal, the app does **not** crash, and every
      section shows "Generation unavailable. Please retry." instead of a
      blank/broken card
- [ ] Restore the valid key and confirm a normal run still works end-to-end
- [ ] Existing V1 functionality (idea input, validation error on empty
      idea, all original 7 dashboard cards) still works unchanged

## Notes on Architecture Decisions

- **Sequential, not parallel agents:** agents run one after another via a
  simple `for` loop in `agents.js`, matching the "autonomous workflow, not
  chatbot" requirement and making failures easy to trace.
- **Fake-but-honest loading animation:** because the backend returns one
  final JSON blob (no streaming), the frontend's step-by-step checklist is
  a timed animation, not a live progress feed. This is called out directly
  in `LoadingTimeline.jsx`'s comments so it's not mistaken for real-time
  status in a future version.
- **Why so few files:** every file that would only ever be imported once
  (Navbar, Hero, IdeaInput, Footer, the orchestrator) was kept inline in
  its parent file instead of split out, per the hackathon-simplicity rules.