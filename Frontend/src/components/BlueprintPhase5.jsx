// BlueprintPhase5.jsx
// ---------------------------------------------------------------------------
// Phase 5 of the blueprint reader redesign: finances and go-to-market.
//   UpmetricsFinancialSimulator  drop-in (same props) for CompetitorUpgrades.jsx
//   CopyBlock                    one ready-to-use template with a copy button
//   ChannelList                  acquisition channels
//   LaunchChecklist              replaces the checklist panel AND its state in
//                                GoToMarketSection (items + onUpdate)
// Needs BlueprintPhase2.jsx (Reveal) and ./blueprint.css
// ---------------------------------------------------------------------------
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Edit2, Plus, Trash2, X, Info, Cloud, Database, Server } from "lucide-react";
import { Reveal } from "./BlueprintPhase2.jsx";
import {
  formatCurrency,
  parseCurrencyValue,
  convertUsdToInr,
  useExchangeRate,
} from "../lib/currency.js";
import {
  calculateCloudCosts,
  CLOUD_PROVIDERS,
  STARTUP_GLOSSARY,
} from "../lib/cloudPricing.js";
import "./blueprint.css";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Numbers glide to their new value, so dragging a slider feels physical */
function Tween({ value, format = (v) => Math.round(v).toLocaleString() }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduced()) {
      from.current = value;
      setShown(value);
      return;
    }
    const a = from.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 450);
      const v = a + (value - a) * (1 - Math.pow(1 - t, 3));
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{format(shown)}</>;
}

const pct = (v) => `${Math.round(v)}%`;

/* ------------------------------------------------------------------ */
/* Interactive Info Tooltip & Definition Popover                       */
/* ------------------------------------------------------------------ */
/* Interactive Info Tooltip & Definition Popover (Apple Glassmorphic) */
/* ------------------------------------------------------------------ */
export function InfoTooltip({ title, text, tip, align = "center" }) {
  const [open, setOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const ref = useRef(null);
  const leaveTimerRef = useRef(null);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      if (!isLocked) {
        setOpen(false);
      }
    }, 220);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLocked) {
      setIsLocked(false);
      setOpen(false);
    } else {
      setIsLocked(true);
      setOpen(true);
    }
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsLocked(false);
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsLocked(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  return (
    <span
      className={`bp-info-wrap ${isLocked ? "is-locked" : ""}`}
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`bp-info-btn ${open ? "is-active" : ""}`}
        onClick={handleClick}
        aria-label={`Learn more: ${title || text}`}
        aria-expanded={open}
      >
        <Info size={11} strokeWidth={2.4} />
      </button>
      {open && (
        <span className={`bp-info-popover align-${align}`} role="tooltip">
          {title && <strong className="bp-info-title">{title}</strong>}
          <p className="bp-info-desc">{text}</p>
          {tip && <small className="bp-info-takeaway">💡 {tip}</small>}
        </span>
      )}
    </span>
  );
}

/* ================================================================== */
/* Financial simulator                                                 */
/* ================================================================== */
const USD_PRICE_PRESETS = [9, 19, 49, 99, 149, 299];
const INR_PRICE_PRESETS = [499, 999, 1999, 4999, 9999, 24999];
const USER_PRESETS = [50, 100, 250, 500, 1000, 5000];
const TIERS = [
  { users: 100, label: "Initial traction", key: "initialTraction" },
  { users: 500, label: "Product-market fit", key: "pmf" },
  { users: 1000, label: "Scaling phase", key: "scalingPhase" },
  { users: 5000, label: "Market leader", key: "marketLeader" },
];

function Control({ title, hint, prefix, suffix, value, setValue, min, max, step, presets, format }) {
  const safe = Math.max(1, Number(value) || 1);
  const p = Math.max(0, Math.min(100, ((Math.min(max, safe) - min) / (max - min)) * 100));
  return (
    <div className="bp-ctl">
      <div className="bp-ctl-top">
        <div>
          <b>{title}</b>
          <small>{hint}</small>
        </div>
        <label className="bp-ctl-input">
          {prefix && <span>{prefix}</span>}
          <input
            type="number"
            min="1"
            value={value}
            onChange={(e) => setValue(Math.max(1, Number(e.target.value) || 1))}
            aria-label={title}
          />
          {suffix && <span>{suffix}</span>}
        </label>
      </div>
      <input
        type="range"
        className="bp-range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, safe)}
        style={{ "--p": `${p}%` }}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={`${title} slider`}
      />
      <div className="bp-presets">
        {presets.map((v) => (
          <button key={v} type="button" className={safe === v ? "is-on" : ""} onClick={() => setValue(v)}>
            {format(v)}
          </button>
        ))}
      </div>
    </div>
  );
}

