// lib/ventureComparisonEngine.js
// ---------------------------------------------------------------------------
// Comprehensive Venture Comparison Intelligence Engine
// Evaluates two startup ventures head-to-head across 24+ deep metrics,
// categorized into 6 core dimensions:
// 1. Market Dynamics & Revenue Mechanics
// 2. Customer Acquisition & Go-To-Market (GTM)
// 3. Technical Execution & Operational Velocity
// 4. Moat, Defensibility & Incumbent Threat
// 5. Founder Pitfalls, Disadvantages & Fatal Traps (Red Flag Radar)
// 6. Strategic Persona-Weighted Ruling & 30-Day Execution Roadmap
// ---------------------------------------------------------------------------

// --- Curated Benchmark Archetypes ---
export const BENCHMARK_VENTURES = [
  {
    id: "bench-contract-auditor",
    isBenchmark: true,
    idea: "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically against industry norms.",
    title: "B2B AI Contract Auditor",
    category: "Enterprise B2B SaaS",
    blueprint: {
      ideaAnalysis: {
        viabilityScore: 88,
        marketSize: { tam: "$14.2B", sam: "$2.8B", som: "$140M" },
        targetAudience: "General Counsels, Procurement Officers, CFOs at Mid-Market Enterprises",
      },
      viabilityScorecard: {
        score: 88,
        marketDemandScore: 91,
        technicalFeasibilityScore: 84,
        monetizationScore: 89,
        verdict: "Proceed with High Conviction",
        verdictReasoning: "Contract review is a painful, non-discretionary line item with clear ROI. Enterprise willingness to pay is exceptionally high.",
        fatalRiskTraps: [
          "Enterprise procurement approval cycles dragging past 90 days before first pilot payment.",
          "High liability exposure if the AI misses an indemnification clause in a major MSA.",
          "Strict SOC2 Type II and customer data privacy compliance barriers before legal teams allow file uploads."
        ]
      },
      aiDebate: {
        bull: {
          partnerName: "Groq Llama 3.3 70B",
          convictionScore: 92,
          thesis: "CFOs spend millions on external legal retainers just for routine compliance audits. An instant redline tool pays for itself on contract #1.",
          wedge: "Free automated audit of top 3 vendor agreements with instant benchmark score."
        },
        bear: {
          partnerName: "DeepSeek V3",
          skepticismScore: 84,
          thesis: "Legal departments are notoriously conservative. If Ironclad or DocuSign roll this into their core suite, standalones get squeezed.",
          fatalFlaws: [
            "Heavy liability and indemnity requirements from Fortune 500 legal teams.",
            "Long sales cycles drain seed capital before contract closes."
          ]
        },
        judge: {
          ruling: "Clear enterprise winner if focused on mid-market SaaS vendors with sub-30 day sales cycles."
        }
      },
      revenueSimulator: {
        breakEvenUsers: 45,
        monthlyTotalUsd: 110,
        arpuMonthlyUsd: 499
      }
    }
  },
  {
    id: "bench-llm-cache",
    isBenchmark: true,
    idea: "A high-performance in-memory semantic cache for LLMs that cuts OpenAI and Anthropic token bills by 70% with sub-millisecond p99 latency.",
    title: "LLM Semantic Cache & Router",
    category: "Developer Tools & Infra",
    blueprint: {
      ideaAnalysis: {
        viabilityScore: 86,
        marketSize: { tam: "$8.4B", sam: "$1.9B", som: "$95M" },
        targetAudience: "AI Engineers, Full-Stack Developers, CTOs of AI Startups",
      },
      viabilityScorecard: {
        score: 86,
        marketDemandScore: 94,
        technicalFeasibilityScore: 78,
        monetizationScore: 82,
        verdict: "Proceed — High Velocity",
        verdictReasoning: "Urgent engineering pain point as token bills skyrocket. Frictionless self-serve developer adoption.",
        fatalRiskTraps: [
          "Hyperscalers (AWS Bedrock, Cloudflare AI Gateway) releasing zero-cost caching natively.",
          "High technical bar for sub-millisecond vector indexing across millions of fuzzy queries.",
          "Developers self-hosting open-source alternatives like Redis or Momento instead of paying."
        ]
      },
      aiDebate: {
        bull: {
          partnerName: "Groq Llama 3.3 70B",
          convictionScore: 90,
          thesis: "Every Series A AI startup has a $20k/mo OpenAI invoice. Halving that bill is an immediate no-brainer purchase.",
          wedge: "One-line SDK drop-in that displays live dollars saved in the developer dashboard."
        },
        bear: {
          partnerName: "DeepSeek V3",
          skepticismScore: 79,
          thesis: "Cloudflare and Portkey already offer gateways. Commodity pricing pressure will push margins down rapidly.",
          fatalFlaws: [
            "Rapid commoditization of basic semantic caching proxies.",
            "Developers churn if latency spikes by even 10ms."
          ]
        },
        judge: {
          ruling: "Win on ultra-low latency and enterprise privacy guardrails rather than generic caching."
        }
      },
      revenueSimulator: {
        breakEvenUsers: 90,
        monthlyTotalUsd: 280,
        arpuMonthlyUsd: 149
      }
    }
  },
  {
    id: "bench-dental-receptionist",
    isBenchmark: true,
    idea: "An autonomous voice and chat receptionist for dental clinics that conducts insurance pre-checks, books appointments, and triages emergencies.",
    title: "Dental Voice Intake Agent",
    category: "Vertical AI / SMB Service",
    blueprint: {
      ideaAnalysis: {
        viabilityScore: 84,
        marketSize: { tam: "$5.6B", sam: "$1.2B", som: "$60M" },
        targetAudience: "Private Dental Practices, Orthodontists, Multi-location Dental Groups",
      },
      viabilityScorecard: {
        score: 84,
        marketDemandScore: 86,
        technicalFeasibilityScore: 80,
        monetizationScore: 92,
        verdict: "Proceed — Sticky SMB Cashflow",
        verdictReasoning: "Staffing shortages in dental offices make missed calls a massive revenue leak ($800 lost per missed new patient).",
        fatalRiskTraps: [
          "Fragmented Practice Management Systems (Dentrix, Eaglesoft) with archaic on-premise databases.",
          "HIPAA patient privacy compliance and clinical misinformation liability during emergency triage.",
          "High clinic staff resistance to AI taking over front-desk patient interactions."
        ]
      },
      aiDebate: {
        bull: {
          partnerName: "Groq Llama 3.3 70B",
          convictionScore: 88,
          thesis: "Each missed call costs a dental practice an average of $850 in lifetime patient value. Charging $299/mo is an effortless ROI.",
          wedge: "After-hours voicemail replacement that schedules real appointments while the office is closed."
        },
        bear: {
          partnerName: "DeepSeek V3",
          skepticismScore: 82,
          thesis: "Dentists do not answer cold emails. Outbound customer acquisition will be agonizingly slow and human-intensive.",
          fatalFlaws: [
            "Legacy dental software integration nightmares.",
            "High churn if voice bot stumbles on accents or dental jargon."
          ]
        },
        judge: {
          ruling: "Huge cash cow if sold through dental office consultants and DSO partner channels."
        }
      },
      revenueSimulator: {
        breakEvenUsers: 35,
        monthlyTotalUsd: 180,
        arpuMonthlyUsd: 349
      }
    }
  },
  {
    id: "bench-fitness-stakes",
    isBenchmark: true,
    idea: "A social micro-community mobile app that pairs solo gym lifters with accountability buddies with forfeit deposit stakes for missed workouts.",
    title: "Fitness Stakes App",
    category: "Consumer Mobile / Micro-Wagers",
    blueprint: {
      ideaAnalysis: {
        viabilityScore: 74,
        marketSize: { tam: "$3.1B", sam: "$450M", som: "$25M" },
        targetAudience: "Fitness Enthusiasts, Gym Goers, Self-Improvement Seekers (Ages 18–35)",
      },
      viabilityScorecard: {
        score: 74,
        marketDemandScore: 80,
        technicalFeasibilityScore: 92,
        monetizationScore: 68,
        verdict: "Proceed with Caution — Retention Trap",
        verdictReasoning: "Strong viral appeal and initial curiosity, but high natural churn common to consumer fitness products after 60 days.",
        fatalRiskTraps: [
          "Gambling and lottery regulatory scrutiny regarding financial stakes and forfeited deposits in certain jurisdictions.",
          "Severe churn after 60 days as user novelty wears off (gym dropout effect).",
          "High mobile app store customer acquisition costs eating up thin subscription margins."
        ]
      },
      aiDebate: {
        bull: {
          partnerName: "Groq Llama 3.3 70B",
          convictionScore: 78,
          thesis: "Loss aversion is 2.5x more psychologically powerful than positive reinforcement. Financial stakes create viral TikTok loops.",
          wedge: "7-Day Gym Streak Challenge with $10 pot."
        },
        bear: {
          partnerName: "DeepSeek V3",
          skepticismScore: 89,
          thesis: "Pact (formerly GymPact) raised millions and failed with this exact model because verifying real workouts without fraud was impossible.",
          fatalFlaws: [
            "Fraudulent gym check-ins via spoofed GPS or stock gym selfie photos.",
            "Aggressive chargebacks and dispute fees from angry users who forfeit money."
          ]
        },
        judge: {
          ruling: "Fun consumer wedge, but high regulatory and retention landmines compared to B2B."
        }
      },
      revenueSimulator: {
        breakEvenUsers: 480,
        monthlyTotalUsd: 95,
        arpuMonthlyUsd: 14
      }
    }
  },
  {
    id: "bench-email-guardian",
    isBenchmark: true,
    idea: "An AI cold email deliverability and reputation guardian that monitors domain health, detects spam trap triggers, and fixes mailbox reputation.",
    title: "AI Cold Outreach Guardian",
    category: "B2B Sales Tech / Micro-SaaS",
    blueprint: {
      ideaAnalysis: {
        viabilityScore: 83,
        marketSize: { tam: "$4.1B", sam: "$890M", som: "$45M" },
        targetAudience: "Outbound Sales Agencies, B2B Founders, SDR Leaders",
      },
      viabilityScorecard: {
        score: 83,
        marketDemandScore: 89,
        technicalFeasibilityScore: 88,
        monetizationScore: 84,
        verdict: "Proceed — Fast Cashflow",
        verdictReasoning: "Google and Yahoo’s 2024 spam policies ruined cold outbound deliverability. Urgent high-frequency pain point.",
        fatalRiskTraps: [
          "Google and Microsoft constantly altering spam detection algorithms without documentation.",
          "Platform risk if major ESPs ban programmatic mailbox warming APIs outright.",
          "High competition from established email tools (Instantly, Smartlead) expanding into reputation."
        ]
      },
      revenueSimulator: {
        breakEvenUsers: 65,
        monthlyTotalUsd: 120,
        arpuMonthlyUsd: 79
      }
    }
  },
  {
    id: "bench-packaging-marketplace",
    isBenchmark: true,
    idea: "A multi-vendor B2B wholesale marketplace connecting sustainable packaging manufacturers directly with direct-to-consumer e-commerce brands.",
    title: "Sustainable Packaging Exchange",
    category: "B2B Marketplace",
    blueprint: {
      ideaAnalysis: {
        viabilityScore: 76,
        marketSize: { tam: "$48B", sam: "$6.5B", som: "$320M" },
        targetAudience: "D2C Brand Founders, Supply Chain Directors, Eco-Packaging Factories",
      },
      viabilityScorecard: {
        score: 76,
        marketDemandScore: 82,
        technicalFeasibilityScore: 74,
        monetizationScore: 78,
        verdict: "Venture Scale — Cold Start Heavy",
        verdictReasoning: "Massive market with strong ESG tailwinds, but suffers from classic chicken-and-egg marketplace liquidity hurdles.",
        fatalRiskTraps: [
          "Chicken-and-egg liquidity problem: Brands won't browse without suppliers; factories won't onboard without guaranteed order volume.",
          "Platform disintermediation: Buyers and factories taking repeat wholesale orders off-platform to avoid take-rate fees.",
          "High working capital required for escrow and logistics dispute settlements."
        ]
      },
      revenueSimulator: {
        breakEvenUsers: 140,
        monthlyTotalUsd: 350,
        arpuMonthlyUsd: 350
      }
    }
  }
];

