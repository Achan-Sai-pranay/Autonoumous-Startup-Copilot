// Frontend/src/lib/cloudPricing.js
// ---------------------------------------------------------------------------
// Real Cloud & Database Provider Cost Engine for LaunchPilot
// Estimates realistic, provider-grounded infrastructure costs as active users scale,
// referencing official pricing from Supabase, AWS, MongoDB Atlas, Vercel, and Render.
// ---------------------------------------------------------------------------

export const CLOUD_PROVIDERS = {
  SUPABASE_VERCEL: {
    id: "SUPABASE_VERCEL",
    name: "Supabase + Vercel",
    tagline: "Modern Serverless & Edge",
    databaseName: "Supabase (PostgreSQL)",
    computeName: "Vercel Serverless & Edge",
    description: "Industry-standard modern stack. Zero-cold-start edge functions with managed Postgres.",
  },
  AWS_PRODUCTION: {
    id: "AWS_PRODUCTION",
    name: "AWS Production",
    tagline: "Amazon RDS + ECS Fargate",
    databaseName: "Amazon RDS PostgreSQL",
    computeName: "AWS ECS Containers + CloudFront",
    description: "Enterprise battle-tested infrastructure. Dedicated container tasks and managed VPC storage.",
  },
  MONGODB_RENDER: {
    id: "MONGODB_RENDER",
    name: "MongoDB Atlas + Render",
    tagline: "Managed Document DB + Cloud",
    databaseName: "MongoDB Atlas Cloud",
    computeName: "Render Container Service",
    description: "Developer-first developer stack. High-velocity setup with automated auto-scaling.",
  },
};

/**
 * Calculates dynamic cloud compute, database, and devops costs based on real provider rates.
 *
 * @param {number} userCount - Active paying/registered users
 * @param {string} providerId - Key in CLOUD_PROVIDERS
 * @param {number} exchangeRate - Active USD to INR exchange rate
 * @param {string} currency - 'INR' | 'USD'
 */
