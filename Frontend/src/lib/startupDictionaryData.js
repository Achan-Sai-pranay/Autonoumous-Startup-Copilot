// Frontend/src/lib/startupDictionaryData.js
// ---------------------------------------------------------------------------
// Master Founder Dictionary & Startup Glossary for LaunchPilot
// Comprehensive definitions, formulas, founder benchmarks, and real-world examples
// organized across the 7 agentic venture development phases.
// ---------------------------------------------------------------------------

export const DICTIONARY_CATEGORIES = [
  { id: "all", label: "All Terms", icon: "Library" },
  { id: "customer-discovery", label: "Customer Discovery", icon: "Users" },
  { id: "market-intel", label: "Market & Competition", icon: "TrendingUp" },
  { id: "tech-architecture", label: "Architecture & Scaling", icon: "Cpu" },
  { id: "financial-model", label: "Financial Metrics", icon: "Wallet" },
  { id: "monetization", label: "Monetization Models", icon: "Target" },
];

export const DICTIONARY_TERMS = [
  // -------------------------------------------------------------------------
  // 1. CUSTOMER DISCOVERY & VALIDATION
  // -------------------------------------------------------------------------
  {
    id: "mom-test",
    term: "The Mom Test",
    category: "customer-discovery",
    categoryLabel: "Customer Discovery",
    tag: "Essential Framework",
    shortDefinition: "A customer interviewing standard designed to extract brutal truth about user problems without getting polite, misleading compliments.",
    detailedExplanation: "Formulated by Rob Fitzpatrick, The Mom Test states that if you ask questions properly, even your mom cannot lie to you about whether your business is viable. Founders fail when they pitch their idea and ask 'Would you buy this?'—everyone says yes to be polite. The Mom Test forces you to ask only about past behaviors, specific money/time lost, and current workarounds rather than hypothetical future promises.",
    whyItMatters: "90% of early-stage startups fail because they build something nobody actually wants, driven by false positive validation from polite interviewees.",
    formulaOrRule: "3 Golden Rules: 1. Talk about their life instead of your idea. 2. Ask about specific past occurrences rather than generic future opinions. 3. Talk less than 20% of the total conversation time.",
    example: "Bad: 'Would you pay $50/mo for automated meeting notes?' (Subject says 'Sure!'). Good: 'How did you document your executive sync last Tuesday? How long did it take? What tools did you try to fix that with, and how much did they cost?'",
    relatedSectionId: "customer-discovery",
    relatedSectionLabel: "03. Customer Persona & Discovery",
  },
  {
    id: "icp",
    term: "Ideal Customer Profile (ICP)",
    category: "customer-discovery",
    categoryLabel: "Customer Discovery",
    tag: "Targeting",
    shortDefinition: "The hyper-specific description of the customer or company that gets maximum value from your solution and converts with the lowest friction.",
    detailedExplanation: "An ICP is not a generic demographic (e.g. 'small businesses'). It defines company headcount, exact budget authority, tech stack, immediate crisis trigger, and annual revenue. Serving a broad audience early causes feature sprawl; narrowing to an acute ICP creates instant product-market pull.",
    whyItMatters: "Marketing to 'everyone' results in zero conversion. An ultra-sharp ICP cuts Customer Acquisition Cost (CAC) by up to 60%.",
    formulaOrRule: "ICP Test: Can you list 50 real individuals on LinkedIn within 15 minutes who match all your criteria?",
    example: "Generic: 'E-commerce store owners'. Crisp ICP: 'Shopify Plus merchants generating $1M-$5M GMV with 2-5 customer support reps struggling with return fraud.'",
    relatedSectionId: "customer-discovery",
    relatedSectionLabel: "03. Customer Persona & Discovery",
  },
  {
    id: "willingness-to-pay",
    term: "Willingness to Pay (WTP)",
    category: "customer-discovery",
    categoryLabel: "Customer Discovery",
    tag: "Validation Signal",
    shortDefinition: "The maximum price a customer is genuinely ready to pay for your product, backed by skin in the game rather than words.",
    detailedExplanation: "Verbal excitement is cheap; true WTP is demonstrated through high-friction commitments: upfront letters of intent (LOI), paid beta deposits, corporate credit card authorizations, or painful manual pilot migrations.",
    whyItMatters: "Founders frequently price too low out of fear, attracting high-maintenance customers while failing to cover compute and support costs.",
    formulaOrRule: "10x Value Rule: Price your solution at approximately 10% to 20% of the total verifiable dollar value or labor cost you save the customer.",
    example: "If your software saves a finance firm 30 hours of accountant labor monthly ($1,500 value), a $299/mo subscription has an undeniable WTP justification.",
    relatedSectionId: "customer-discovery",
    relatedSectionLabel: "03. Customer Persona & Discovery",
  },

  // -------------------------------------------------------------------------
  // 2. MARKET & COMPETITIVE INTELLIGENCE
  // -------------------------------------------------------------------------
  {
    id: "swot",
    term: "SWOT Analysis",
    category: "market-intel",
    categoryLabel: "Market & Competition",
    tag: "Strategic Planning",
    shortDefinition: "A 2x2 framework evaluating internal factors (Strengths & Weaknesses) against external market forces (Opportunities & Threats).",
    detailedExplanation: "Internal factors are within your direct control (e.g. proprietary ML algorithm, small developer team, limited cash runway). External factors are macro trends in the ecosystem (e.g. pending regulatory compliance laws, legacy competitor technical debt, cloud cost deflation).",
    whyItMatters: "Helps founders identify whether their competitive advantage is sustainable or vulnerable to fast-following incumbents.",
    formulaOrRule: "Strategy Matrix: Match internal Strengths against external Opportunities (Growth Vectors), and shore up Weaknesses before external Threats materialize.",
    example: "Strength: Real-time multi-agent LLM pipeline. Weakness: High initial GPU token cost. Opportunity: Mid-market firms slashing human analyst budgets. Threat: Open-source foundation models reducing pricing power.",
    relatedSectionId: "market-competitors",
    relatedSectionLabel: "04. Market & Competitive Intelligence",
  },
  {
    id: "porters-five-forces",
    term: "Porter's Five Forces",
    category: "market-intel",
    categoryLabel: "Market & Competition",
    tag: "Industry Dynamics",
    shortDefinition: "A Harvard Business School framework analyzing the structural attractiveness and long-term profitability of an entire industry.",
    detailedExplanation: "Formulated by Michael E. Porter, it assesses five competitive vectors: 1. Threat of New Entrants (barrier to entry), 2. Bargaining Power of Suppliers (vendor lock-in), 3. Bargaining Power of Buyers (customer price sensitivity), 4. Threat of Substitute Products (non-consumption or Excel workarounds), and 5. Competitive Rivalry (intensity among incumbents).",
    whyItMatters: "Prevents founders from building in industries where fierce rivalry or supplier monopolies will inevitably crush gross profit margins.",
    formulaOrRule: "High Margins occur when both Entry Barriers are high and Buyer/Supplier bargaining power is low.",
    example: "If OpenAI or AWS can clone your single-feature wrapper overnight, your 'Threat of New Entrants' is dangerously severe.",
    relatedSectionId: "market-competitors",
    relatedSectionLabel: "04. Market & Competitive Intelligence",
  },
  {
    id: "tam-sam-som",
    term: "TAM, SAM & SOM Market Sizing",
    category: "market-intel",
    categoryLabel: "Market & Competition",
    tag: "Market Sizing",
    shortDefinition: "Three concentric tiers measuring the total economic potential, addressable portion, and realistic near-term target of your product.",
    detailedExplanation: "TAM (Total Addressable Market): Global spending if 100% of prospective buyers bought your category. SAM (Serviceable Addressable Market): The portion within your geographic and technological reach. SOM (Serviceable Obtainable Market): Your realistic 2-3 year market share given your sales team and budget.",
    whyItMatters: "Investors reject bottom-up pitches that claim 'If we only get 1% of China's market'. Bottom-up TAM requires multiplying realistic buyer counts by annual contract values.",
    formulaOrRule: "Formula: SOM = Target ICP Accounts in Year 1-2 × Annual Contract Value (ACV).",
    example: "TAM: Global B2B sales intelligence ($14B). SAM: English-speaking SaaS SMBs ($2.8B). SOM: 250 paying SaaS startups at $6,000/yr ACV ($1.5M ARR in Year 2).",
    relatedSectionId: "market-competitors",
    relatedSectionLabel: "04. Market & Competitive Intelligence",
  },
  {
    id: "moat",
    term: "Defensibility & Economic Moat",
    category: "market-intel",
    categoryLabel: "Market & Competition",
    tag: "Competitive Advantage",
    shortDefinition: "The structural barriers that protect your business from competitors eroding your market share and pricing power over time.",
    detailedExplanation: "True moats include: 1. High Switching Costs (deeply embedded workflow data), 2. Two-Sided Network Effects (more buyers attract more sellers), 3. Proprietary Data Flywheels (user actions continuously improve the model), 4. Scale Economies, and 5. Brand Trust.",
    whyItMatters: "Without a moat, product copies emerge within 6 months and compete purely on price, destroying venture returns.",
    formulaOrRule: "Moat Check: If an incumbent with $10M in capital spent 6 months copying you, would your customers still stay?",
    example: "Slack's moat was team collaboration history and integrations. Once 5 years of engineering discussions are logged, switching to Microsoft Teams incurs immense organizational pain.",
    relatedSectionId: "market-competitors",
    relatedSectionLabel: "04. Market & Competitive Intelligence",
  },

  // -------------------------------------------------------------------------
  // 3. PRODUCT ARCHITECTURE & TECHNICAL SCALING
  // -------------------------------------------------------------------------
  {
    id: "cloud-architecture",
    term: "Cloud Architecture & Tiering",
    category: "tech-architecture",
    categoryLabel: "Architecture & Scaling",
    tag: "Infrastructure",
    shortDefinition: "The blueprint of hosting servers, databases, caching layers, and CDNs that keep your application fast, secure, and cost-efficient.",
    detailedExplanation: "Early-stage architecture typically begins serverless (Vercel/Render compute + managed Supabase/Atlas Postgres) to keep fixed costs near $0-$25/mo. As user counts surpass 1,000-5,000 active sessions, companies transition to containerized tasks (AWS ECS/Fargate) with dedicated VPCs and caching layers (Redis/Upstash).",
    whyItMatters: "Poor architecture choices either bankrupt startups with premature multi-cluster Kubernetes fees, or crash production during viral launch days.",
    formulaOrRule: "Golden Infrastructure Rule: Keep cloud infrastructure spend under 5% to 15% of total Monthly Recurring Revenue (MRR).",
    example: "LaunchPilot dynamically simulates Supabase + Vercel tiering: $0-25/mo for 100 users, scaling to $90/mo for 1,500 users, and $340/mo for 5,000+ users.",
    relatedSectionId: "product-mvp",
    relatedSectionLabel: "05. Product Architecture & MVP Scope",
  },
  {
    id: "database-scaling",
    term: "Database Scaling & Read Replicas",
    category: "tech-architecture",
    categoryLabel: "Architecture & Scaling",
    tag: "Data Infrastructure",
    shortDefinition: "The progression from single-instance databases to connection pooling, read replicas, caching, and horizontal partitioning as traffic surges.",
    detailedExplanation: "At launch, a single PostgreSQL instance handles all queries. Around 500-1,000 concurrent users, connection pool exhaustion and read latency occur. Founders introduce PgBouncer connection pooling, Redis caching for repetitive queries, and Read Replicas (routing write queries to primary and read traffic to copies).",
    whyItMatters: "80% of startup downtime during traffic spikes is caused by exhausted database connection pools, not frontend web server capacity.",
    formulaOrRule: "Scaling Milestones: 1. 0-500 users: Single managed DB. 2. 500-2,000 users: Connection pooler + Redis cache. 3. 2,000+ users: Read replica separation.",
    example: "Upgrading from Supabase Pro's default 60 direct connections to Transaction Mode PgBouncer allows handling 10,000+ simultaneous web client requests on minimal hardware.",
    relatedSectionId: "product-mvp",
    relatedSectionLabel: "05. Product Architecture & MVP Scope",
  },
  {
    id: "mvp-scope",
    term: "MVP Scope vs Feature Creep",
    category: "tech-architecture",
    categoryLabel: "Architecture & Scaling",
    tag: "Product Strategy",
    shortDefinition: "The discipline of shipping the thinnest viable software slice that delivers the core value proposition, cutting all non-essential features.",
    detailedExplanation: "A Minimum Viable Product (MVP) is not a broken or half-baked app; it is the simplest complete solution that proves or disproves your fundamental hypothesis. Feature creep is the trap where founders keep building settings, dark mode, social logins, and notification centers before confirming anyone cares about the core engine.",
    whyItMatters: "Every feature you build increases testing surface area, bug probability, and maintenance debt while delaying customer feedback by months.",
    formulaOrRule: "Cut In Half Rule: Take your initial MVP backlog and ruthlessly cut 50% of the features before writing production code.",
    example: "Uber's first MVP was merely an SMS service that booked a black town car in San Francisco—no ride pooling, no surge pricing, no fare splitting.",
    relatedSectionId: "product-mvp",
    relatedSectionLabel: "05. Product Architecture & MVP Scope",
  },

  // -------------------------------------------------------------------------
  // 4. FINANCIAL MODEL & UNIT ECONOMICS
  // -------------------------------------------------------------------------
  {
    id: "mrr",
    term: "Monthly Recurring Revenue (MRR)",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Core SaaS Metric",
    shortDefinition: "The predictable and recurring subscription revenue earned by your business every 30-day billing cycle.",
    detailedExplanation: "MRR excludes one-off setup fees, consulting invoices, and variable hardware sales. It is the lifeblood metric used by venture investors and founders to gauge true recurring momentum and compound growth rate.",
    whyItMatters: "Predictable revenue allows founders to plan hiring, server budgeting, and advertising campaigns without seasonal panic.",
    formulaOrRule: "Formula: Active Paying Subscribers × Average Subscription Price ($/mo).",
    example: "If 120 customers pay $49/mo, your current MRR is $5,880. If 10 upgrade to a $99/mo tier next month, expansion MRR adds $500.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "arr",
    term: "Annual Recurring Revenue (ARR)",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Core SaaS Metric",
    shortDefinition: "The 12-month annualized projection of recurring subscription contracts ($MRR × 12$).",
    detailedExplanation: "ARR is the universal standard for enterprise SaaS valuations. Startups raising Series A rounds typically aim for $1M to $2M in high-growth ARR with strong net retention.",
    whyItMatters: "Enterprise valuations and investor term sheets are quoted almost exclusively as multiples of ARR (e.g. 8x-15x ARR).",
    formulaOrRule: "Formula: MRR × 12 (or sum of all multi-year annual contracted values divided by years).",
    example: "$25,000 monthly recurring revenue translates directly into $300,000 ARR.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "arpu",
    term: "Average Revenue Per User (ARPU)",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Unit Economics",
    shortDefinition: "The average dollar amount generated from each active user or customer account over a specific timeframe.",
    detailedExplanation: "Calculated monthly or annually, ARPU reveals whether you are playing a low-price volume game (B2C) or a high-price relationship game (B2B Enterprise). Increasing ARPU through add-ons and seat expansion is the fastest way to accelerate ARR without doubling customer acquisition spend.",
    whyItMatters: "A startup with $10/mo ARPU needs 10,000 customers to reach $100k MRR; a B2B startup with $1,000/mo ARPU needs only 100 customers.",
    formulaOrRule: "Formula: Total Monthly Subscription Revenue ÷ Total Active Paying Accounts.",
    example: "Generating $15,000 monthly across 300 paying subscribers yields an ARPU of $50/mo.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "ltv",
    term: "Customer Lifetime Value (LTV)",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Unit Economics",
    shortDefinition: "The total gross profit a customer is projected to generate across their entire relationship with your business before churning.",
    detailedExplanation: "LTV estimates how much money an individual customer will deliver over time. It factors in average subscription price, gross margins, and monthly cancellation/churn rates.",
    whyItMatters: "LTV sets the upper limit on how much capital you can afford to invest in advertising and sales to acquire a single customer (CAC).",
    formulaOrRule: "Formula: (ARPU × Gross Margin %) ÷ Monthly Customer Churn Rate %.",
    example: "ARPU = $100/mo, Gross Margin = 80%, Monthly Churn = 4%. LTV = ($100 × 0.80) ÷ 0.04 = $2,000 per customer.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "cac",
    term: "Customer Acquisition Cost (CAC)",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Unit Economics",
    shortDefinition: "The total sales, marketing, ad spend, and onboarding budget required to convert a single new paying customer.",
    detailedExplanation: "True blended CAC includes ad spend, software tools, marketing agency fees, and sales representative salaries divided by the number of paying customers acquired during that calendar period.",
    whyItMatters: "More startups die from unsustainable CAC than from buggy software. If acquiring a customer costs more than their lifetime gross profit, scaling faster only bankrupts the business quicker.",
    formulaOrRule: "Formula: Total Sales & Marketing Costs ÷ Number of New Customers Acquired.",
    example: "Spending $5,000 on Google Search ads and acquiring 25 paying customers yields a CAC of $200 per customer.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "ltv-cac-ratio",
    term: "LTV to CAC Ratio (LTV:CAC)",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Vital Benchmark",
    shortDefinition: "The efficiency multiplier comparing how much value a customer generates relative to what it cost to acquire them.",
    detailedExplanation: "The definitive health benchmark for venture capital and growth sustainability. An LTV:CAC below 1:1 means you lose money on every sale. A ratio of 3:1 to 5:1 is the gold standard for high-growth software.",
    whyItMatters: "Signals to investors whether pouring marketing capital into your acquisition engine will compound profitably.",
    formulaOrRule: "Benchmarks: < 1.0 (Value destruction), 1.0 - 2.5 (Struggling margin), 3.0 - 5.0 (Optimal healthy growth), > 5.0 (Underinvesting in marketing, you could grow faster!).",
    example: "LTV of $1,800 and CAC of $400 yields an LTV:CAC ratio of 4.5:1—exceptionally attractive for growth.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "cac-payback",
    term: "CAC Payback Period",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Cash Flow Health",
    shortDefinition: "The exact number of months it takes for a customer's subscription revenue to repay the upfront cost spent to acquire them.",
    detailedExplanation: "A short payback period recycles working capital rapidly, enabling you to reinvest profits into new customer acquisition without raising dilutive funding rounds.",
    whyItMatters: "Startups can be profitable on paper (high LTV) but die of bankruptcy if CAC Payback exceeds 18 months and cash reserves run dry.",
    formulaOrRule: "Formula: CAC ÷ (Monthly ARPU × Gross Margin %). Benchmark: Under 12 months for SMBs; under 18 months for Enterprise.",
    example: "CAC = $600, ARPU = $100/mo, Gross Margin = 80%. Monthly gross profit = $80. Payback = $600 ÷ $80 = 7.5 months.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "unit-economics",
    term: "Unit Economics",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Financial Foundation",
    shortDefinition: "The direct revenues and direct variable costs associated with producing, delivering, and servicing a single unit of your product.",
    detailedExplanation: "For software companies, the 'unit' is usually one active subscriber. Unit economics models revenue per unit (ARPU) minus direct costs: payment gateway fees (Stripe 2.9%), database/cloud compute, third-party API token costs (OpenAI/Anthropic), and customer support hours.",
    whyItMatters: "If unit economics are negative, scaling volume simply magnifies losses ('losing money on every deal and trying to make it up on volume').",
    formulaOrRule: "Target: Direct Gross Margin per Unit should exceed 70% to 85% for pure SaaS.",
    example: "Customer pays $50/mo. Stripe takes $1.75, Cloud/DB uses $2.25, AI LLM tokens cost $5.00. Net Unit Contribution = $41.00 (82% contribution margin).",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "breakeven",
    term: "Break-Even Customer Volume",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Survival Milestone",
    shortDefinition: "The exact customer count or MRR threshold where total company revenue equals 100% of all fixed and variable operating expenses.",
    detailedExplanation: "Reaching break-even is the milestone known as 'Default Alive'. Past this point, the startup no longer depends on venture capital infusions to survive; founders control their own destiny.",
    whyItMatters: "Gives founders the exact target number of paying accounts required to eliminate existential risk.",
    formulaOrRule: "Formula: Total Monthly Fixed Costs ÷ (Average Subscription Price - Variable Cost per User).",
    example: "Fixed monthly burn = $4,500. Average plan = $50/mo with $5/mo variable cost ($45 contribution margin). Break-even customer volume = $4,500 ÷ $45 = 100 paying customers.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "churn-rate",
    term: "Customer & Revenue Churn",
    category: "financial-model",
    categoryLabel: "Financial Metrics",
    tag: "Retention Metric",
    shortDefinition: "The percentage of paying customers or recurring revenue lost over a given period due to cancellations or downgrades.",
    detailedExplanation: "Logo churn measures lost accounts; net revenue churn measures dollar impact. High churn is the 'leaky bucket' syndrome—even if you add 100 customers a month, 10% monthly churn erases growth as your base expands.",
    whyItMatters: "A 5% monthly churn rate means you lose nearly 50% of your entire customer base every year.",
    formulaOrRule: "Formula: (Lost Customers in Month ÷ Starting Customers at Beginning of Month) × 100. Benchmark: < 2% monthly for B2B; < 5% monthly for B2C.",
    example: "Starting with 200 customers, 6 cancel during June. Monthly customer churn = (6 ÷ 200) × 100 = 3.0%.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },

  // -------------------------------------------------------------------------
  // 5. BUSINESS & MONETIZATION MODELS
  // -------------------------------------------------------------------------
  {
    id: "b2b-saas",
    term: "B2B SaaS (Software-as-a-Service)",
    category: "monetization",
    categoryLabel: "Monetization Models",
    tag: "Business Archetype",
    shortDefinition: "Cloud-hosted software sold to business customers on recurring annual or monthly subscriptions.",
    detailedExplanation: "B2B SaaS companies enjoy high gross margins (75-85%), sticky recurring revenue, and contract expansion. Common monetization levers include per-seat pricing (e.g. $20/user/mo), feature tiering (Starter, Pro, Enterprise), and usage tiers.",
    whyItMatters: "B2B customers are less price-sensitive than consumers because software that saves labor or drives revenue has clear corporate ROI.",
    formulaOrRule: "Key Driver: Net Dollar Retention (NDR). Top B2B SaaS companies achieve > 115% NDR, expanding revenue from existing accounts without new ad spend.",
    example: "Salesforce, Notion, Slack, Datadog. Software is accessed via browser/API with automated monthly recurring credit card billing.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "d2c-ecommerce",
    term: "D2C E-Commerce (Direct-to-Consumer)",
    category: "monetization",
    categoryLabel: "Monetization Models",
    tag: "Business Archetype",
    shortDefinition: "Selling physical or digital goods directly to individual end-consumers without retail intermediaries or third-party marketplaces.",
    detailedExplanation: "D2C brands capture full retail margin rather than surrendering 30-50% to wholesale distributors or retail storefronts. However, D2C ventures bear 100% of customer acquisition and physical fulfillment/inventory risk.",
    whyItMatters: "With post-iOS14 ad privacy changes, rising ad costs make first-order profitability difficult in D2C without high repurchase rates.",
    formulaOrRule: "Core Equation: Repeat Purchase Rate & Contribution Margin after packaging, shipping, and ad spend.",
    example: "Warby Parker, Dollar Shave Club, Allbirds. Direct checkout on proprietary Shopify/web storefront.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "marketplace-model",
    term: "Two-Sided Marketplace",
    category: "monetization",
    categoryLabel: "Monetization Models",
    tag: "Business Archetype",
    shortDefinition: "A platform facilitating commercial transactions between independent supply-side vendors and demand-side buyers, earning a take rate.",
    detailedExplanation: "Marketplaces create immense enterprise value once network effects kick in, but suffer from the acute 'cold-start problem' (chicken-and-egg): buyers won't join without suppliers, and suppliers won't list without buyers.",
    whyItMatters: "Monetization is typically a 'take rate' (e.g. 10% to 25% transaction commission) on Gross Merchandise Value (GMV).",
    formulaOrRule: "Cold-Start Strategy: Subsidize and manually curate the harder side first (typically high-quality supply) before opening demand.",
    example: "Airbnb (hosts + travelers), Uber (drivers + riders), Upwork (freelancers + clients).",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "agency-retainer",
    term: "Agency & Recurring Retainer Model",
    category: "monetization",
    categoryLabel: "Monetization Models",
    tag: "Business Archetype",
    shortDefinition: "Selling specialized services, productized consulting, or managed workflows billed as predictable monthly retainer commitments.",
    detailedExplanation: "Unlike hourly billing or one-off project contracts, retainers guarantee recurring monthly revenue in exchange for reserved capacity, SLA guarantees, or defined deliverables (e.g. 4 blog posts/month, 20 design tickets/month).",
    whyItMatters: "Agencies can bootstrap startup capital with zero dilution. Many successful software companies began as productized agencies (e.g. Basecamp).",
    formulaOrRule: "Capacity Planning: Bill at least 3x the employee labor cost to cover overhead and ensure healthy 40-50% net agency margins.",
    example: "Designjoy ($5k/mo unlimited design retainer), growth marketing agencies charging $4k/mo + 10% ad spend management fees.",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
  {
    id: "usage-based-pricing",
    term: "Usage-Based & Consumption Pricing",
    category: "monetization",
    categoryLabel: "Monetization Models",
    tag: "Pricing Strategy",
    shortDefinition: "Monetization directly tied to quantitative consumption units (API calls, storage GB, AI tokens, compute seconds, or emails sent).",
    detailedExplanation: "Lowers barriers to entry for early users because costs scale proportionally with their business growth. However, revenue can fluctuate month-to-month based on customer business cycles.",
    whyItMatters: "Aligns customer incentives directly with product value: the customer only pays more when they achieve more output.",
    formulaOrRule: "Hybrid Model: Combine a predictable platform base fee (e.g. $49/mo) with metered overage charges per unit.",
    example: "Twilio ($0.0079 per SMS), Snowflake (compute credits), OpenAI API (tokens per 1M characters), Stripe (2.9% + 30¢ per charge).",
    relatedSectionId: "finances",
    relatedSectionLabel: "06. Financial Model & Unit Economics",
  },
];

/**
 * Lookup a dictionary term by its unique ID.
 * @param {string} id 
 * @returns {object|undefined}
 */
export function getDictionaryTerm(id) {
  if (!id) return undefined;
  return DICTIONARY_TERMS.find((t) => t.id.toLowerCase() === id.toLowerCase());
}

/**
 * Filter terms by category and search keyword.
 * @param {string} query 
 * @param {string} category 
 * @returns {Array}
 */
export function searchDictionary(query = "", category = "all") {
  const q = query.trim().toLowerCase();
  return DICTIONARY_TERMS.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      item.term.toLowerCase().includes(q) ||
      item.shortDefinition.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.detailedExplanation.toLowerCase().includes(q)
    );
  });
}