// --- Deterministic Domain Heuristics & Extractor ---
export function analyzeVenture(entry) {
  if (!entry) return null;

  const rawIdea = typeof entry === "string" ? entry : (entry.idea || entry.title || "");
  const ideaLower = rawIdea.toLowerCase();
  const bp = entry?.blueprint || {};
  const vScorecard = bp.viabilityScorecard || {};
  const iAnalysis = bp.ideaAnalysis || {};
  const revSim = bp.revenueSimulator || {};
  const debate = bp.aiDebate || {};

  // Detect domain archetype
  const isB2B = /b2b|enterprise|cfo|procurement|legal|saas|contract|vendor|clinic|agency|compliance|invoice|crm|workflow/i.test(rawIdea);
  const isDev = /api|developer|infra|code|github|token|llm|cache|latency|database|deploy|sdk|rag/i.test(rawIdea);
  const isHealth = /dental|clinic|doctor|patient|medical|health|hospital|hipaa|therapy/i.test(rawIdea);
  const isConsumer = /gym|fitness|workout|social|dating|gaming|mobile app|habit|creator|travel|student/i.test(rawIdea);
  const isMarketplace = /marketplace|two-sided|platform|buyers and sellers|vendors and|wholesale|freelance/i.test(rawIdea);
  const isFinance = /payment|fintech|invoice|accounting|tax|bank|credit|lending|wealth/i.test(rawIdea);

  // 1. Overall Viability (0–100)
  const baseViab =
    vScorecard.score ??
    vScorecard.overallScore ??
    iAnalysis.viabilityScore ??
    entry.score ??
    (isB2B ? 86 : isDev ? 85 : isHealth ? 83 : isConsumer ? 75 : 79);
  const overallScore = Math.min(98, Math.max(45, Math.round(Number(baseViab))));

  // Title / Archetype
  const title =
    entry.title ||
    rawIdea.split(/[:\.\n]/)[0].trim().slice(0, 48) ||
    "Startup Venture";

  // Category
  const category =
    entry.category ||
    (isDev ? "Developer Tools & Infra" :
     isHealth ? "Healthcare & Vertical AI" :
     isMarketplace ? "B2B Marketplace" :
     isFinance ? "Fintech & Compliance" :
     isB2B ? "Enterprise B2B SaaS" :
     isConsumer ? "Consumer Tech / Mobile" : "Specialized SaaS");

  // 2. Market Dynamics & TAM
  const tamStr = iAnalysis.marketSize?.tam ||
    (isMarketplace ? "$48B" : isFinance ? "$22B" : isB2B ? "$12.5B" : isDev ? "$9.2B" : isHealth ? "$6.4B" : "$3.8B");
  const growthRate = isDev ? "38% CAGR (Explosive AI tailwind)" :
    isB2B ? "22% CAGR (Enterprise automation wave)" :
    isHealth ? "19% CAGR (Healthcare staffing crunch)" :
    isConsumer ? "14% CAGR (Saturated attention market)" : "18% CAGR (Steady expansion)";

  // Pricing & Economics
  const priceMonthly = revSim.arpuMonthlyUsd ||
    (isB2B ? 399 : isHealth ? 299 : isDev ? 149 : isConsumer ? 15 : isMarketplace ? 450 : 99);
  const pricingModel = isDev ? "Usage-Based ($0.002/req + $149/mo Base)" :
    isB2B ? "Tiered Subscription ($299 - $999/mo)" :
    isHealth ? "Flat Monthly Clinic Fee ($299/mo)" :
    isMarketplace ? "5% Transaction Take-Rate" :
    isConsumer ? "$12–$19/mo Freemium Mobile" : "Seat-based SaaS ($49/seat)";

  const monthlyBurn = revSim.monthlyTotalUsd ||
    (isDev ? 240 : isMarketplace ? 320 : isHealth ? 180 : isB2B ? 110 : 85);

  const breakevenUsers = revSim.breakEvenUsers ||
    Math.max(20, Math.round((monthlyBurn + 500) / (priceMonthly * 0.85)));

  const timeToFirstRevenue = isConsumer ? "1–2 weeks (Immediate In-App Purchase)" :
    isDev ? "2–3 weeks (Self-Serve Credit Card)" :
    isB2B ? "4–6 weeks (Trial to Paid Contract)" :
    isHealth ? "6–8 weeks (Clinic Pilot Onboarding)" : "3–5 weeks";

  const grossMargin = isDev ? "78% (LLM API & Cloud egress costs)" :
    isConsumer ? "70% (App Store 30% take & payment fees)" :
    isMarketplace ? "65% (Payment processing & escrow friction)" :
    isHealth ? "82% (High software automation margin)" : "85% (Pure software SaaS)";

  const capitalTo10kMrr = isConsumer ? "$15,000 - $35,000 (Heavy paid ad spend required)" :
    isMarketplace ? "$25,000 - $50,000 (Liquidity subsidies required)" :
    isHealth ? "$5,000 - $12,000 (Targeted outbound & local travel)" :
    isDev ? "$2,500 - $6,000 (Developer community & organic launch)" :
    "$3,000 - $8,000 (Cold outbound & content marketing)";

  // 3. Customer Acquisition & GTM
  const primaryGtm = isDev ? "Developer GitHub repos, Hacker News, open-source SDK" :
    isB2B ? "LinkedIn Sales Navigator, targeted cold email, industry conferences" :
    isHealth ? "Local clinic cold calling, DSO partnerships, dental supply reps" :
    isConsumer ? "TikTok / Instagram short-form creator hooks, App Store Optimization" :
    isMarketplace ? "Direct manual supplier onboarding before inviting buyers" :
    "Content SEO & Product Hunt launch";

  const salesCycle = isConsumer ? "Instant Self-Serve (< 5 minutes)" :
    isDev ? "Self-Serve to Team Upgrade (3–10 days)" :
    isB2B ? "Mid-Touch B2B (21–45 days)" :
    isHealth ? "Office Manager Demo to Doctor Approval (14–30 days)" :
    isMarketplace ? "Enterprise Supplier Negotiation (30–60 days)" : "14 days";

  const cacPaybackMonths = isConsumer ? 7 : isDev ? 2.5 : isB2B ? 3.5 : isHealth ? 2 : 4;
  const cacExposure = isConsumer ? { level: "Critical", tone: "rose", desc: "Dependent on expensive Meta/Apple ad auctions" } :
    isMarketplace ? { level: "High", tone: "rose", desc: "Must subsidize both sides of transaction" } :
    isB2B ? { level: "Moderate", tone: "amber", desc: "Outbound SDR labor or tooling costs" } :
    isHealth ? { level: "Low-Moderate", tone: "amber", desc: "High conversion once office manager takes demo" } :
    { level: "Low", tone: "emerald", desc: "Organic word-of-mouth & viral dev loops" };

  // 4. Technical Execution & Velocity
  const timeToMvp = isConsumer ? "2–3 weeks (React Native / Flutter prototype)" :
    isDev ? "3–4 weeks (High-performance API proxy with caching layer)" :
    isB2B ? "3–5 weeks (Clean dashboard, auth, document ingestion pipeline)" :
    isHealth ? "4–6 weeks (Voice agent, telephony API, EHR integration)" :
    isMarketplace ? "6–8 weeks (Two-sided listings, Stripe Connect, reviews)" : "3–4 weeks";

  const techComplexity = isDev ? "8 / 10 (Distributed latency & vector consistency)" :
    isHealth ? "8.5 / 10 (Real-time voice telephony, speech-to-text, HIPAA)" :
    isMarketplace ? "7.5 / 10 (Multi-party escrow & inventory synchronization)" :
    isB2B ? "6 / 10 (Standard modern web stack + RAG pipeline)" :
    isConsumer ? "5 / 10 (Mobile UI + Supabase/Firebase backend)" : "6 / 10";

  const operationalDrag = isHealth ? "Moderate (Clinic onboarding, PMS calendar mapping)" :
    isMarketplace ? "High (Resolving fulfillment disputes, vetting suppliers)" :
    isB2B ? "Low-Moderate (Occasional enterprise procurement questionnaires)" :
    isConsumer ? "Low (Automated subscription, user tickets via FAQ)" :
    isDev ? "Very Low (Self-serve API keys & documentation)" : "Low";

  // 5. Moat, Defensibility & Incumbent Threat
  const moatType = isDev ? "Technical & Performance Moat (Sub-millisecond query routing)" :
    isB2B ? "Deep Workflow Integration & Switching Cost (Historical contract audits)" :
    isMarketplace ? "Two-Sided Network Effects (Liquidity defensibility)" :
    isHealth ? "Vertical System of Record & Local Clinical Trust" :
    isConsumer ? "Brand Identity & Community Engagement" : "Custom Data Connectors";

  const wrapperRisk = isDev ? { level: "Medium", desc: "OpenAI or Cloudflare might build basic caching natively" } :
    isB2B ? { level: "Low", desc: "Requires deep enterprise security, legacy formats, and redline workflows" } :
    isHealth ? { level: "Low", desc: "Telephony, PMS integrations, and dental terminology cannot be copied by raw LLMs" } :
    isConsumer ? { level: "High", desc: "Easy for copycats to launch clone apps in days" } :
    isMarketplace ? { level: "Negligible", desc: "Marketplace liquidity and real suppliers cannot be copied by an AI" } :
    { level: "Medium", desc: "Needs continuous proprietary workflow depth" };

  const switchingCost = isB2B ? "High (Historical audits, team permissions, legal compliance history)" :
    isHealth ? "High (Staff reluctant to retrain on new telephone system)" :
    isMarketplace ? "Very High once liquidity forms, zero before liquidity" :
    isDev ? "Moderate (SDK change takes 10 lines of code, but telemetry is sticky)" :
    isConsumer ? "Low (Users cancel gym apps on a whim)" : "Moderate";

  // 6. Founder Pitfalls, Disadvantages & Fatal Traps (Crucial!)
  const fatalTraps = vScorecard.fatalRiskTraps?.length ? vScorecard.fatalRiskTraps : [
    isB2B ? "Enterprise procurement legal approval dragging beyond 90 days." :
    isDev ? "Foundational model providers releasing native zero-cost equivalents." :
    isHealth ? "Legacy dental desktop software blocking API data syncing." :
    isConsumer ? "Rapid subscriber churn after novelty fades in months 2 and 3." :
    isMarketplace ? "Buyers and suppliers bypassing platform fees for offline transactions." :
    "Customer churn due to shallow differentiation."
  ];

  const disadvantages = isConsumer ? [
    { title: "Brutal Customer Churn", desc: "Average consumer fitness app loses 70% of paid users within 90 days. High CAC requires constant re-acquisition.", severity: "critical" },
    { title: "No Corporate Budget", desc: "Paid out of personal pocketbooks, making it the first subscription cancelled when users tighten budgets.", severity: "high" },
    { title: "Wager & Gambling Regulation", desc: "Financial forfeiture mechanisms trigger legal classification issues in select US states and countries.", severity: "medium" }
  ] : isDev ? [
    { title: "Aggressive Open-Source Cannibalization", desc: "Developers pride themselves on building lightweight internal tools. If Redis or Momento ships this free, conversion drops.", severity: "high" },
    { title: "Zero Latency Tolerance", desc: "A 20ms network hiccup in your cache proxy directly slows down the developer's entire app, risking public Twitter outrage.", severity: "high" },
    { title: "Developer Sales Cynicism", desc: "Devs actively block marketing trackers and despise high-pressure sales; you must win entirely on docs and DX.", severity: "medium" }
  ] : isHealth ? [
    { title: "Legacy On-Prem Database Jail", desc: "Older clinics run Dentrix/Eaglesoft on local Windows servers with no REST APIs, requiring brittle desktop bridge agents.", severity: "critical" },
    { title: "HIPAA Liability & Clinical Risk", desc: "If the AI bot misclassifies an abscess as a routine toothache, liability falls on the provider and software vendor.", severity: "high" },
    { title: "Doctors Do Not Check Inboxes", desc: "Reaching dentists requires physical drop-ins, direct mail, or trade shows because receptionists gatekeep phone lines.", severity: "medium" }
  ] : isMarketplace ? [
    { title: "Chicken-and-Egg Cold Start Deficit", desc: "Suppliers refuse to upload inventory without live orders; buyers refuse to visit without guaranteed inventory.", severity: "critical" },
    { title: "Platform Disintermediation Leakage", desc: "Once a buyer finds a reliable packaging factory, they take all future $20,000 repeat orders direct via wire transfer.", severity: "critical" },
    { title: "Working Capital & Dispute Squeeze", desc: "When a shipment arrives damaged, the platform gets blamed and must escrow thousands of dollars to arbitrate.", severity: "high" }
  ] : [
    { title: "Sales Cycle Fatigue", desc: "Enterprise decisions involve legal, compliance, and IT security reviews that easily stretch 3 to 6 months.", severity: "high" },
    { title: "Strict Compliance Overhead", desc: "Enterprises will refuse proof-of-concept trials until you provide SOC2 Type II certification and DPA contracts.", severity: "medium" },
    { title: "Incumbent Feature Bundling", desc: "Existing legacy players (Salesforce, Microsoft, DocuSign) can bundle a 70% solution for free with enterprise suites.", severity: "high" }
  ];

  const mitigations = isConsumer ? [
    "Introduce team stakes (competing with friends) rather than solo wagers to build viral social retention.",
    "Charge annual upfront memberships rather than monthly to guarantee 12-month LTV upfront.",
    "Partner with corporate wellness benefits managers (B2B2C) where employers sponsor the prize pool."
  ] : isDev ? [
    "Open-source the core proxy runtime to capture mindshare, then monetize private cloud telemetry and automated cache warming.",
    "Provide multi-region edge deployment (Cloudflare Workers / AWS Lambda@Edge) to guarantee sub-5ms p99 response times.",
    "Offer transparent cost-savings dashboard displaying exact dollars saved vs OpenAI raw bills."
  ] : isHealth ? [
    "Start by targeting modern cloud-first dental practices running Dentrix Ascend or Curve Dental to avoid desktop legacy sync.",
    "Position as 'After-Hours Safety Net' initially (when front desk is closed), minimizing staff replacement friction.",
    "Bundle a clear Business Associate Agreement (BAA) with end-to-end encrypted voice logs."
  ] : isMarketplace ? [
    "Guarantee Net-30 payment financing for buyers (factoring) and instant payout for suppliers so neither party wants to leave.",
    "Offer customized custom packaging CAD mockups and automated sample ordering inside the platform.",
    "Seed initial supply by partnering with 10 vetted factories on guaranteed volume contracts."
  ] : [
    "Target hungry mid-market companies (50–300 employees) with no formal procurement bureau to close in under 3 weeks.",
    "Offer a zero-risk 14-day automated audit on past contracts with no integration required to prove instant ROI.",
    "Use SOC2 Type I as a fast stepping-stone and partner with Vanta/Drata for streamlined compliance audits."
  ];

  // 7. Persona-Weighted Scores
  // Bootstrapper: favors low capital, fast cash, low complexity, low regulatory friction
  const bootstrapperScore = Math.round(
    overallScore * 0.35 +
    (isB2B ? 88 : isDev ? 92 : isHealth ? 80 : isConsumer ? 62 : 75) * 0.35 +
    (cacExposure.level === "Low" ? 95 : cacExposure.level === "Low-Moderate" ? 82 : cacExposure.level === "Moderate" ? 70 : 45) * 0.30
  );

  // Venture Scale: favors massive TAM, network effects, high moat, high contract value
  const ventureScaleScore = Math.round(
    overallScore * 0.30 +
    (isMarketplace ? 94 : isB2B ? 90 : isHealth ? 85 : isDev ? 82 : 65) * 0.40 +
    (switchingCost.startsWith("Very High") ? 95 : switchingCost.startsWith("High") ? 88 : 65) * 0.30
  );

  // Fast Wedge: velocity to MVP, fast sales cycle
  const fastWedgeScore = Math.round(
    (isDev ? 94 : isB2B ? 84 : isConsumer ? 88 : isHealth ? 72 : 65) * 0.5 +
    (timeToMvp.includes("2–3") ? 95 : timeToMvp.includes("3–4") ? 86 : 70) * 0.5
  );

  return {
    id: entry.id || `v-${Math.random().toString(36).slice(2, 7)}`,
    rawIdea,
    title,
    category,
    overallScore,
    tamStr,
    growthRate,
    priceMonthly,
    pricingModel,
    monthlyBurn,
    breakevenUsers,
    timeToFirstRevenue,
    grossMargin,
    capitalTo10kMrr,
    primaryGtm,
    salesCycle,
    cacExposure,
    cacPaybackMonths,
    timeToMvp,
    techComplexity,
    operationalDrag,
    moatType,
    wrapperRisk,
    switchingCost,
    fatalTraps,
    disadvantages,
    mitigations,
    bootstrapperScore,
    ventureScaleScore,
    fastWedgeScore,
    debate: {
      bull: debate.bull || { thesis: "High demand wedge with defensible economics." },
      bear: debate.bear || { thesis: "Execution landmines must be navigated with strict discipline." },
      judge: debate.judge || { ruling: "Focus on rapid customer validation before over-engineering." }
    }
  };
}