export const UpmetricsFinancialSimulator = ({ costEstimator, revenueSimulator, initialCurrency = "INR" }) => {
  const [currency, setCurrency] = useState(initialCurrency);
  const { rate: exchangeRate } = useExchangeRate();
  const [providerId, setProviderId] = useState("SUPABASE_VERCEL");

  // Safely parse initial price from AI output (uses real-time market exchange rate)
  const initialPrice = useMemo(() => {
    const raw = revenueSimulator?.pricingAssumption ?? "";
    return parseCurrencyValue(raw, currency, 29, exchangeRate);
  }, [revenueSimulator, currency, exchangeRate]);

  const [price, setPrice] = useState(initialPrice);
  const [customers, setCustomers] = useState(250);

  // Keep price updated when initialPrice recalculated
  useEffect(() => {
    setPrice(initialPrice);
  }, [initialPrice]);

  const handleToggleCurrency = (newCurrency) => {
    if (newCurrency === currency) return;
    if (newCurrency === "INR") {
      setPrice((prev) => Math.round(prev * exchangeRate));
    } else {
      setPrice((prev) => Math.max(5, Math.round(prev / exchangeRate)));
    }
    setCurrency(newCurrency);
  };

  const safePrice = Math.max(1, Number(price) || 1);
  const safeCustomers = Math.max(1, Number(customers) || 1);

  // Real-world dynamic cloud & database provider calculations:
  const cloudCosts = useMemo(
    () => calculateCloudCosts(safeCustomers, providerId, exchangeRate, currency),
    [safeCustomers, providerId, exchangeRate, currency]
  );
  const burn = cloudCosts.total;

  const mrr = safeCustomers * safePrice;
  const arr = mrr * 12;
  const net = Math.max(0, mrr - burn);
  const margin = mrr > 0 ? Math.max(0, Math.min(100, Math.round((net / mrr) * 100))) : 0;
  const breakEven = Math.max(1, Math.ceil(burn / safePrice));
  const ltv = Math.round(safePrice / 0.05);

  // ARR Milestones scale dynamically preserving required customer volume:
  const target1 = currency === "INR" ? Math.round(100000 * exchangeRate) : 100000;
  const target2 = currency === "INR" ? Math.round(1000000 * exchangeRate) : 1000000;
  const toTarget1 = Math.max(1, Math.ceil(target1 / (safePrice * 12)));
  const toTarget2 = Math.max(1, Math.ceil(target2 / (safePrice * 12)));
  const target1Lakhs = Math.round(target1 / 100000);
  const target2Crores = (target2 / 10000000).toFixed(1);
  const target1Label = currency === "INR" ? `₹${target1Lakhs} Lakhs ARR` : "$100,000 ARR";
  const target2Label = currency === "INR" ? `₹${target2Crores} Crore ARR` : "$1,000,000 ARR";

  const computePct = cloudCosts.total > 0 ? Math.round((cloudCosts.compute / cloudCosts.total) * 100) : 0;
  const databasePct = cloudCosts.total > 0 ? Math.round((cloudCosts.database / cloudCosts.total) * 100) : 0;
  const devopsPct = Math.max(0, 100 - computePct - databasePct);

  const moneyFormat = (v) => formatCurrency(v, currency);
  const pricePresets = currency === "INR" ? INR_PRICE_PRESETS : USD_PRICE_PRESETS;

  return (
    <section className="bp-sim">
      <Reveal className="bp-sim-head">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <h3>Financial simulator</h3>
              <InfoTooltip
                title={STARTUP_GLOSSARY.unitEconomics.title}
                text={STARTUP_GLOSSARY.unitEconomics.text}
                tip={STARTUP_GLOSSARY.unitEconomics.tip}
                align="left"
              />
            </div>
            <div className="hp-seg bp-sim-currency-toggle" role="group" aria-label="Currency selection">
              <button
                type="button"
                className={currency === "INR" ? "is-on" : ""}
                onClick={() => handleToggleCurrency("INR")}
              >
                ₹ INR
              </button>
              <button
                type="button"
                className={currency === "USD" ? "is-on" : ""}
                onClick={() => handleToggleCurrency("USD")}
              >
                $ USD
              </button>
            </div>
            {currency === "INR" && (
              <span
                className="bp-sim-rate-badge"
                title="Live real-time market exchange rate auto-synchronized from currency exchanges."
              >
                <i className="bp-sim-rate-dot" aria-hidden="true" />
                Live FX: 1 USD ≈ ₹{(Math.round(exchangeRate * 10) / 10).toFixed(1)}
              </span>
            )}
          </div>
          <p>Slide the price and customer volume. Revenue, margin and break-even recalculate dynamically with real cloud rates.</p>
        </div>
        <div className="bp-sim-be">
          <small>
            Break-even volume
            <InfoTooltip
              title={STARTUP_GLOSSARY.breakeven.title}
              text={STARTUP_GLOSSARY.breakeven.text}
              tip={STARTUP_GLOSSARY.breakeven.tip}
              align="right"
            />
          </small>
          <p>
            <b>{breakEven} customers</b> at {formatCurrency(safePrice, currency)}/mo cover your {formatCurrency(burn, currency)}/mo cloud & DB burn.
          </p>
        </div>
      </Reveal>

      <div className="bp-sim-ctls">
        <Control
          title="Monthly price"
          hint="Subscription price per customer"
          prefix={currency === "INR" ? "₹" : "$"}
          suffix="/mo"
          value={price}
          setValue={setPrice}
          min={currency === "INR" ? 299 : 5}
          max={currency === "INR" ? 35000 : 300}
          step={currency === "INR" ? 50 : 1}
          presets={pricePresets}
          format={(v) => formatCurrency(v, currency)}
        />
        <Control
          title="Active customers"
          hint="Paying accounts"
          suffix="users"
          value={customers}
          setValue={setCustomers}
          min={10}
          max={5000}
          step={10}
          presets={USER_PRESETS}
          format={(v) => v.toLocaleString()}
        />
      </div>

      <div className="bp-sim-kpis">
        <div className="bp-kpi-card">
          <div className="bp-kpi-head">
            <small>Monthly recurring revenue</small>
            <InfoTooltip
              title={STARTUP_GLOSSARY.mrr.title}
              text={STARTUP_GLOSSARY.mrr.text}
              tip={STARTUP_GLOSSARY.mrr.tip}
              align="left"
            />
          </div>
          <strong title={moneyFormat(mrr)}>
            <Tween value={mrr} format={moneyFormat} />
          </strong>
          <span>
            {safeCustomers.toLocaleString()} users × {formatCurrency(safePrice, currency)}/mo
          </span>
        </div>
        <div className="bp-kpi-card is-accent-card">
          <div className="bp-kpi-head">
            <small>Annual recurring revenue</small>
            <InfoTooltip
              title={STARTUP_GLOSSARY.arr.title}
              text={STARTUP_GLOSSARY.arr.text}
              tip={STARTUP_GLOSSARY.arr.tip}
              align="left"
            />
          </div>
          <strong className="is-accent" title={moneyFormat(arr)}>
            <Tween value={arr} format={moneyFormat} />
          </strong>
          <span>12-month run rate</span>
        </div>
        <div className="bp-kpi-card">
          <div className="bp-kpi-head">
            <small>Net monthly profit</small>
            <InfoTooltip
              title={STARTUP_GLOSSARY.netProfit.title}
              text={STARTUP_GLOSSARY.netProfit.text}
              tip={STARTUP_GLOSSARY.netProfit.tip}
              align="right"
            />
          </div>
          <strong title={moneyFormat(net)}>
            <Tween value={net} format={moneyFormat} />
          </strong>
          <span>
            {margin}% margin after {formatCurrency(burn, currency)} cloud & DB
          </span>
        </div>
        <div className="bp-kpi-card">
          <div className="bp-kpi-head">
            <small>Lifetime value</small>
            <InfoTooltip
              title={STARTUP_GLOSSARY.ltv.title}
              text={STARTUP_GLOSSARY.ltv.text}
              tip={STARTUP_GLOSSARY.ltv.tip}
              align="right"
            />
          </div>
          <strong title={moneyFormat(ltv)}>
            <Tween value={ltv} format={moneyFormat} />
          </strong>
          <span>Max target CAC {formatCurrency(Math.round(ltv / 3), currency)} at 5% churn</span>
        </div>
      </div>

      <div className="bp-sim-split">
        <div className="bp-sim-split-top">
          <span>
            Where each month’s revenue goes
            <InfoTooltip
              title={STARTUP_GLOSSARY.cloudBurn.title}
              text={STARTUP_GLOSSARY.cloudBurn.text}
              tip={STARTUP_GLOSSARY.cloudBurn.tip}
              align="left"
            />
          </span>
          <span>
            <b className="is-green">Profit {margin}%</b> · Cloud & DB {100 - margin}%
          </span>
        </div>
        <div className="bp-sim-bar">
          <i style={{ width: `${margin}%` }} />
        </div>
      </div>

      {/* Real Cloud & Database Provider Estimation System */}
      <div className="bp-sim-providers-card">
        <div className="bp-sim-providers-head">
          <div className="bp-sim-providers-title">
            <span className="bp-sim-cloud-icon" aria-hidden="true">
              <Cloud size={16} />
            </span>
            <div className="bp-sim-cloud-meta">
              <h4>Cloud Architecture & Database Scaling</h4>
              <p>Calibrated for {safeCustomers.toLocaleString()} active users via official provider production tiers</p>
            </div>
            <InfoTooltip
              title="Real Provider Pricing Model"
              text={`Real-world dynamic charges calculated for ${safeCustomers.toLocaleString()} customers using official pricing tiers from ${cloudCosts.provider.name}. Includes compute, database storage, queries, and egress.`}
              tip="Switch providers to compare server budgets between Supabase, AWS, and MongoDB."
              align="left"
            />
          </div>
          <div className="hp-seg bp-sim-provider-pills" role="radiogroup" aria-label="Select Cloud Provider">
            {Object.values(CLOUD_PROVIDERS).map((p) => (
              <button
                key={p.id}
                type="button"
                className={providerId === p.id ? "is-on" : ""}
                onClick={() => setProviderId(p.id)}
              >
                {p.id === "SUPABASE_VERCEL" && "⚡ "}
                {p.id === "AWS_PRODUCTION" && "☁️ "}
                {p.id === "MONGODB_RENDER" && "🍃 "}
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bp-sim-infra-grid">
          <div className="bp-sim-infra-item">
            <div className="bp-sim-infra-item-top">
              <span className="bp-sim-infra-cat">🖥️ Compute & Edge</span>
              <span className="bp-sim-infra-pct">{computePct}% of infra</span>
            </div>
            <div className="bp-sim-infra-cost">
              {formatCurrency(cloudCosts.compute, currency)}
              <small>/mo</small>
            </div>
            <div className="bp-sim-infra-tier" title={cloudCosts.computeTier}>
              {cloudCosts.computeTier}
            </div>
          </div>

          <div className="bp-sim-infra-item">
            <div className="bp-sim-infra-item-top">
              <span className="bp-sim-infra-cat">🗄️ Database & Storage</span>
              <span className="bp-sim-infra-pct">{databasePct}% of infra</span>
            </div>
            <div className="bp-sim-infra-cost">
              {formatCurrency(cloudCosts.database, currency)}
              <small>/mo</small>
            </div>
            <div className="bp-sim-infra-tier" title={cloudCosts.databaseTier}>
              {cloudCosts.databaseTier}
            </div>
          </div>

          <div className="bp-sim-infra-item">
            <div className="bp-sim-infra-item-top">
              <span className="bp-sim-infra-cat">🛡️ DevOps & Security</span>
              <span className="bp-sim-infra-pct">{devopsPct}% of infra</span>
            </div>
            <div className="bp-sim-infra-cost">
              {formatCurrency(cloudCosts.devops, currency)}
              <small>/mo</small>
            </div>
            <div className="bp-sim-infra-tier" title="Auth, transactional email, asset storage, and SSL">
              Auth, Email, Asset CDN & SSL
            </div>
          </div>
        </div>
      </div>

      <div className="bp-sim-miles">
        <div>
          <small>{target1Label}</small>
          <p>
            Needs <b>{toTarget1.toLocaleString()}</b> customers at {formatCurrency(safePrice, currency)}/mo
          </p>
        </div>
        <div>
          <small>{target2Label}</small>
          <p>
            Needs <b>{toTarget2.toLocaleString()}</b> customers at {formatCurrency(safePrice, currency)}/mo
          </p>
        </div>
      </div>

      <ul className="bp-sim-tiers">
        {TIERS.map((t) => {
          const tm = t.users * safePrice;
          const tierCloud = calculateCloudCosts(t.users, providerId, exchangeRate, currency);
          const tn = tm - tierCloud.total;
          const glossary = STARTUP_GLOSSARY[t.key];

          return (
            <li key={t.users}>
              <small>
                {t.label}
                {glossary && (
                  <InfoTooltip
                    title={glossary.title}
                    text={glossary.text}
                    tip={glossary.tip}
                    align={t.users >= 1000 ? "right" : "left"}
                  />
                )}
              </small>
              <b>{t.users.toLocaleString()} subscribers</b>
              <dl>
                <div>
                  <dt>MRR</dt>
                  <dd title={moneyFormat(tm)}>
                    <Tween value={tm} format={moneyFormat} />
                  </dd>
                </div>
                <div>
                  <dt>ARR</dt>
                  <dd title={moneyFormat(tm * 12)}>
                    <Tween value={tm * 12} format={moneyFormat} />
                  </dd>
                </div>
                <div>
                  <dt>Net profit</dt>
                  <dd title={`${moneyFormat(tn)}/mo`}>
                    <Tween value={tn} format={(v) => `${moneyFormat(v)}/mo`} />
                  </dd>
                </div>
              </dl>
              <span>{Math.max(0, Math.round((tn / tm) * 100))}% margin</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

/* ================================================================== */
/* Go-to-market                                                        */
/* ================================================================== */
export function CopyBlock({ label, text, onCopy }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text);
    onCopy?.(`${label} copied to clipboard`);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };
  return (
    <div className="bp-copy">
      <div>
        <b>{label}</b>
        <button type="button" onClick={copy} className={done ? "is-done" : ""}>
          {done ? <Check size={14} /> : <Copy size={14} />}
          {done ? "Copied" : "Copy"}
        </button>
      </div>
      <p>{text}</p>
    </div>
  );
}

export function ChannelList({ channels = [] }) {
  const safeList = Array.isArray(channels) ? channels : [];
  return (
    <ul className="bp-channels">
      {safeList.map((c, i) => {
        let name = "";
        let why = "";
        if (typeof c === "string") {
          name = c;
        } else if (c && typeof c === "object") {
          name = c.name || c.platform || c.channel || c.title || "";
          why = c.why || c.strategy || c.tactic || c.description || c.details || "";
        }
        return (
          <li key={i}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <b>{name || `Channel ${i + 1}`}</b>
              {why && <p>{why}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function LaunchChecklist({ items = [], onUpdate }) {
  const [done, setDone] = useState(() => new Set());
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");

  const total = items.length;
  const count = Array.from(done).filter((i) => i < total).length;
  const progress = total ? Math.round((count / total) * 100) : 0;

  const toggle = (i) =>
    setDone((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  const saveEdit = (i) => {
    if (editText.trim() && onUpdate) onUpdate(items.map((it, j) => (j === i ? editText.trim() : it)));
    setEditing(null);
  };
  const remove = (i) => onUpdate?.(items.filter((_, j) => j !== i));
  const add = () => {
    if (newText.trim() && onUpdate) {
      onUpdate([...items, newText.trim()]);
      setNewText("");
      setAdding(false);
    }
  };

  return (
    <Reveal as="section" className="bp-check">
      <div className="bp-check-head">
        <div>
          <h3>Launch readiness</h3>
          <p>
            {count} of {total} done
          </p>
        </div>
        <strong>{progress}%</strong>
      </div>
      <div className="bp-check-bar">
        <i style={{ width: `${progress}%` }} />
      </div>

      <ul>
        {items.map((item, i) => (
          <li key={i} className={done.has(i) ? "is-done" : ""}>
            {editing === i ? (
              <div className="bp-check-edit">
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(i);
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
                <button type="button" onClick={() => saveEdit(i)} aria-label="Save">
                  <Check size={15} />
                </button>
                <button type="button" onClick={() => setEditing(null)} aria-label="Cancel">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={done.has(i)}
                  className="bp-box"
                  onClick={() => toggle(i)}
                >
                  <Check size={13} strokeWidth={3} />
                </button>
                <span onClick={() => toggle(i)}>{item}</span>
                <div className="bp-check-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(i);
                      setEditText(item);
                    }}
                    aria-label="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button type="button" onClick={() => remove(i)} aria-label="Delete" className="is-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="bp-check-edit bp-check-add">
          <input
            autoFocus
            value={newText}
            placeholder="e.g. Set up Stripe billing webhook and production DNS"
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") {
                setAdding(false);
                setNewText("");
              }
            }}
          />
          <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={add}>
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setNewText("");
            }}
            aria-label="Cancel"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <button type="button" className="bp-check-new" onClick={() => setAdding(true)}>
          <Plus size={15} /> Add a launch milestone
        </button>
      )}
    </Reveal>
  );
}
