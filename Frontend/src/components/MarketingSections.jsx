// components/MarketingSections.jsx
// ---------------------------------------------------------------------------
// VenturusAI-identical Homepage Marketing Suite for LaunchPilot
// Complete visual fidelity: Real partner logo marquee, stats cards with hover
// gradients, borderless feature grid, audience tabs with whostartup.png,
// dual-direction testimonials marquee, split FAQ accordion, and floating widget.
// ---------------------------------------------------------------------------
import { useState } from "react";
import {
  FileText,
  Users,
  TrendingUp,
  ThumbsUp,
  Lightbulb,
  Home,
  ArrowRight,
  ChevronDown,
  Check,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  X,
  Star,
  ExternalLink,
} from "lucide-react";

// --- 1. Top Announcement Banner --------------------------------------------
export function AnnouncementBanner({ onCtaClick }) {
  return (
    <div
      id="banner"
      className="w-full bg-gray-50 border-b border-gray-200 py-2.5 px-4 text-xs font-medium text-gray-800 z-30"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-orange-600 text-white uppercase tracking-wider">
          New
        </span>
        <span className="text-gray-900 font-medium">
          ✨ 12 Autonomous AI Co-Founders, 💬 Instant Pitch Generator, and 📊 Unit Economics Simulator!
        </span>
        <button
          onClick={onCtaClick}
          className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 underline ml-1 cursor-pointer transition-colors"
        >
          Check them out here <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// --- 2. Hero Mockup Preview (VenturusAI Exact Banner Showcase) --------------
export function HeroMockupPreview({ onCtaClick }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 mt-6 mb-12 relative z-10">
      <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden group">
        {/* Browser Mockup Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="ml-3 text-[11px] font-mono text-gray-400 hidden sm:inline">
              launchpilot.ai/blueprint/venture-842
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-0.5 rounded-full font-bold">
              Report Ready (22.1s)
            </span>
          </div>
        </div>

        {/* Dual Mockup Showcase: Desktop Report + Mobile Preview */}
        <div className="relative bg-gradient-to-b from-gray-50/50 to-white p-4 sm:p-8 flex flex-col md:flex-row items-center justify-center gap-6 overflow-hidden">
          <div className="relative w-full max-w-4xl flex items-center justify-center">
            <img
              src="/images/banner.png"
              alt="LaunchPilot AI Startup Report Preview"
              className="w-full md:w-[90%] rounded-xl shadow-lg border border-gray-200 object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <img
              src="/images/banner_mobile.png"
              alt="LaunchPilot Mobile View"
              className="hidden md:block absolute right-0 bottom-[-10px] w-[28%] rounded-xl shadow-2xl border-2 border-white object-cover transform translate-x-2 transition-transform duration-500 group-hover:translate-x-0"
            />
          </div>
        </div>

        {/* Bottom Fast-Action Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Sparkles size={16} className="text-orange-600" />
            <span className="font-semibold text-gray-800">
              Generated in 22.1s with 12 Co-Founders analyzing TAM, ICP, tech stack, and unit economics.
            </span>
          </div>
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-sm cursor-pointer"
          >
            <span>Analyze Your Idea Free</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 3. Marquee Social Proof Logos (VenturusAI Real Images) ------------------
export function MarqueeLogos() {
  const partners = [
    {
      name: "Product Hunt",
      img: "/images/producthunt.png",
      url: "https://www.producthunt.com/products/venturusai",
    },
    {
      name: "BetaList",
      img: "/images/betalist.svg",
      url: "https://betalist.com/startups/venturusai",
    },
    {
      name: "This Week in Startups",
      img: "/images/twist.png",
      url: "https://www.youtube.com/watch?v=wqGbbHmN_iM",
    },
    {
      name: "HubSpot",
      img: "/images/hubspot.svg",
      url: "https://blog.hubspot.com/ai/ai-for-businesses",
    },
    {
      name: "FutureTools",
      img: "/images/futuretools.png",
      url: "https://www.futuretools.io/tools/venturusai",
    },
    {
      name: "There's An AI For That",
      img: "/images/theresanaiforthat.png",
      url: "https://theresanaiforthat.com/ai/venturusai/",
    },
  ];

  return (
    <section className="relative py-8 bg-white border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative w-full overflow-hidden">
          {/* Infinite Marquee */}
          <div className="flex animate-marquee gap-14 sm:gap-20 items-center whitespace-nowrap">
            {[...partners, ...partners, ...partners].map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noreferrer nofollow"
                className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity shrink-0"
                title={item.name}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="max-h-9 sm:max-h-11 w-auto object-contain"
                />
              </a>
            ))}
          </div>

          {/* Left / Right Fade Gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}

// --- 4. Stats Showcase (VenturusAI Exact Copy & Numbers) ---------------------
export function StatsSection() {
  const stats = [
    {
      value: "22.1s",
      label: "Avg. generation time (sec)",
      description:
        "LaunchPilot provides thorough analysis in under 30 seconds, showcasing our commitment to efficiency and speed over the past 30 days.",
    },
    {
      value: "156,253",
      label: "Accounts created",
      description:
        "Users have chosen LaunchPilot for their business analysis needs due to our platform's unmatched value, reliability, and the trust it consistently delivers.",
    },
    {
      value: "201,296",
      label: "Startups analyzed",
      description:
        "Our platform generated comprehensive business reports, each offering tailored insights for decision-making and strategic planning.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/70 p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <p className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-orange-600 transition-colors">
                  {stat.value}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mb-6">{stat.label}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{stat.description}</p>

              {/* Radial gradient hover accent */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(220px_circle_at_top_right,rgba(234,88,12,0.12),transparent_100%)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 5. "Discover the potential of your business idea" ----------------------
export function FeaturesGrid() {
  const capabilities = [
    {
      icon: FileText,
      title: "Comprehensive Business Analysis",
      text: "We'll help you understand the viability and potential challenges of your business idea. Our tool delivers in-depth business analysis tailored to your proposed venture, including SWOT, PESTEL, and Porter's Five Forces assessments.",
    },
    {
      icon: Users,
      title: "Target Audience Identification",
      text: "We provide valuable insights into your target audience, complete with user stories and demographic data, ensuring you create a product or service that resonates with your desired customer base.",
    },
    {
      icon: TrendingUp,
      title: "Customized Business Strategies",
      text: "Our tool offers business strategy recommendations, framework suggestions, and requirements analysis, equipping you with the tools and insights needed to bring your vision to life.",
    },
    {
      icon: ThumbsUp,
      title: "Marketing & Branding Guidance",
      text: "Explore marketing strategy and branding advice, including slogan ideas and social media post examples, to support with boosting your brand awareness and effectively reaching your target audience.",
    },
    {
      icon: Lightbulb,
      title: "Innovative Ideas & Opportunities",
      text: "Our app generates game-changing ideas and identifies additional revenue streams, helping you differentiate your business and capitalize on untapped opportunities within your industry.",
    },
    {
      icon: Home,
      title: "User-Friendly Interface",
      text: "Enjoy a seamless user experience with our easy-to-navigate interface, equipping you with the knowledge and inspiration to transform your business idea into a viable and successful venture.",
    },
  ];

  return (
    <section id="features" className="bg-gray-100/80 py-16 sm:py-24 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Discover the potential of your business idea
          </h2>
          <p className="text-gray-600 text-base sm:text-xl leading-relaxed">
            Our tool delivers in-depth business analysis tailored to your proposed venture, including SWOT, PESTEL, and Porter's Five Forces assessments.
          </p>
        </div>

        <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
          {capabilities.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex flex-col">
                <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-full bg-orange-600 text-white shadow-sm">
                  <Icon size={22} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --- 6. "Made for individuals and companies alike" --------------------------
export function AudienceTabs({ onSelectTab }) {
  const [activeTab, setActiveTab] = useState("startups");

  const tabContent = {
    startups: {
      title: "For entrepreneurs",
      desc: "LaunchPilot provides comprehensive business analysis and strategic recommendations, empowering entrepreneurs to refine their business ideas and maximize their potential for success.",
      cta: "Get your venture started for free",
      img: "/images/whostartup.png",
    },
    smbs: {
      title: "For small and medium businesses",
      desc: "LaunchPilot equips SMB owners with data-driven competitor insights, market segmentation, and operational unit economics to launch new revenue initiatives with confidence.",
      cta: "Analyze business expansion",
      img: "/images/whostartup.png",
    },
    enterprise: {
      title: "For enterprise innovation & venture studios",
      desc: "Accelerate deal flow vetting and corporate innovation sprints. Standardize 12-agent autonomous venture scoring across dozens of concept theses simultaneously.",
      cta: "Explore studio capabilities",
      img: "/images/whostartup.png",
    },
  };

  const current = tabContent[activeTab];

  return (
    <section id="audience" className="bg-gray-100/60 py-16 sm:py-24 border-b border-gray-200">
      <div className="flex flex-col gap-10 justify-center items-center max-w-4xl mx-auto text-center px-4">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
          Made for individuals and companies alike
        </h2>

        {/* VenturusAI Segmented Switch */}
        <div className="inline-flex p-1 bg-gray-200/90 rounded-lg shadow-inner">
          {["startups", "smbs", "enterprise"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "startups" ? "Start-ups" : tab === "smbs" ? "SMBs" : "Enterprise"}
            </button>
          ))}
        </div>

        {/* Tab Panel with whostartup.png */}
        <div className="w-full bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-md text-center max-w-2xl mx-auto">
          <img
            src={current.img}
            alt={current.title}
            className="rounded-xl shadow-lg mt-2 mb-8 w-full max-w-lg mx-auto h-auto object-cover"
          />
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{current.title}</h3>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            {current.desc}
          </p>
          <button
            onClick={onSelectTab}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
          >
            <span>{current.cta}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

// --- 7. Dual-Row Testimonials Marquee (VenturusAI Exact Testimonials) -------
export function TestimonialsSection() {
  const testimonialsRow1 = [
    {
      quote:
        "LaunchPilot can analyze your business ideas and provide you with comprehensive feedback on how to make them successful. It’s the perfect tool for any business owner or entrepreneur looking to take their ideas to the next level.",
      name: "Ayyappa N.",
      role: "Entrepreneur",
    },
    {
      quote:
        "I am still gasping at the depth, the detailing, the thought process and the application of this AI. Just unbelievable!",
      name: "Harish S.",
      role: "Learning & Development Leader",
    },
    {
      quote:
        "With new launches in AI everyday, I found LaunchPilot quite useful. It analyses your business idea and gives you feedback (the more details you input, the better the output).",
      name: "Sunita B.",
      role: "Entrepreneur",
    },
    {
      quote:
        "The attention to user experience and constant work on improving the platform are really great. I’m glad to be part of the community.",
      name: "Marcus V.",
      role: "SaaS Founder",
    },
  ];

  const testimonialsRow2 = [
    {
      quote:
        "Seriously, it’s amazing - all you need to do is write your idea in one sentence, and in just seconds, you’ll get a ton of valuable insights and analyses. If you’re looking to launch a business, I highly recommend giving LaunchPilot a try.",
      name: "Marina S.",
      role: "Tech Innovator",
    },
    {
      quote:
        "How I like this app LaunchPilot - you can put an idea in the eyes of the AI and it gives you a lot of interesting data, highly recommended.",
      name: "Pedro de la N.",
      role: "Entrepreneur",
    },
    {
      quote:
        "I checked out the new features - I really liked it, it will really help speed up the idea analysis process. Thank you LaunchPilot for this opportunity.",
      name: "Aliaksandr K.",
      role: "Business System Analyst",
    },
    {
      quote:
        "I tried out a business idea I had in mind with just a brief description of 3-4 lines, and the detailed analysis received from LaunchPilot was incredibly amazing.",
      name: "Ishant S.",
      role: "Masters Student",
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Testimonials
        </h2>
        <p className="text-gray-500 text-base sm:text-xl">
          Hear from our users about their experience with LaunchPilot.
        </p>
      </div>

      {/* Row 1 Marquee */}
      <div className="relative w-full overflow-hidden mb-6">
        <div className="flex animate-marquee gap-6 whitespace-nowrap">
          {[...testimonialsRow1, ...testimonialsRow1].map((item, i) => (
            <div
              key={i}
              className="w-[360px] sm:w-[420px] p-6 rounded-2xl bg-gray-50 border border-gray-200 shrink-0 whitespace-normal flex flex-col justify-between shadow-xs hover:border-orange-200 transition-colors"
            >
              <div className="flex items-center gap-1 mb-3 text-amber-400">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 italic">
                "{item.quote}"
              </p>
              <div className="pt-3 border-t border-gray-200">
                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Row 2 Marquee (Reverse direction) */}
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-marquee-reverse gap-6 whitespace-nowrap">
          {[...testimonialsRow2, ...testimonialsRow2].map((item, i) => (
            <div
              key={i}
              className="w-[360px] sm:w-[420px] p-6 rounded-2xl bg-gray-50 border border-gray-200 shrink-0 whitespace-normal flex flex-col justify-between shadow-xs hover:border-orange-200 transition-colors"
            >
              <div className="flex items-center gap-1 mb-3 text-amber-400">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 italic">
                "{item.quote}"
              </p>
              <div className="pt-3 border-t border-gray-200">
                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}

// --- 8. Pricing Section -----------------------------------------------------
export function PricingSection({ onSelectPlan }) {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Free Starter",
      price: "$0",
      period: "forever",
      desc: "Perfect for testing raw ideas and validating initial problem-solution fit.",
      features: [
        "3 Complete Blueprints / month",
        "Core Idea & Feasibility Analysis",
        "Customer Persona Generator",
        "Basic Markdown Export",
        "Community Support",
      ],
      popular: false,
      cta: "Get Started Free",
    },
    {
      name: "Pro Founder",
      price: annual ? "$15" : "$19",
      period: "per month",
      desc: "For serious entrepreneurs and operators building launch-ready companies.",
      features: [
        "Unlimited Startup Blueprints",
        "All 12 Autonomous AI Co-Founders",
        "Financial & Revenue Simulators",
        "Executive PDF & Markdown Export",
        "Go-To-Market Outreach Generator",
        "Priority Gemini Processing",
      ],
      popular: true,
      cta: "Start 7-Day Free Trial",
    },
    {
      name: "Studio Enterprise",
      price: annual ? "$39" : "$49",
      period: "per month",
      desc: "For incubators, accelerators, and agencies analyzing multiple startups.",
      features: [
        "Everything in Pro Founder",
        "Unlimited Team Workspace Seats",
        "Custom Industry Agent Tuning",
        "Dedicated Founder Support & API",
        "Whitelabel PDF Report Export",
      ],
      popular: false,
      cta: "Contact Enterprise",
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 mb-2 block">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Simple plans for every stage of your venture
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Start completely free. Upgrade only when you are ready to scale and launch.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center gap-3 bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !annual ? "bg-orange-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                annual ? "bg-orange-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annual <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">20% OFF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 bg-gray-50 border transition-all flex flex-col justify-between ${
                p.popular
                  ? "border-orange-500 shadow-xl ring-2 ring-orange-500/20 relative bg-white"
                  : "border-gray-200 shadow-sm hover:border-gray-300"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600 text-white shadow-xs">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-6">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">{p.price}</span>
                  <span className="text-xs font-medium text-gray-500">/{p.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-orange-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onSelectPlan}
                className={`w-full py-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  p.popular
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/25"
                    : "bg-white hover:bg-gray-100 text-gray-900 border border-gray-200"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 9. Split 2-Column FAQ Section (VenturusAI Exact Match) ----------------
export function FaqSection({ onCtaClick }) {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is LaunchPilot?",
      a: "LaunchPilot is an autonomous AI co-founder platform that evaluates startup concepts across 12 strategic dimensions in under 30 seconds. It delivers deep market intelligence, customer persona mapping, technical architectures, unit economics, and launch playbooks in a single run.",
    },
    {
      q: "What types of venture analyses can I generate with LaunchPilot?",
      a: "You can generate complete 360° venture dossiers, including SWOT analysis, PESTEL analysis, Porter's Five Forces, MVP product roadmaps, competitor vulnerability matrices, cloud hosting & AI API cost projections, and outreach email templates.",
    },
    {
      q: "How can LaunchPilot help my business succeed?",
      a: "By thoroughly validating your business model before you invest engineering hours or capital. LaunchPilot uncovers overlooked competitor weaknesses, outlines exact customer pain points, and gives you ready-to-use launch strategies.",
    },
    {
      q: "Who is LaunchPilot for?",
      a: "LaunchPilot is designed for solo founders, indie hackers, early-stage entrepreneurs, venture studios, and innovation teams who need quick, rigorous business feedback.",
    },
    {
      q: "How do I subscribe to LaunchPilot?",
      a: "You can start immediately on our Free Starter plan with zero credit card required. Upgrading to Pro or Enterprise can be done anytime directly from your dashboard.",
    },
    {
      q: "What's included in the free version?",
      a: "The free tier includes 3 full venture blueprints per month, complete feasibility scoring, target user personas, and basic Markdown export.",
    },
    {
      q: "What additional benefits do paid plans offer?",
      a: "Paid plans offer unlimited blueprints, all 12 autonomous co-founders, interactive ARR simulators, high-resolution Executive PDF export, and priority AI processing.",
    },
    {
      q: "Can I purchase individual venture analyses without a subscription?",
      a: "Yes, you can generate ad-hoc standalone analyses on demand or opt for our flexible pay-as-you-go credits for individual deep-dive reports.",
    },
    {
      q: "How do I get started with LaunchPilot?",
      a: "Simply click 'Start for free', describe your startup thesis in our idea input deck, and click 'Generate Blueprint' to start your 12-agent autonomous co-founders pipeline!",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start gap-12 lg:gap-16">
        {/* Left Column: Title + Subtitle + CTA Button */}
        <div className="w-full md:w-5/12 sticky top-28">
          <h2 className="mb-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-base sm:text-lg mb-8">
            Quick answers to common questions
          </p>
          <button
            onClick={onCtaClick}
            className="hidden md:inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
          >
            <span>Get your venture started for free</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Right Column: Accordion Items matching VenturusAI */}
        <div className="w-full md:w-7/12 divide-y divide-gray-200">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full py-2 text-left flex items-center justify-between gap-4 font-semibold text-gray-900 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-orange-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pt-2 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-6 md:hidden">
            <button
              onClick={onCtaClick}
              className="w-full py-3.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all"
            >
              Get your venture started for free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- 10. Clean Footer (VenturusAI Exact Match) ------------------------------
export function FullFooter() {
  return (
    <footer className="p-6 sm:p-10 bg-white border-t border-gray-200 text-xs text-gray-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              LP
            </div>
            <span className="font-extrabold text-gray-900 text-base">
              Launch<span className="text-orange-600">Pilot</span>
            </span>
          </div>

          <ul className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-600">
            <li>
              <a href="#features" className="hover:text-orange-600 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-orange-600 transition-colors">
                How it Works
              </a>
            </li>
            <li>
              <a href="#audience" className="hover:text-orange-600 transition-colors">
                Audience
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-orange-600 transition-colors">
                Pricing
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-orange-600 transition-colors">
                FAQ
              </a>
            </li>
            <li>
              <a href="mailto:support@launchpilot.ai" className="hover:text-orange-600 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <hr className="my-6 border-gray-200" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-[11px]">
          <span>
            © Copyright 2026. All Rights Reserved by{" "}
            <span className="text-orange-600 font-semibold">LaunchPilot, Inc</span>.
          </span>
          <div className="flex items-center gap-5 text-gray-500">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Twitter / X
            </a>
            <a
              href="mailto:hello@launchpilot.ai"
              className="hover:text-gray-900 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- 11. Floating AI Assistant / Chat Widget --------------------------------
export function FloatingChatWidget({ onSuggestionClick }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hi! Need an idea to test with LaunchPilot? Try one of these prompts:" },
  ]);

  const quickIdeas = [
    "AI Contract Auditor for B2B procurement",
    "Sub-ms semantic cache for LLMs",
    "Autonomous Micro-Fulfillment Logistics OS",
    "Rural Health Triage EHR & Voice Scribe",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-white border border-gray-200 shadow-2xl p-4 animate-toast-in text-gray-900">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-xs text-gray-900">LaunchPilot Copilot</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="py-3 space-y-2 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl ${
                  m.from === "ai"
                    ? "bg-gray-50 border border-gray-200 text-gray-700"
                    : "bg-orange-600 text-white ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-mono text-gray-400 uppercase">Click a thesis to load & analyze:</p>
            {quickIdeas.map((idea, i) => (
              <button
                key={i}
                onClick={() => {
                  onSuggestionClick(idea);
                  setOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-700 text-xs border border-gray-200 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>⚡ {idea}</span>
                <ArrowRight size={12} className="opacity-40" />
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="AI Startup Assistant"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
}
