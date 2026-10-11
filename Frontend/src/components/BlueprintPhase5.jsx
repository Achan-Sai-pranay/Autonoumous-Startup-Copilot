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
import { Check, Copy, Edit2, Plus, Trash2, X } from "lucide-react";
import { Reveal } from "./BlueprintPhase2.jsx";
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

const money = (v) => `$${Math.round(v).toLocaleString()}`;
const pct = (v) => `${Math.round(v)}%`;

/* ================================================================== */
/* Financial simulator                                                 */
/* ================================================================== */
const PRICE_PRESETS = [9, 19, 29, 49, 79, 99, 149, 299];
const USER_PRESETS = [50, 100, 250, 500, 1000, 2500, 5000];
const TIERS = [
  { users: 100, label: "Initial traction" },
  { users: 500, label: "Product-market fit" },
  { users: 1000, label: "Scaling phase" },
  { users: 5000, label: "Market leader" },
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

export const UpmetricsFinancialSimulator = ({ costEstimator, revenueSimulator }) => {
  const initialPrice = useMemo(() => {
    const m = String(revenueSimulator?.pricingAssumption ?? "").match(/\$(\d+)/);
    const p = m ? parseInt(m[1], 10) : NaN;
    return p >= 5 && p <= 500 ? p : 29;
  }, [revenueSimulator]);

  const burn = useMemo(() => {
    const m = String(costEstimator?.estimatedMonthlyCost ?? "").match(/\$(\d+)/);
    return m ? parseInt(m[1], 10) : 15;
  }, [costEstimator]);

  const [price, setPrice] = useState(initialPrice);
  const [customers, setCustomers] = useState(250);

  const safePrice = Math.max(1, Number(price) || 1);
  const safeCustomers = Math.max(1, Number(customers) || 1);
  const mrr = safeCustomers * safePrice;
  const arr = mrr * 12;
  const net = Math.max(0, mrr - burn);
  const margin = mrr > 0 ? Math.max(0, Math.min(100, Math.round((net / mrr) * 100))) : 0;
  const breakEven = Math.max(1, Math.ceil(burn / safePrice));
  const ltv = Math.round(safePrice / 0.05);
  const to100k = Math.max(1, Math.ceil(100000 / (safePrice * 12)));
  const to1m = Math.max(1, Math.ceil(1000000 / (safePrice * 12)));

  return (
    <section className="bp-sim">
      <Reveal className="bp-sim-head">
        <div>
          <h3>Financial simulator</h3>
          <p>Slide the price and customer volume. Revenue, margin and break-even recalculate as you move.</p>
        </div>
        <div className="bp-sim-be">
          <small>Break-even</small>
          <p>
            <b>{breakEven} customers</b> at ${safePrice}/mo cover your ${burn}/mo cloud burn.
          </p>
        </div>
      </Reveal>

      <div className="bp-sim-ctls">
        <Control
          title="Monthly price"
          hint="Subscription price per customer"
          prefix="$"
          suffix="/mo"
          value={price}
          setValue={setPrice}
          min={5}
          max={300}
          step={1}
          presets={PRICE_PRESETS}
          format={(v) => `$${v}`}
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
        <div>
          <small>Monthly recurring revenue</small>
          <strong>
            <Tween value={mrr} format={money} />
          </strong>
          <span>
            {safeCustomers.toLocaleString()} users × ${safePrice}/mo
          </span>
        </div>
        <div>
          <small>Annual recurring revenue</small>
          <strong className="is-accent">
            <Tween value={arr} format={money} />
          </strong>
          <span>12-month run rate</span>
        </div>
        <div>
          <small>Net monthly profit</small>
          <strong>
            <Tween value={net} format={money} />
          </strong>
          <span>
            {margin}% margin after ${burn} burn
          </span>
        </div>
        <div>
          <small>Lifetime value</small>
          <strong>
            <Tween value={ltv} format={money} />
          </strong>
          <span>Max target CAC ${(ltv / 3).toFixed(0)} at 5% churn</span>
        </div>
      </div>

      <div className="bp-sim-split">
        <div className="bp-sim-split-top">
          <span>Where each month’s revenue goes</span>
          <span>
            <b className="is-green">Profit {margin}%</b> · Cloud {100 - margin}%
          </span>
        </div>
        <div className="bp-sim-bar">
          <i style={{ width: `${margin}%` }} />
        </div>
      </div>

      <div className="bp-sim-miles">
        <div>
          <small>$100,000 ARR</small>
          <p>
            Needs <b>{to100k.toLocaleString()}</b> customers at ${safePrice}/mo
          </p>
        </div>
        <div>
          <small>$1,000,000 ARR</small>
          <p>
            Needs <b>{to1m.toLocaleString()}</b> customers at ${safePrice}/mo
          </p>
        </div>
      </div>

      <ul className="bp-sim-tiers">
        {TIERS.map((t) => {
          const tm = t.users * safePrice;
          const tn = tm - burn;
          return (
            <li key={t.users}>
              <small>{t.label}</small>
              <b>{t.users.toLocaleString()} subscribers</b>
              <dl>
                <div>
                  <dt>MRR</dt>
                  <dd>
                    <Tween value={tm} format={money} />
                  </dd>
                </div>
                <div>
                  <dt>ARR</dt>
                  <dd>
                    <Tween value={tm * 12} format={money} />
                  </dd>
                </div>
                <div>
                  <dt>Net profit</dt>
                  <dd>
                    <Tween value={tn} format={(v) => `${money(v)}/mo`} />
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
  return (
    <ul className="bp-channels">
      {channels.map((c, i) => (
        <li key={i}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <div>
            <b>{c.name}</b>
            <p>{c.why}</p>
          </div>
        </li>
      ))}
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