export function calculateCloudCosts(userCount, providerId = "SUPABASE_VERCEL", exchangeRate = 96.8, currency = "INR") {
  const users = Math.max(1, Number(userCount) || 1);
  const rate = typeof exchangeRate === "number" && exchangeRate > 0 ? exchangeRate : 96.8;

  let dbUsd = 0;
  let computeUsd = 0;
  let devopsUsd = 0;
  let dbTier = "";
  let computeTier = "";

  switch (providerId) {
    case "AWS_PRODUCTION": {
      // AWS RDS PostgreSQL pricing:
      // - 1-100 users: db.t4g.micro single-AZ (~$18/mo + 20GB GP3 SSD)
      // - 101-1500 users: db.t4g.small ($32/mo) + storage scaling ($0.012/user)
      // - 1501-5000 users: db.t4g.medium ($64/mo) + storage & IOPS ($0.016/user)
      if (users <= 100) {
        dbUsd = 18;
        dbTier = "AWS RDS db.t4g.micro (1GB RAM, 20GB SSD)";
      } else if (users <= 1500) {
        dbUsd = 32 + (users - 100) * 0.012;
        dbTier = "AWS RDS db.t4g.small (2GB RAM, 50GB SSD)";
      } else {
        dbUsd = 64 + (users - 1500) * 0.016;
        dbTier = "AWS RDS db.t4g.medium (4GB RAM, 100GB SSD)";
      }

      // AWS ECS Fargate + ALB + CloudFront:
      // - Base container task: $25/mo
      // - Bandwidth & API invocations: ~$0.026/user/mo
      computeUsd = 25 + users * 0.026;
      computeTier = "AWS ECS Fargate + CloudFront CDN";

      // S3 + Route53 + CloudWatch logs:
      devopsUsd = 6 + users * 0.009;
      break;
    }

    case "MONGODB_RENDER": {
      // MongoDB Atlas pricing:
      // - 1-100 users: M0 Sandbox Free Tier ($0/mo)
      // - 101-500 users: M2 Shared Tier ($9/mo)
      // - 501-1500 users: M5 Shared Tier ($25/mo)
      // - 1501+ users: M10 Dedicated Tier ($57/mo + $0.014/user storage)
      if (users <= 100) {
        dbUsd = 0;
        dbTier = "MongoDB Atlas M0 (Free Tier, 512MB)";
      } else if (users <= 500) {
        dbUsd = 9;
        dbTier = "MongoDB Atlas M2 (2GB RAM Shared)";
      } else if (users <= 1500) {
        dbUsd = 25;
        dbTier = "MongoDB Atlas M5 (5GB RAM Shared)";
      } else {
        dbUsd = 57 + (users - 1500) * 0.014;
        dbTier = "MongoDB Atlas M10 (Dedicated 10GB SSD)";
      }

      // Render / Railway app hosting:
      // - 1-100 users: Starter ($7/mo)
      // - >100 users: Standard Team ($20/mo + $0.018/user for RAM/egress)
      if (users <= 100) {
        computeUsd = 7;
        computeTier = "Render Starter Instance (512MB RAM)";
      } else {
        computeUsd = 20 + (users - 100) * 0.018;
        computeTier = "Render Team Instance (2GB RAM + CDN)";
      }

      devopsUsd = 4 + users * 0.008;
      break;
    }

    case "SUPABASE_VERCEL":
    default: {
      // Supabase (PostgreSQL) pricing:
      // - 1-100 users: Free Tier ($0/mo, 500MB DB, 2GB egress, 50k MAU)
      // - 101-1000 users: Pro Plan ($25/mo, 8GB DB, 250GB egress)
      // - >1000 users: Pro Plan + Micro Compute add-on ($25 + $0.011/user for extra DB disk & IOPS)
      if (users <= 100) {
        dbUsd = 0;
        dbTier = "Supabase Free Tier (500MB DB, 50k MAU)";
      } else if (users <= 1000) {
        dbUsd = 25;
        dbTier = "Supabase Pro Tier (8GB DB, 250GB Egress)";
      } else {
        dbUsd = 25 + (users - 1000) * 0.011;
        dbTier = "Supabase Pro + Compute Add-on (Auto-scale IOPS)";
      }

      // Vercel Serverless & Edge network:
      // - 1-100 users: Hobby ($0/mo, 100GB bandwidth)
      // - 101-1000 users: Pro ($20/mo, 1TB bandwidth, 1M edge invocations)
      // - >1000 users: Pro ($20 + $0.021/user for fast data transfer & edge invocations)
      if (users <= 100) {
        computeUsd = 0;
        computeTier = "Vercel Hobby Tier (100GB CDN Bandwidth)";
      } else if (users <= 1000) {
        computeUsd = 20;
        computeTier = "Vercel Pro (1TB Fast Egress, Edge Invocations)";
      } else {
        computeUsd = 20 + (users - 1000) * 0.021;
        computeTier = "Vercel Pro Scale (Edge Network + Bandwidth)";
      }

      // DevOps, Auth, Email (Resend/SendGrid) & SSL:
      devopsUsd = users <= 100 ? 0 : 5 + (users > 1000 ? (users - 1000) * 0.008 : 0);
      break;
    }
  }

  // Base floor of at least $10 once past hobby tier to account for domains/certs/logging
  const rawTotalUsd = dbUsd + computeUsd + devopsUsd;
  const totalUsd = Math.max(users <= 50 ? 5 : 12, Math.round(rawTotalUsd));
  const finalDbUsd = Math.round(dbUsd);
  const finalComputeUsd = Math.round(computeUsd);
  const finalDevopsUsd = Math.max(1, Math.round(totalUsd - finalDbUsd - finalComputeUsd));

  // Convert to target currency
  const total = currency === "INR" ? Math.round(totalUsd * rate) : totalUsd;
  const database = currency === "INR" ? Math.round(finalDbUsd * rate) : finalDbUsd;
  const compute = currency === "INR" ? Math.round(finalComputeUsd * rate) : finalComputeUsd;
  const devops = currency === "INR" ? Math.round(finalDevopsUsd * rate) : finalDevopsUsd;

  return {
    provider: CLOUD_PROVIDERS[providerId] || CLOUD_PROVIDERS.SUPABASE_VERCEL,
    users,
    totalUsd,
    total,
    databaseUsd: finalDbUsd,
    database,
    databaseTier: dbTier,
    computeUsd: finalComputeUsd,
    compute,
    computeTier: computeTier,
    devopsUsd: finalDevopsUsd,
    devops,
  };
}

