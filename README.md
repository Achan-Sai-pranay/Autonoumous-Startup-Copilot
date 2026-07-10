# LaunchPilot AI — Version 3 (Execution Mode, Cleaned)

**Your Autonomous AI Co-Founder.** Enter a startup idea, click one button,
and 13 AI agents run in sequence to produce a focused startup blueprint
including go‑to‑market, launch checklist, cost/revenue simulation, and
competitor weakness analysis.

---

## 1. Complete Folder Structure

```
launchpilot-ai/
├── backend/
│   ├── server.js          # Express app + the one API route
│   ├── agents.js          # All agent prompts + orchestrator
│   ├── gemini.js          # Gemini API wrapper
│   ├── grok.js            # Grok API wrapper (not used in current flow)
│   ├── package.json
│   └── .env.example       # copy to .env and add your key
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
└── README.md
```

Total: **12 source files.** No auth, no database, no PDF export, no history — by design.

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

1. Open `http://localhost:5173` — you should see the dark‑mode landing page
   with the hero text and idea input box.
2. Type a simple idea, e.g. `"I want to build an AI platform for placement
   preparation."`
3. Click **Generate Blueprint**.
4. You should see the **13‑step** loading checklist animate.
5. After roughly 20–40 seconds (13 sequential Gemini calls), the full
   dashboard should render with all cards populated.
6. If something breaks, check the **backend terminal** first — it logs the
   exact agent that failed and why.

---

## 7. Version 3 Verification Checklist (Cleaned)

- [ ] `backend/.env` created with a valid `GEMINI_API_KEY`
- [ ] `npm install` succeeded in both `backend/` and `frontend/`
- [ ] Backend starts cleanly and logs the running port
- [ ] Frontend loads at the Vite dev URL with dark‑mode styling visible
- [ ] Typing an idea and clicking **Generate Blueprint** shows the loading
      checklist with **13 steps**
- [ ] All 13 dashboard cards render with real (non‑empty) content
- [ ] Submitting an empty idea shows a validation error instead of crashing
- [ ] Stopping the backend and clicking Generate shows a friendly error
      message instead of a blank screen

Once every box is checked, the cleaned Version 3 is confirmed working.

---

## 8. Removed Features (from original V2/V3)

This cleaned build intentionally removes the following advanced sections
to simplify the application:

- AI Critic Review (including Startup Score, SWOT, Risk Analysis, Budget Estimation)
- Execution Plan (Today/Tomorrow tasks)
- Startup Difficulty Breakdown
- Build Time Prediction

Only the core planning panels and the execution‑oriented panels listed
below remain.

---

## 9. Version 3 Additions — Execution Mode (Kept)

V3 turns LaunchPilot from an advisor into an execution platform: the
following sections tell the founder exactly what to do next. Still just
**1 Gemini API call per blueprint** — the new sections are additional keys
in the same mega‑prompt/response, not additional requests.

**Kept backend behavior:**
- The mega‑prompt in `agents.js` now covers 13 roles: the original 8
  planning agents (Idea Analysis, Market Research, Customer Persona,
  Product Plan, Technical Architecture, Business Strategy, Pitch Generation,
  Roadmap) plus 5 execution roles:
  * Go‑to‑Market Engineer
  * Launch Operations Lead
  * Finance: Cost Estimator
  * Finance: Revenue Simulator
  * Competitive Strategist
- `STEPS` now supports multiple JSON keys per progress step (e.g. "Cost &
  Revenue" covers both `costEstimator` and `revenueSimulator`), so the
  progress checklist stays at a readable 13 items.
- `gemini.js` sets `maxOutputTokens` explicitly to accommodate the
  combined response.

**Kept frontend behavior (in `BlueprintDashboard.jsx`):**
- **Go‑to‑Market Strategy** — target audience, recommended platforms with
  reasoning, LinkedIn search queries, and 4 copy‑paste‑ready templates
  (cold email, LinkedIn DM, Reddit post, X post) with one‑click copy
  buttons.
- **Launch Checklist** — interactive checkboxes (in‑memory state; resets on
  refresh, consistent with the "no database" rule).
- **Cost Estimator + Revenue Simulator** — per‑service monthly cost cards
  with a "Free tier OK" badge, plus total monthly/yearly estimates and a
  projection table at 100/500/1000/5000 users.
- **Competitor Weakness Analysis** — one card per competitor listed in
  Market Research, each with weaknesses, missed opportunities, and suggested
  differentiation.
- Remaining core planning panels (Idea Analysis, Market Research, Customer
  Persona, Product Plan, Technical Architecture, Business Strategy, Pitch,
  Roadmap) render exactly as in V1/V2.

`App.jsx` and `server.js` needed **zero changes** — both were already
written generically enough (iterate over whatever steps/keys the backend
sends) to accept this streamlined set.

---

## 10. Notes on Architecture Decisions

- **Sequential, not parallel agents:** agents run one after another via a
  simple `for` loop in `agents.js`, matching the "autonomous workflow, not
  chatbot" requirement and making failures easy to trace.
- **Fake‑but‑honest loading animation:** because the backend returns one
  final JSON blob (no streaming), the frontend's step‑by‑step checklist is
  a timed animation, not a live progress feed. This is called out directly
  in `LoadingTimeline.jsx`'s comments so it's not mistaken for real‑time
  status in a future version.
- **Why so few files:** every file that would only ever be imported once
  (Navbar, Hero, IdeaInput, Footer, the orchestrator) was kept inline in
  its parent file instead of split out, per the hackathon‑simplicity rules.