// --- Head-to-Head Comparative Verdict Engine ---
export function compareTwoVentures(vAInput, vBInput, persona = "all") {
  const a = analyzeVenture(vAInput);
  const b = analyzeVenture(vBInput);

  if (!a || !b) return null;

  // Determine scores based on active persona
  let scoreA = a.overallScore;
  let scoreB = b.overallScore;

  if (persona === "bootstrapper") {
    scoreA = a.bootstrapperScore;
    scoreB = b.bootstrapperScore;
  } else if (persona === "venture") {
    scoreA = a.ventureScaleScore;
    scoreB = b.ventureScaleScore;
  } else if (persona === "fast") {
    scoreA = a.fastWedgeScore;
    scoreB = b.fastWedgeScore;
  }

  const scoreDiff = Math.abs(scoreA - scoreB);
  const winnerIsA = scoreA >= scoreB;
  const winner = winnerIsA ? a : b;
  const runnerUp = winnerIsA ? b : a;

  // Build high-conviction strategic ruling
  let headline = `Build “${winner.title}” First`;
  let subheadline = `Superior risk-adjusted traction trajectory with ${scoreDiff > 0 ? `+${scoreDiff} pts` : "tighter"} execution fundamentals.`;

  let verdictDetails = [];

  // Comparison callouts
  if (winner.breakevenUsers < runnerUp.breakevenUsers) {
    const diff = runnerUp.breakevenUsers - winner.breakevenUsers;
    verdictDetails.push(
      `Reaches financial breakeven with ${diff.toLocaleString()} fewer customers (${winner.breakevenUsers} vs ${runnerUp.breakevenUsers}), dramatically reducing early runway pressure.`
    );
  }

  if (winner.priceMonthly > runnerUp.priceMonthly * 1.5) {
    verdictDetails.push(
      `Commands significantly higher ACV ($${winner.priceMonthly}/mo vs $${runnerUp.priceMonthly}/mo), giving you higher gross revenue per customer acquisition effort.`
    );
  }

  if (winner.cacExposure.level === "Low" || winner.cacExposure.level === "Low-Moderate") {
    verdictDetails.push(
      `Lower CAC exposure (${winner.cacExposure.level}) shields your bank account from paid ad auction inflation.`
    );
  }

  if (winner.wrapperRisk.level === "Low" && runnerUp.wrapperRisk.level !== "Low") {
    verdictDetails.push(
      `Significantly lower AI wrapper risk because it relies on deep proprietary workflow integrations rather than generic prompt passing.`
    );
  }

  if (verdictDetails.length === 0) {
    verdictDetails.push(
      `Better founder-market leverage and faster path to proof-of-concept testing.`
    );
  }

  // Next 30 Days Action Plan for Winner
  const sprintRoadmap = [
    {
      week: "Week 1",
      focus: "Customer Pain Discovery",
      action: `Conduct 15 targeted problem interviews with ${winner.category} buyers. Validate willingness to pay before writing any software.`
    },
    {
      week: "Week 2",
      focus: "Concierge / Mock MVP",
      action: `Build clickable prototype or run manual concierge service to deliver the core value proposition for 3 pilot users.`
    },
    {
      week: "Week 3",
      focus: "Letter of Intent (LOI) or Deposit",
      action: `Secure at least 2 paid pre-orders or signed pilot agreements at $${winner.priceMonthly}/mo.`
    },
    {
      week: "Week 4",
      focus: "Sprint 1 MVP Launch",
      action: `Ship core automated v1 in ${winner.timeToMvp} and integrate the primary distribution channel (${winner.primaryGtm.split(",")[0]}).`
    }
  ];

  return {
    ventureA: a,
    ventureB: b,
    persona,
    winner,
    runnerUp,
    winnerIsA,
    scoreA,
    scoreB,
    scoreDiff,
    headline,
    subheadline,
    verdictDetails,
    sprintRoadmap
  };
}