/**
 * Concise, jargon-free startup glossary for founders.
 */
export const STARTUP_GLOSSARY = {
  initialTraction: {
    title: "Initial Traction (100 Users)",
    text: "Validating that your product solves a painful, urgent problem for real early adopters. Focus is on manual customer onboarding, direct conversations, and fixing critical bugs.",
    tip: "Target: 20-30 deeply engaged weekly users who actively provide feedback.",
  },
  pmf: {
    title: "Product-Market Fit (500 Users)",
    text: "When the market pulls the product from you faster than you can sell it. Paying retention stabilizes above 80% and organic word-of-mouth recommendations accelerate.",
    tip: "Benchmark: 40%+ of users would be 'very disappointed' if your product disappeared.",
  },
  scalingPhase: {
    title: "Scaling Phase (1,000 Users)",
    text: "Repeatable customer acquisition channels are validated. Unit economics are stable, CAC payback is under 12 months, and revenue safely outpaces server costs.",
    tip: "Benchmark: LTV:CAC ratio > 3:1 with monthly churn under 5%.",
  },
  marketLeader: {
    title: "Market Leader (5,000+ Users)",
    text: "Category authority with brand recognition, enterprise contract expansion, and dominant market presence. High gross profit margins and economies of scale.",
    tip: "Benchmark: High net revenue retention (>110%) driven by account expansion.",
  },
  mrr: {
    title: "Monthly Recurring Revenue (MRR)",
    text: "Predictable subscription income earned each 30-day billing cycle. The primary growth metric evaluated by venture capital and lenders.",
    tip: "Formula: Paying Customers × Monthly Subscription Price.",
  },
  arr: {
    title: "Annual Recurring Revenue (ARR)",
    text: "The 12-month annualized run-rate of your recurring subscriptions (MRR × 12). Used for company valuations and milestone tracking.",
    tip: "Formula: MRR × 12.",
  },
  cloudBurn: {
    title: "Infrastructure & Database Burn",
    text: "Real-world server hosting, database storage, queries, and bandwidth charges required to run the product as customer volume scales.",
    tip: "SaaS Rule: Cloud costs should stay under 5–15% of total MRR.",
  },
  netProfit: {
    title: "Net Monthly Profit",
    text: "Revenue remaining each month after deducting cloud compute, database storage, and infrastructure hosting expenses.",
    tip: "Formula: Monthly Revenue − Infrastructure Cloud Burn.",
  },
  ltv: {
    title: "Customer Lifetime Value (LTV)",
    text: "The projected total revenue an individual customer pays throughout their subscription before churning.",
    tip: "Formula: Monthly Price ÷ Monthly Churn Rate (e.g. ₹1,452 ÷ 5% = ₹29,040).",
  },
  cac: {
    title: "Customer Acquisition Cost (CAC)",
    text: "Total marketing and sales budget required to acquire one new paying customer. Target CAC should stay under 1/3 of LTV.",
    tip: "Rule of thumb: CAC Payback under 12 months ensures healthy cash flow.",
  },
  breakeven: {
    title: "Break-Even Customer Volume",
    text: "The exact number of paying subscribers required to pay for 100% of server, database, and operational costs. Every customer after this is pure gross profit.",
    tip: "Formula: Monthly Cloud Burn ÷ Monthly Subscription Price.",
  },
  unitEconomics: {
    title: "Unit Economics",
    text: "The fundamental direct revenue and costs associated with acquiring and serving an individual customer (LTV, CAC, Margin, and Churn).",
    tip: "Healthy SaaS Target: LTV:CAC > 3:1 and Gross Margin > 75%.",
  },
  infraCosts: {
    title: "Infrastructure Costs",
    text: "Serverless compute, managed database, storage buckets, and API invocations from real providers (Supabase, AWS, MongoDB).",
    tip: "Modern serverless stacks provide generous free tiers that easily cover initial pilot traffic.",
  },
  revProjections: {
    title: "Revenue Projections",
    text: "Projected monthly and annual earnings at key subscriber milestones based on current pricing assumptions.",
    tip: "Model conservative, base, and aggressive growth tiers.",
  },
};
