// Frontend/src/lib/screenshotSlidesConfig.js
// ---------------------------------------------------------------------------
// Central Configuration for Homepage Screenshot Slideshow
//
// HOW TO CHANGE SCREENSHOTS IN THE FUTURE (Without touching component logic/CSS):
//   Option 1: Replace the .png file directly inside `Frontend/public/screenshots/`
//             using the same filename (e.g., `overview.png`).
//   Option 2: Update the image path in `SCREENSHOT_IMAGES` below if you use a
//             new filename (e.g., `/screenshots/new-overview.webp`) or external URL.
// ---------------------------------------------------------------------------
import {
  Crosshair,
  FolderKanban,
  Rocket,
  ShieldCheck,
  Swords,
  Wallet,
} from "lucide-react";

export const SCREENSHOT_IMAGES = {
  workspace: "/screenshots/workspace.png",
  overview: "/screenshots/overview.png",
  vcDebate: "/screenshots/vc-debate.png",
  market: "/screenshots/market-simulator.png",
  finances: "/screenshots/financials.png",
  gtm: "/screenshots/gtm-kit.png",
};

export const SLIDES = [
  {
    id: "workspace",
    label: "Studio",
    icon: FolderKanban,
    tag: "Workspace",
    title: "Every venture, in one place.",
    desc: "Your saved blueprints, viability trends and a one-click path to a new analysis, all inside a private founder vault.",
    points: ["Saved ventures", "Viability at a glance", "Export to PDF"],
    url: "launchpilot.ai/app",
    image: SCREENSHOT_IMAGES.workspace,
  },
  {
    id: "overview",
    label: "Overview",
    icon: ShieldCheck,
    tag: "Stage 1 of 7",
    title: "Know in seconds if it’s worth building.",
    desc: "A calibrated viability score, the problem and solution in plain English, and a founder brief you can act on this week.",
    points: ["Viability score", "Problem and solution", "First-week priority"],
    url: "launchpilot.ai/app/overview",
    image: SCREENSHOT_IMAGES.overview,
  },
  {
    id: "vc-debate",
    label: "War Room",
    icon: Swords,
    tag: "Stage 2 of 7",
    title: "Argued from both sides.",
    desc: "Three AI models debate your idea. One defends the upside, one attacks the risks, and a judge delivers the ruling.",
    points: ["The bull case", "The bear case", "The judge’s ruling"],
    url: "launchpilot.ai/app/war-room",
    image: SCREENSHOT_IMAGES.vcDebate,
  },
  {
    id: "market",
    label: "Market",
    icon: Crosshair,
    tag: "Stage 4 of 7",
    title: "See who you’re up against.",
    desc: "SWOT, Porter’s five forces and a competitor matrix that shows exactly where incumbents are weak.",
    points: ["SWOT matrix", "Five forces", "Competitor wedges"],
    url: "launchpilot.ai/app/market",
    image: SCREENSHOT_IMAGES.market,
  },
  {
    id: "finances",
    label: "Financials",
    icon: Wallet,
    tag: "Stage 6 of 7",
    title: "Test your numbers before you build.",
    desc: "Move the price and the customer count and watch revenue, margin and break-even update live.",
    points: ["Live simulator", "Break-even", "ARR milestones"],
    url: "launchpilot.ai/app/financials",
    image: SCREENSHOT_IMAGES.finances,
  },
  {
    id: "gtm",
    label: "Launch",
    icon: Rocket,
    tag: "Stage 7 of 7",
    title: "Walk in with the copy already written.",
    desc: "Channel plans, outreach templates and posts for Reddit, LinkedIn and X, plus a launch checklist you can tick off.",
    points: ["Outreach templates", "Channel plan", "Launch checklist"],
    url: "launchpilot.ai/app/go-to-market",
    image: SCREENSHOT_IMAGES.gtm,
  },
];