// --- Export Comparison to Markdown ---
export function exportComparisonMarkdown(comparisonResult) {
  if (!comparisonResult) return "";
  const { ventureA: a, ventureB: b, winner, runnerUp, winnerIsA, headline, verdictDetails, sprintRoadmap } = comparisonResult;

  return `# LaunchPilot Venture Duel: ${a.title} vs ${b.title}
*Generated on ${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} by LaunchPilot Strategic Decision Engine*

---

## 🏆 Strategic Co-Founder Verdict
### **${headline}**
> ${comparisonResult.subheadline}

**Key Winning Factors:**
${verdictDetails.map((v) => `- ${v}`).join("\n")}

- **Venture A Score:** ${comparisonResult.scoreA}/100 (${a.title})
- **Venture B Score:** ${comparisonResult.scoreB}/100 (${b.title})

---

## 📊 Side-by-Side Vital Signs Comparison

| Factor / Dimension | Venture A: ${a.title} | Venture B: ${b.title} | Advantage |
| :--- | :--- | :--- | :--- |
| **Category** | ${a.category} | ${b.category} | — |
| **Viability Score** | **${a.overallScore}/100** | **${b.overallScore}/100** | ${a.overallScore >= b.overallScore ? "Venture A" : "Venture B"} |
| **Target ACV / Pricing** | $${a.priceMonthly}/mo (${a.pricingModel}) | $${b.priceMonthly}/mo (${b.pricingModel}) | ${a.priceMonthly >= b.priceMonthly ? "Venture A (Higher ACV)" : "Venture B (Higher ACV)"} |
| **Breakeven Volume** | **${a.breakevenUsers} customers** | **${b.breakevenUsers} customers** | ${a.breakevenUsers <= b.breakevenUsers ? "Venture A (Faster)" : "Venture B (Faster)"} |
| **Monthly Cloud Burn** | $${a.monthlyBurn}/mo | $${b.monthlyBurn}/mo | ${a.monthlyBurn <= b.monthlyBurn ? "Venture A" : "Venture B"} |
| **Time to First Revenue** | ${a.timeToFirstRevenue} | ${b.timeToFirstRevenue} | — |
| **Sprint 1 MVP Build Time** | ${a.timeToMvp} | ${b.timeToMvp} | — |
| **Technical Complexity** | ${a.techComplexity} | ${b.techComplexity} | — |
| **CAC Exposure Risk** | ${a.cacExposure.level} (${a.cacPaybackMonths}mo payback) | ${b.cacExposure.level} (${b.cacPaybackMonths}mo payback) | — |
| **Primary GTM Channel** | ${a.primaryGtm} | ${b.primaryGtm} | — |
| **Moat Type** | ${a.moatType} | ${b.moatType} | — |
| **AI Wrapper Risk** | ${a.wrapperRisk.level} | ${b.wrapperRisk.level} | ${a.wrapperRisk.level === "Low" ? "Venture A (Defensible)" : "Venture B"} |
| **Capital to $10k MRR** | ${a.capitalTo10kMrr} | ${b.capitalTo10kMrr} | — |

---

## ⚠️ Red Flag Radar: Founder Pitfalls & Disadvantages

### Venture A Disadvantages (${a.title}):
${a.disadvantages.map((d) => `- **${d.title}** [${d.severity.toUpperCase()}]: ${d.desc}`).join("\n")}

**Mitigation Tactics for Venture A:**
${a.mitigations.map((m) => `1. ${m}`).join("\n")}

### Venture B Disadvantages (${b.title}):
${b.disadvantages.map((d) => `- **${d.title}** [${d.severity.toUpperCase()}]: ${d.desc}`).join("\n")}

**Mitigation Tactics for Venture B:**
${b.mitigations.map((m) => `1. ${m}`).join("\n")}

---

## 🚀 Recommended 30-Day Execution Roadmap for Winner (${winner.title})
${sprintRoadmap.map((s) => `### ${s.week}: ${s.focus}\n${s.action}`).join("\n\n")}

---
*Built with LaunchPilot — Automated Startup Copilot & Strategic VC War Room.*
`;
}
