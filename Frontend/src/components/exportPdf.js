// exportPdf.js
// ---------------------------------------------------------------------------
// Redesigned blueprint PDF. Same public API as before:
//     downloadPdf(blueprint, idea)
//
// Design language mirrors the on-screen blueprint (blueprint.css / home.css):
//   graphite ink, terracotta orange accent, soft grey surfaces, big rounded
//   cards, generous whitespace, small tracked eyebrow labels, big numerals.
//
// Only jsPDF core APIs are used (no autotable, no extra packages), and jsPDF
// is dynamically imported so it never touches the initial bundle.
//
// Layout: cover page -> contents page (clickable) -> numbered sections with a
// running header and "n / N" footer.
// ---------------------------------------------------------------------------

// ----- Palette (matches the --hp-* tokens used by the site) ----------------
const C = {
  ink: [29, 29, 31],
  ink2: [84, 84, 89],
  ink3: [134, 134, 139],
  soft: [245, 245, 247],
  line: [229, 229, 234],
  track: [232, 232, 237],
  white: [255, 255, 255],
  orange: [224, 86, 38],
  orangeInk: [184, 60, 20],
  tint: [253, 240, 233],
  green: [22, 163, 74],
  greenInk: [21, 128, 61],
  greenTint: [240, 253, 244],
  rose: [225, 29, 72],
  roseInk: [190, 18, 60],
  roseTint: [255, 241, 242],
  amber: [217, 119, 6],
  amberInk: [180, 83, 9],
  amberTint: [255, 251, 235],
};

const COST_KEYS = ["domain", "hosting", "database", "aiApis", "email", "analytics", "storage", "authentication"];
const COST_LABELS = {
  domain: "Domain",
  hosting: "Hosting",
  database: "Database",
  aiApis: "AI APIs",
  email: "Email",
  analytics: "Analytics",
  storage: "Storage",
  authentication: "Authentication",
};

// ----- Small pure helpers --------------------------------------------------
const ok = (s) => Boolean(s) && !s.error;
const okList = (l) => Array.isArray(l) && l.length > 0;
const arr = (l) => (Array.isArray(l) ? l.filter((x) => x !== null && x !== undefined && x !== "") : []);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== null && v !== "" ? n : null;
};
const titleCase = (s) => String(s || "").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
const pad2 = (n) => String(n).padStart(2, "0");
const formattedDate = () =>
  new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

// jsPDF's built-in Helvetica only covers WinAnsi (Latin-1 + a few symbols).
// Anything else (arrows, emoji, check marks) would render as garbage, so we
// normalise or strip it up front.
const clean = (v) => {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/[\u2192\u21D2\u27F6]/g, "->")
    .replace(/\u2265/g, ">=")
    .replace(/\u2264/g, "<=")
    .replace(/\*\*/g, "")
    .replace(/[^\n\u0020-\u007E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g, "")
    .replace(/[ \t]{2,}/g, " ");
};

const money = (s) => {
  const m = String(s ?? "").replace(/,/g, "").match(/([\d.]+)\s*([kmb])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]) || 0;
  const u = (m[2] || "").toLowerCase();
  return n * (u === "k" ? 1e3 : u === "m" ? 1e6 : u === "b" ? 1e9 : 1);
};

function safeTemplateStr(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    return val.map((v) => (typeof v === "object" ? safeTemplateStr(v) : String(v))).join("\n\n");
  }
  if (typeof val === "object") {
    const subject = val.subject || val.subjectLine || val.headline || val.title;
    const body = val.body || val.emailBody || val.content || val.text || val.message || val.post;
    if (subject && body) return `Subject: ${subject}\n\n${body}`;
    if (body) return String(body);
    if (val.tweet || val.post) return String(val.tweet || val.post);
    return Object.entries(val)
      .map(([k, v]) => `${k.toUpperCase()}:\n${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join("\n\n");
  }
  return String(val);
}

// Splits the free-text idea into a title, a description and labelled rows
// ("- Customers: ..." lines become Customers / ...).
function parseIdea(raw) {
  const lines = clean(raw || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return { title: "Untitled startup", desc: "", rows: [] };
  let title = lines[0].replace(/^#+\s*/, "");
  const rows = [];
  const extra = [];
  lines.slice(1).forEach((l) => {
    const m = l.match(/^[-*\u2022]\s*([^:]{2,28}):\s*(.+)$/);
    if (m) rows.push({ k: m[1], v: m[2] });
    else extra.push(l.replace(/^[-*\u2022]\s*/, ""));
  });
  let desc = extra.join(" ");
  if (title.length > 80) {
    desc = [title, desc].filter(Boolean).join(" ");
    let short = title.split(/[.:;]| - /)[0].trim();
    if (short.length > 64) short = short.slice(0, 61).trim() + "...";
    title = short;
  }
  return { title, desc, rows };
}

// ===========================================================================
export async function downloadPdf(blueprint, idea) {
  const { jsPDF } = await import("jspdf");

  const {
    ideaAnalysis, viabilityScorecard, aiDebate, customerDiscovery, swotAnalysis,
    portersFiveForces, marketSizing, marketResearch, customerPersona, productPlan,
    technicalArchitecture, businessStrategy, pitch, roadmap,
    goToMarket, launchChecklist, costEstimator, revenueSimulator,
    competitorWeaknessAnalysis,
  } = blueprint;

  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const M = 52; // side margin
  const CW = PW - M * 2; // content width
  const TOP = 72; // content top (below running header)
  const BOTTOM = PH - 62; // content bottom (above footer)
  const PAD = 16; // card padding
  const BL = 0.95; // baseline factor inside a line box

  let y = TOP;
  let secNo = 0;
  const toc = [];
  const info = parseIdea(idea);

  doc.setProperties({
    title: `${info.title} - Startup Blueprint`,
    subject: "Startup Blueprint",
    author: "IdeaPulse AI",
    creator: "IdeaPulse AI",
  });

  // ----- Drawing primitives -------------------------------------------------
  const font = (style, size, color) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };
  const fill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const stroke = (c) => doc.setDrawColor(c[0], c[1], c[2]);
  const spaced = (n) => {
    if (typeof doc.setCharSpace === "function") doc.setCharSpace(n);
  };
  const rr = (x, yy, w, h, r, style) => {
    const rad = Math.max(0, Math.min(r, h / 2, w / 2));
    doc.roundedRect(x, yy, w, h, rad, rad, style);
  };
  const wrap = (t, w, size, style = "normal") => {
    const s = clean(t);
    if (!s) return [];
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    return doc.splitTextToSize(s, w);
  };
  const eyebrow = (t, x, yy, color, align) => {
    font("bold", 7.5, color);
    spaced(1);
    doc.text(clean(t).toUpperCase(), x, yy, align ? { align } : undefined);
    spaced(0);
  };
  const hr = (yy, x1 = M, x2 = M + CW) => {
    stroke(C.line);
    doc.setLineWidth(0.6);
    doc.line(x1, yy, x2, yy);
  };
  const newPage = () => {
    doc.addPage();
    y = TOP;
  };
  const ensure = (h) => {
    if (y + h > BOTTOM) newPage();
  };
  const meter = (x, yy, w, pct, color, h = 5) => {
    fill(C.track);
    rr(x, yy, w, h, h / 2, "F");
    const p = Math.min(100, Math.max(0, pct));
    fill(color);
    rr(x, yy, Math.max(h, (w * p) / 100), h, h / 2, "F");
  };
  const pill = (t, x, yy, bg, fg, size = 8) => {
    const s = clean(t);
    font("bold", size, fg);
    const w = doc.getTextWidth(s) + 18;
    fill(bg);
    rr(x, yy, w, 17, 8.5, "F");
    doc.text(s, x + 9, yy + 11.5);
    return w;
  };
  const ring = (cx, cy, r, pct, lw, color) => {
    doc.setLineWidth(lw);
    stroke(C.track);
    doc.circle(cx, cy, r, "S");
    const sweep = (Math.min(100, Math.max(1, pct)) / 100) * 360;
    stroke(color);
    doc.setLineCap("round");
    for (let a = 0; a < sweep; a += 3) {
      const a1 = ((-90 + a) * Math.PI) / 180;
      const a2 = ((-90 + Math.min(a + 3.5, sweep)) * Math.PI) / 180;
      doc.line(cx + r * Math.cos(a1), cy + r * Math.sin(a1), cx + r * Math.cos(a2), cy + r * Math.sin(a2));
    }
    doc.setLineCap("butt");
  };
  const tier = (score) =>
    score >= 75
      ? { bg: C.greenTint, fg: C.greenInk }
      : score >= 50
      ? { bg: C.amberTint, fg: C.amberInk }
      : { bg: C.roseTint, fg: C.roseInk };

  // ----- Flow components ----------------------------------------------------
  const section = (title, stage, lede) => {
    secNo += 1;
    const ledeLines = lede ? wrap(lede, CW * 0.88, 11) : [];
    if (y > TOP + 4) y += 34;
    ensure(150 + ledeLines.length * 16);
    toc.push({ n: secNo, title, page: doc.getNumberOfPages() });
    eyebrow(`${pad2(secNo)}   ${stage}`, M, y + 8, C.orange);
    y += 24;
    font("bold", 27, C.ink);
    spaced(-0.4);
    doc.text(clean(title), M, y + 20);
    spaced(0);
    y += 36;
    if (ledeLines.length) {
      font("normal", 11, C.ink2);
      ledeLines.forEach((l) => {
        doc.text(l, M, y + 11);
        y += 16;
      });
    }
    y += 16;
  };

  const sub = (t) => {
    ensure(40);
    y += 8;
    font("bold", 12.5, C.ink);
    doc.text(clean(t), M, y + 12);
    y += 26;
  };

  const label = (t, color = C.ink3) => {
    ensure(30);
    eyebrow(t, M, y + 8, color);
    y += 20;
  };

  const para = (text, { size = 10.5, color = C.ink2, style = "normal", x = M, w = CW } = {}) => {
    const lines = wrap(text, w, size, style);
    if (!lines.length) return;
    const lh = size * 1.55;
    font(style, size, color);
    lines.forEach((l) => {
      ensure(lh);
      font(style, size, color);
      doc.text(l, x, y + size * BL);
      y += lh;
    });
    y += 8;
  };

  const bulletsHeight = (items, w, size) =>
    arr(items).reduce((a, t) => a + wrap(t, w - 16, size).length * size * 1.5 + 5, 0) + 4;

  const bullets = (items, { dot = C.orange, size = 10, w = CW, x = M } = {}) => {
    arr(items).forEach((it) => {
      const lines = wrap(it, w - 16, size);
      const lh = size * 1.5;
      ensure(lines.length * lh + 5);
      fill(dot);
      doc.circle(x + 3, y + size * 0.55, 1.8, "F");
      font("normal", size, C.ink2);
      lines.forEach((l, i) => doc.text(l, x + 16, y + size * BL + i * lh));
      y += lines.length * lh + 5;
    });
    y += 4;
  };

  const numbered = (items, { size = 10 } = {}) => {
    arr(items).forEach((it, i) => {
      const lines = wrap(it, CW - 28, size);
      const lh = size * 1.5;
      ensure(lines.length * lh + 6);
      font("bold", size, C.orange);
      doc.text(String(i + 1).padStart(2, "0"), M, y + size * BL);
      font("normal", size, C.ink2);
      lines.forEach((l, k) => doc.text(l, M + 28, y + size * BL + k * lh));
      y += lines.length * lh + 6;
    });
    y += 4;
  };

  const chips = (items) => {
    ensure(30);
    let cx = M;
    arr(items).forEach((t) => {
      const s = clean(t);
      font("bold", 9, C.ink2);
      const w = Math.min(CW, doc.getTextWidth(s) + 22);
      if (cx + w > M + CW) {
        cx = M;
        y += 27;
        ensure(30);
      }
      fill(C.soft);
      rr(cx, y, w, 21, 10.5, "F");
      font("bold", 9, C.ink2);
      doc.text(s, cx + 11, y + 14);
      cx += w + 8;
    });
    y += 36;
  };

  // Spec-sheet rows: tracked label on the left, value on the right, hairlines.
  const specRows = (rows, { kw = 118 } = {}) => {
    const list = rows.filter((r) => r.v);
    if (!list.length) return;
    ensure(50);
    hr(y);
    list.forEach((r) => {
      const keyLines = wrap(String(r.k).toUpperCase(), kw - 26, 7.5, "bold");
      const valLines = wrap(r.v, CW - kw, 10);
      const h = 14 + Math.max(valLines.length * 15, keyLines.length * 11) + 12;
      ensure(h);
      font("bold", 7.5, C.ink3);
      spaced(1);
      keyLines.forEach((l, i) => doc.text(l, M, y + 14 + 7 + i * 11 - 6));
      spaced(0);
      font("normal", 10, C.ink);
      valLines.forEach((l, i) => doc.text(l, M + kw, y + 14 + 9.5 * BL - 1 + i * 15));
      y += h;
      hr(y);
    });
    y += 12;
  };

  // ----- Card engine --------------------------------------------------------
  // One function both measures (draw=false) and renders (draw=true) a card so
  // heights always match what is drawn.
  const renderCard = (c, x, top, w, H, draw) => {
    const iw = w - PAD * 2;
    const ix = x + PAD;
    let cy = top + PAD;
    if (draw && c.fill) {
      fill(c.fill);
      if (c.border) {
        stroke(c.border);
        doc.setLineWidth(0.7);
        rr(x, top, w, H, 16, "FD");
      } else rr(x, top, w, H, 16, "F");
    }
    if (c.title) {
      let tx = ix;
      if (c.badge) {
        if (draw) {
          fill(c.badgeBg || C.white);
          rr(ix, cy, 24, 24, 8, "F");
          font("bold", 12, c.titleColor || C.ink);
          doc.text(c.badge, ix + 12, cy + 16.5, { align: "center" });
        }
        tx = ix + 34;
      }
      if (draw) {
        font("bold", 11.5, c.titleColor || C.ink);
        doc.text(clean(c.title), tx, cy + (c.badge ? 10 : 9));
        if (c.subtitle) {
          font("normal", 8.5, C.ink3);
          const sl = doc.splitTextToSize(clean(c.subtitle), iw - (tx - ix))[0] || "";
          doc.text(sl, tx, cy + 22);
        }
      }
      cy += c.badge ? 34 : c.subtitle ? 30 : 20;
    }
    if (c.body) {
      const size = c.bodySize || 10;
      const lh = size * 1.55;
      const style = c.bodyStyle || "normal";
      const lines = wrap(c.body, iw, size, style);
      if (draw) {
        font(style, size, c.bodyColor || C.ink);
        lines.forEach((l, i) => doc.text(l, ix, cy + size * BL + i * lh));
      }
      cy += lines.length * lh + 10;
    }
    arr(c.fields).forEach((fd) => {
      if (!fd.v) return;
      if (draw) eyebrow(fd.k, ix, cy + 8, c.labelColor || C.ink3);
      cy += 16;
      const lines = wrap(fd.v, iw, 9.5);
      if (draw) {
        font("normal", 9.5, C.ink2);
        lines.forEach((l, i) => doc.text(l, ix, cy + 9.5 * BL + i * 14.5));
      }
      cy += lines.length * 14.5 + 10;
    });
    arr(c.items).forEach((it) => {
      const lines = wrap(it, iw - 14, 9.5);
      if (draw) {
        fill(c.dot || C.orange);
        doc.circle(ix + 2.5, cy + 5.5, 1.7, "F");
        font("normal", 9.5, C.ink2);
        lines.forEach((l, i) => doc.text(l, ix + 14, cy + 9.5 * BL + i * 14));
      }
      cy += lines.length * 14 + 6;
    });
    return cy + PAD - 8;
  };

  const cardRow = (cards, gap = 14) => {
    const list = cards.filter(Boolean);
    if (!list.length) return;
    const w = (CW - gap * (list.length - 1)) / list.length;
    const H = Math.max(...list.map((c) => renderCard(c, 0, 0, w, 0, false)));
    ensure(H);
    list.forEach((c, i) => renderCard(c, M + i * (w + gap), y, w, H, true));
    y += H + 14;
  };

  const callout = (title, body, { fillC = C.tint, color = C.orangeInk, size = 10.5 } = {}) => {
    if (!body) return;
    cardRow([{ fill: fillC, title, titleColor: color, body, bodySize: size }]);
  };

  const unavailable = () => {
    cardRow([
      {
        fill: C.soft,
        title: "Not generated",
        titleColor: C.ink2,
        body: "This part of the blueprint could not be generated. Re-run the analysis from the dashboard to fill it in.",
        bodySize: 9.5,
        bodyColor: C.ink3,
      },
    ]);
  };

  const table = (cols, rows) => {
    ensure(70);
    fill(C.soft);
    rr(M, y, CW, 27, 9, "F");
    let cx = M;
    cols.forEach((c) => {
      const right = c.align === "right";
      eyebrow(c.h, right ? cx + c.w - 14 : cx + 14, y + 17, C.ink3, right ? "right" : undefined);
      cx += c.w;
    });
    y += 27;
    rows.forEach((r) => {
      const cells = cols.map((c, i) => (c.bar ? null : wrap(r[i], c.w - 28, 9.5, c.bold ? "bold" : "normal")));
      const lines = Math.max(1, ...cells.map((l) => (l ? l.length : 1)));
      const h = lines * 13.5 + 22;
      ensure(h);
      cx = M;
      cols.forEach((c, i) => {
        if (c.bar) {
          meter(cx + 14, y + h / 2 - 3, c.w - 28, (r[i] || 0) * 100, C.orange, 6);
        } else {
          const right = c.align === "right";
          const colr = c.colorFn ? c.colorFn(r[i]) : c.color || (c.bold ? C.ink : C.ink2);
          font(c.bold ? "bold" : "normal", 9.5, colr);
          cells[i].forEach((l, k) =>
            doc.text(l, right ? cx + c.w - 14 : cx + 14, y + 11 + 9.5 * BL + k * 13.5, right ? { align: "right" } : undefined)
          );
        }
        cx += c.w;
      });
      y += h;
      hr(y);
    });
    y += 16;
  };

  const kpis = (items) => {
    const g = 12;
    const w = (CW - g * (items.length - 1)) / items.length;
    const h = 82;
    ensure(h + 10);
    items.forEach((k, i) => {
      const x = M + i * (w + g);
      fill(k.accent ? C.tint : C.soft);
      rr(x, y, w, h, 18, "F");
      eyebrow(k.label, x + 18, y + 24, k.accent ? C.orangeInk : C.ink3);
      font("bold", 24, k.accent ? C.orange : C.ink);
      spaced(-0.5);
      doc.text(clean(k.value), x + 18, y + 56);
      spaced(0);
      if (k.sub) {
        font("normal", 8.5, C.ink3);
        doc.text(clean(k.sub), x + 18, y + 71);
      }
    });
    y += h + 16;
  };

  // =========================================================================
  // PAGE 1 — COVER
  // =========================================================================
  {
    // soft terracotta glow, top right
    [[330, [255, 247, 243]], [240, [254, 240, 232]], [150, [253, 230, 218]]].forEach(([r, c]) => {
      fill(c);
      doc.circle(PW + 30, -10, r, "F");
    });

    // brand mark: orange tile with a pulse line
    fill(C.orange);
    rr(M, 52, 28, 28, 9, "F");
    stroke(C.white);
    doc.setLineWidth(1.8);
    doc.setLineCap("round");
    doc.setLineJoin("round");
    [[57, 66], [61.5, 66], [64.5, 58.5], [68.5, 74], [71.5, 66], [75, 66]].reduce((p, q) => {
      if (p) doc.line(p[0], p[1], q[0], q[1]);
      return q;
    }, null);
    doc.setLineCap("butt");
    font("bold", 15, C.ink);
    spaced(-0.3);
    doc.text("IdeaPulse", M + 38, 72);
    spaced(0);
    font("normal", 10, C.ink3);
    doc.text(formattedDate(), PW - M, 72, { align: "right" });

    // title block
    let cy = 232;
    eyebrow("Startup Blueprint", M, cy, C.orange);
    cy += 22;
    const tSize = info.title.length > 44 ? 32 : 42;
    font("bold", tSize, C.ink);
    doc.setFontSize(tSize);
    const tLines = doc.splitTextToSize(clean(info.title), 410).slice(0, 3);
    spaced(-0.6);
    font("bold", tSize, C.ink);
    tLines.forEach((l, i) => doc.text(l, M, cy + tSize + i * (tSize * 1.1)));
    spaced(0);
    cy += tSize + (tLines.length - 1) * tSize * 1.1 + 24;
    if (info.desc) {
      let dLines = wrap(info.desc, 400, 13);
      if (dLines.length > 4) {
        dLines = dLines.slice(0, 4);
        dLines[3] = dLines[3].replace(/\s*\S*$/, "") + "...";
      }
      font("normal", 13, C.ink2);
      dLines.forEach((l, i) => doc.text(l, M, cy + 13 + i * 20));
      cy += dLines.length * 20;
    }

    // headline score card
    if (ok(viabilityScorecard)) {
      const score = num(viabilityScorecard.score);
      const cardY = Math.max(cy + 44, 520);
      const cardH = 156;
      fill(C.soft);
      rr(M, cardY, CW, cardH, 26, "F");
      if (score !== null) {
        const cx = M + 82;
        const cyy = cardY + cardH / 2;
        ring(cx, cyy, 46, score, 9, C.orange);
        font("bold", 32, C.ink);
        spaced(-1);
        doc.text(String(Math.round(score)), cx, cyy + 9, { align: "center" });
        spaced(0);
        font("normal", 8, C.ink3);
        doc.text("out of 100", cx, cyy + 24, { align: "center" });
      }
      const rx = M + 178;
      const rw = CW - 178 - 28;
      eyebrow("Viability verdict", rx, cardY + 34, C.ink3);
      font("bold", 19, C.ink);
      spaced(-0.3);
      doc.text(titleCase(viabilityScorecard.verdict || "Viable"), rx, cardY + 58);
      spaced(0);
      const subs = [
        ["Market demand", num(viabilityScorecard.marketDemandScore)],
        ["Technical feasibility", num(viabilityScorecard.technicalFeasibilityScore)],
        ["Monetization", num(viabilityScorecard.monetizationScore)],
      ].filter((s) => s[1] !== null);
      subs.forEach(([name, v], i) => {
        const ry = cardY + 84 + i * 24;
        font("normal", 9, C.ink2);
        doc.text(name, rx, ry);
        font("bold", 9, C.ink);
        doc.text(`${Math.round(v)}%`, rx + rw, ry, { align: "right" });
        meter(rx, ry + 5, rw, v, C.orange, 4);
      });
    }

    // cover footer
    hr(PH - 92);
    font("bold", 9, C.ink);
    doc.text("Generated by a 12-agent AI co-founder", M, PH - 70);
    font("normal", 8.5, C.ink3);
    doc.text("Groq Llama 3.3 70B  \u00B7  DeepSeek V3  \u00B7  Google Gemini", M, PH - 56);
    pill("CONFIDENTIAL", PW - M - 82, PH - 80, C.tint, C.orangeInk, 7.5);
  }

  // Reserve page 2 for the contents, then start the real content on page 3.
  doc.addPage();
  doc.addPage();
  y = TOP;

  // =========================================================================
  // 01 — STARTUP CONCEPT
  // =========================================================================
  section("Startup Concept", "Overview");
  if (info.title || info.desc || info.rows.length) {
    para(info.title, { size: 17, color: C.ink, style: "bold" });
    if (info.desc) para(info.desc, { size: 12, color: C.ink2 });
    y += 4;
    specRows(info.rows);
  } else {
    para("Not provided.");
  }

  // =========================================================================
  // VC WAR ROOM
  // =========================================================================
  if (ok(aiDebate)) {
    section("The VC War Room", "Committee", "Three AI partners argued your idea in parallel: a bull, a bear and a neutral judge.");
    const { bull, bear, judge } = aiDebate;
    const bs = num(bull?.convictionScore);
    const rs = num(bear?.skepticismScore);

    if (bs !== null && rs !== null) {
      ensure(100);
      font("bold", 36, C.greenInk);
      spaced(-1.2);
      doc.text(String(Math.round(bs)), M, y + 34);
      font("bold", 36, C.roseInk);
      doc.text(String(Math.round(rs)), M + CW, y + 34, { align: "right" });
      spaced(0);
      font("normal", 9, C.ink3);
      doc.text("Bull conviction", M, y + 50);
      doc.text("Bear skepticism", M + CW, y + 50, { align: "right" });
      const total = Math.max(1, bs + rs);
      const bw = Math.max(10, (CW - 4) * (bs / total));
      fill(C.green);
      rr(M, y + 62, bw, 9, 4.5, "F");
      fill(C.rose);
      rr(M + bw + 4, y + 62, Math.max(10, CW - bw - 4), 9, 4.5, "F");
      y += 92;
    }

    const side = (p, kind) =>
      p && {
        fill: kind === "bull" ? C.greenTint : C.roseTint,
        title: kind === "bull" ? "Bull Partner" : "Bear Partner",
        titleColor: kind === "bull" ? C.greenInk : C.roseInk,
        labelColor: kind === "bull" ? C.greenInk : C.roseInk,
        subtitle: [p.provider, kind === "bull" ? p.convictionScore && `Conviction ${p.convictionScore}/100` : p.skepticismScore && `Skepticism ${p.skepticismScore}/100`]
          .filter(Boolean)
          .join("  \u00B7  "),
        body: p.thesis,
        bodySize: 10,
        fields: [
          kind === "bull"
            ? { k: "Unfair wedge", v: p.unfairWedge }
            : { k: "CAC trap", v: p.cacUnitEconomicsTrap },
        ],
      };
    cardRow([side(bull, "bull"), side(bear, "bear")]);

    if (judge) {
      cardRow([
        {
          fill: C.tint,
          title: "Chief Judge ruling",
          titleColor: C.orangeInk,
          labelColor: C.orangeInk,
          subtitle: [`${judge.winningSide || "Consensus"} advantage`, judge.provider].filter(Boolean).join("  \u00B7  "),
          body: judge.verdictSummary,
          bodySize: 11,
          fields: [{ k: "#1 lean experiment", v: judge.numberOneExperiment }],
        },
      ]);
    }
  }

  // =========================================================================
  // VIABILITY SCORECARD
  // =========================================================================
  section("Viability Scorecard", "Verdict", "A composite of market demand, technical feasibility and monetization.");
  if (ok(viabilityScorecard)) {
    const score = num(viabilityScorecard.score);
    const cardH = 160;
    ensure(cardH + 20);
    fill(C.white);
    stroke(C.line);
    doc.setLineWidth(0.8);
    rr(M, y, CW, cardH, 26, "FD");

    if (score !== null) {
      const cx = M + 84;
      const cyy = y + 66;
      ring(cx, cyy, 44, score, 9, C.orange);
      font("bold", 30, C.ink);
      spaced(-1);
      doc.text(String(Math.round(score)), cx, cyy + 9, { align: "center" });
      spaced(0);
      font("normal", 7.5, C.ink3);
      doc.text("out of 100", cx, cyy + 22, { align: "center" });
      const t = tier(score);
      const label = clean(viabilityScorecard.verdict || "Viable").toUpperCase();
      font("bold", 7.5, t.fg);
      const pw = doc.getTextWidth(label) + 24;
      fill(t.bg);
      rr(cx - Math.min(pw, 140) / 2, y + 126, Math.min(pw, 140), 18, 9, "F");
      font("bold", 7, t.fg);
      doc.text(doc.splitTextToSize(label, 132)[0], cx, y + 138, { align: "center" });
    }

    const rx = M + 176;
    const rw = CW - 176 - 28;
    [
      ["Market demand", num(viabilityScorecard.marketDemandScore)],
      ["Technical feasibility", num(viabilityScorecard.technicalFeasibilityScore)],
      ["Monetization engine", num(viabilityScorecard.monetizationScore)],
    ]
      .filter((s) => s[1] !== null)
      .forEach(([name, v], i) => {
        const ry = y + 42 + i * 40;
        font("normal", 10, C.ink2);
        doc.text(name, rx, ry);
        font("bold", 10, C.ink);
        doc.text(`${Math.round(v)}%`, rx + rw, ry, { align: "right" });
        meter(rx, ry + 8, rw, v, C.orange, 6);
      });
    y += cardH + 18;

    callout("Executive investment thesis", viabilityScorecard.verdictReasoning, { size: 11 });
    if (okList(viabilityScorecard.fatalRiskTraps)) {
      cardRow([
        {
          fill: C.roseTint,
          title: "Fatal risk traps",
          titleColor: C.roseInk,
          items: viabilityScorecard.fatalRiskTraps,
          dot: C.rose,
        },
      ]);
    }
  } else unavailable();

  // =========================================================================
  // CUSTOMER DISCOVERY
  // =========================================================================
  section("Customer Discovery", "Validate", "Mom Test protocol: learn from their past behaviour, never pitch.");
  if (ok(customerDiscovery)) {
    if (okList(customerDiscovery.interviewQuestions)) {
      sub("Interview questions");
      numbered(customerDiscovery.interviewQuestions);
    }
    cardRow([
      okList(customerDiscovery.redFlags) && {
        fill: C.roseTint,
        title: "False-positive red flags",
        titleColor: C.roseInk,
        items: customerDiscovery.redFlags,
        dot: C.rose,
      },
      okList(customerDiscovery.willingnessToPaySignals) && {
        fill: C.greenTint,
        title: "Willingness-to-pay tests",
        titleColor: C.greenInk,
        items: customerDiscovery.willingnessToPaySignals,
        dot: C.green,
      },
    ]);
  } else unavailable();

  // =========================================================================
  // STRATEGIC FRAMEWORKS (SWOT + PORTER)
  // =========================================================================
  if (ok(swotAnalysis) || ok(portersFiveForces)) {
    section("Strategic Frameworks", "Strategy", "SWOT and Porter's Five Forces, side by side.");

    if (ok(swotAnalysis)) {
      sub("SWOT matrix");
      const q = (letter, name, subtitle, items, f, ink) => ({
        fill: f,
        badge: letter,
        badgeBg: C.white,
        title: name,
        titleColor: ink,
        subtitle,
        items,
        dot: ink,
      });
      cardRow([
        q("S", "Strengths", "Internal advantages", swotAnalysis.strengths, C.greenTint, C.greenInk),
        q("W", "Weaknesses", "Internal gaps", swotAnalysis.weaknesses, C.amberTint, C.amberInk),
      ]);
      cardRow([
        q("O", "Opportunities", "External upside", swotAnalysis.opportunities, C.tint, C.orangeInk),
        q("T", "Threats", "External risks", swotAnalysis.threats, C.roseTint, C.roseInk),
      ]);
    }

    if (ok(portersFiveForces)) {
      sub("Porter's Five Forces");
      const forces = [
        ["Buyer bargaining power", portersFiveForces.buyerPower],
        ["Supplier bargaining power", portersFiveForces.supplierPower],
        ["Competitive rivalry", portersFiveForces.competitiveRivalry],
        ["Threat of substitutes", portersFiveForces.threatOfSubstitutes],
        ["Threat of new entrants", portersFiveForces.threatOfNewEntry],
      ];
      hr(y);
      forces.forEach(([name, d]) => {
        const level = String(d?.level || "Moderate").toUpperCase();
        const n = level === "HIGH" ? 3 : level === "LOW" ? 1 : 2;
        const col = level === "HIGH" ? C.rose : level === "LOW" ? C.green : C.amber;
        const ink = level === "HIGH" ? C.roseInk : level === "LOW" ? C.greenInk : C.amberInk;
        const lines = wrap(d?.analysis, CW - 10, 9.5);
        const h = 20 + 16 + lines.length * 14.5 + 10;
        ensure(h);
        font("bold", 10.5, C.ink);
        doc.text(name, M, y + 28);
        font("bold", 8, ink);
        spaced(0.6);
        doc.text(level, M + CW, y + 28, { align: "right" });
        spaced(0);
        for (let i = 0; i < 3; i++) {
          fill(i < n ? col : C.track);
          rr(M + CW - 66 - 3 * 18 + i * 18, y + 22, 14, 6, 3, "F");
        }
        font("normal", 9.5, C.ink2);
        lines.forEach((l, i) => doc.text(l, M, y + 46 + i * 14.5));
        y += h;
        hr(y);
      });
      y += 10;
    }
  }

  // =========================================================================
  // MARKET SIZING
  // =========================================================================
  section("Market Sizing", "Market", "How big the opportunity is, from the whole market to what you can realistically win.");
  if (ok(marketSizing)) {
    const tam = marketSizing.tam || {};
    const sam = marketSizing.sam || {};
    const som = marketSizing.som || {};
    ensure(160);
    const radii = [64, 48, 35];
    const totalW = 2 * (radii[0] + radii[1] + radii[2]) - 22 - 18;
    const sx = M + (CW - totalW) / 2;
    const bottom = y + 134;
    const c1 = sx + radii[0];
    const c2 = c1 + radii[0] + radii[1] - 22;
    const c3 = c2 + radii[1] + radii[2] - 18;
    const bubbles = [
      { cx: c1, r: radii[0], bg: [253, 231, 220], fg: C.orangeInk, tag: "TAM", v: tam.value, vs: 17 },
      { cx: c2, r: radii[1], bg: [234, 108, 63], fg: C.white, tag: "SAM", v: sam.value, vs: 14 },
      { cx: c3, r: radii[2], bg: [154, 52, 18], fg: C.white, tag: "SOM", v: som.value, vs: 11 },
    ];
    bubbles.forEach((b) => {
      const cyy = bottom - b.r;
      fill(b.bg);
      doc.circle(b.cx, cyy, b.r, "F");
      font("bold", 7, b.fg);
      spaced(0.8);
      doc.text(b.tag, b.cx, cyy - 6, { align: "center" });
      spaced(0);
      font("bold", b.vs, b.fg);
      doc.text(clean(b.v || "n/a"), b.cx, cyy + b.vs * 0.55 + 3, { align: "center" });
    });
    y = bottom + 24;
    const col = (t, s, d) => ({ fill: C.soft, title: t, subtitle: s, body: d, bodySize: 9.5, bodyColor: C.ink2 });
    cardRow([
      col("TAM", "Total addressable market", tam.description),
      col("SAM", "Serviceable available market", sam.description),
      col("SOM", "Serviceable obtainable market", som.description),
    ]);
  } else unavailable();

  // =========================================================================
  // IDEA ANALYSIS
  // =========================================================================
  section("Idea Analysis", "Analysis");
  if (ok(ideaAnalysis)) {
    specRows([
      { k: "Problem", v: ideaAnalysis.problem },
      { k: "Goal", v: ideaAnalysis.goal },
      { k: "Domain", v: ideaAnalysis.domain },
      { k: "Feasibility", v: ideaAnalysis.feasibility },
    ]);
  } else unavailable();

  // =========================================================================
  // MARKET INTELLIGENCE
  // =========================================================================
  section("Market Intelligence", "Research");
  if (ok(marketResearch)) {
    if (okList(marketResearch.competitors)) {
      label("Competitors");
      chips(marketResearch.competitors);
    }
    if (okList(marketResearch.opportunities)) {
      label("Opportunities");
      bullets(marketResearch.opportunities);
    }
    callout("Market demand", marketResearch.marketDemand);
  } else unavailable();

  // =========================================================================
  // CUSTOMER PERSONA
  // =========================================================================
  section("Customer Persona", "Customer");
  if (ok(customerPersona)) {
    cardRow([
      okList(customerPersona.targetUsers) && {
        fill: C.soft, title: "Target users", items: customerPersona.targetUsers, dot: C.orange,
      },
      okList(customerPersona.painPoints) && {
        fill: C.roseTint, title: "Pain points", titleColor: C.roseInk, items: customerPersona.painPoints, dot: C.rose,
      },
    ]);
    callout("User profile", customerPersona.userProfile, { fillC: C.soft, color: C.ink, size: 11 });
  } else unavailable();

  // =========================================================================
  // PRODUCT PLANNING
  // =========================================================================
  section("Product Planning", "Product");
  if (ok(productPlan)) {
    cardRow([
      okList(productPlan.mvpFeatures) && {
        fill: C.tint, title: "MVP features", titleColor: C.orangeInk, items: productPlan.mvpFeatures, dot: C.orange,
      },
      okList(productPlan.futureFeatures) && {
        fill: C.soft, title: "Future features", items: productPlan.futureFeatures, dot: C.ink3,
      },
    ]);
    callout("Development priority", productPlan.developmentPriority, { fillC: C.soft, color: C.ink });
  } else unavailable();

  // =========================================================================
  // TECH STACK
  // =========================================================================
  section("Tech Stack", "Technology");
  if (ok(technicalArchitecture)) {
    specRows([
      { k: "Frontend", v: technicalArchitecture.frontend },
      { k: "Backend", v: technicalArchitecture.backend },
      { k: "Database", v: technicalArchitecture.database },
      { k: "Hosting", v: technicalArchitecture.hosting },
      { k: "AI APIs", v: technicalArchitecture.aiApis },
    ]);
    callout("Architecture overview", technicalArchitecture.architectureOverview);
  } else unavailable();

  // =========================================================================
  // BUSINESS STRATEGY
  // =========================================================================
  section("Business Strategy", "Business");
  if (ok(businessStrategy)) {
    specRows([
      { k: "Revenue model", v: businessStrategy.revenueModel },
      { k: "Pricing idea", v: businessStrategy.pricingIdea },
    ]);
    if (okList(businessStrategy.marketingChannels)) {
      sub("Marketing channels");
      numbered(businessStrategy.marketingChannels);
    }
  } else unavailable();

  // =========================================================================
  // COST ESTIMATOR
  // =========================================================================
  section("Cost Estimator", "Costs", "What it takes to run the product each month.");
  if (ok(costEstimator)) {
    const rows = COST_KEYS.filter((k) => costEstimator[k]).map((k) => {
      const it = costEstimator[k];
      return [COST_LABELS[k], it.monthlyCost, it.freeTierSufficient ? "Yes" : "No", it.note || ""];
    });
    table(
      [
        { h: "Item", w: 100, bold: true },
        { h: "Monthly", w: 80 },
        { h: "Free tier", w: 70, colorFn: (v) => (v === "Yes" ? C.greenInk : C.ink3) },
        { h: "Note", w: CW - 250 },
      ],
      rows
    );
    kpis([
      { label: "Estimated monthly", value: costEstimator.estimatedMonthlyCost, accent: true },
      { label: "Estimated yearly", value: costEstimator.estimatedYearlyCost },
    ]);
  } else unavailable();

  // =========================================================================
  // REVENUE SIMULATOR
  // =========================================================================
  section("Revenue Simulator", "Revenue");
  if (ok(revenueSimulator)) {
    if (revenueSimulator.pricingAssumption) {
      para(revenueSimulator.pricingAssumption, { size: 10, color: C.ink3, style: "italic" });
    }
    const proj = revenueSimulator.projections || [];
    const maxAnnual = Math.max(1, ...proj.map((p) => money(p.annualRevenue)));
    table(
      [
        { h: "Users", w: 92, bold: true },
        { h: "Monthly", w: 112 },
        { h: "Annual", w: 118, bold: true, color: C.orangeInk },
        { h: "Scale", w: CW - 322, bar: true },
      ],
      proj.map((p) => [`${p.users} users`, p.monthlyRevenue, p.annualRevenue, money(p.annualRevenue) / maxAnnual])
    );
  } else unavailable();

  // =========================================================================
  // COMPETITOR ANALYSIS
  // =========================================================================
  section("Competitor Analysis", "Competition");
  if (okList(competitorWeaknessAnalysis)) {
    competitorWeaknessAnalysis.forEach((c, i) => {
      if (i > 0) y += 8;
      ensure(120);
      font("bold", 14, C.ink);
      spaced(-0.2);
      doc.text(clean(c.competitor), M, y + 12);
      spaced(0);
      y += 24;
      cardRow([
        okList(c.weaknesses) && {
          fill: C.roseTint, title: "Weaknesses", titleColor: C.roseInk, items: c.weaknesses, dot: C.rose,
        },
        okList(c.missedOpportunities) && {
          fill: C.greenTint, title: "Missed opportunities", titleColor: C.greenInk, items: c.missedOpportunities, dot: C.green,
        },
      ]);
      callout("Suggested differentiation", c.suggestedDifferentiation);
    });
  } else unavailable();

  // =========================================================================
  // GO-TO-MARKET
  // =========================================================================
  section("Go-To-Market Strategy", "Go to market");
  if (ok(goToMarket)) {
    callout("Target audience", goToMarket.targetAudience, { fillC: C.soft, color: C.ink });
    if (okList(goToMarket.platforms)) {
      specRows(
        goToMarket.platforms.map((p) => ({
          k: typeof p === "string" ? p : (p?.name || p?.platform || "Channel"),
          v: typeof p === "string" ? "" : (p?.why || p?.strategy || p?.tactic || ""),
        }))
      );
    }
    if (okList(goToMarket.linkedInSearchStrategy)) {
      sub("LinkedIn search strategy");
      goToMarket.linkedInSearchStrategy.forEach((qr) => {
        const lines = wrap(qr, CW - 36, 9.5);
        const h = lines.length * 14 + 18;
        ensure(h + 6);
        fill(C.soft);
        rr(M, y, CW, h, 12, "F");
        font("normal", 9.5, C.ink);
        lines.forEach((l, i) => doc.text(l, M + 18, y + 9 + 9.5 * BL + i * 14));
        y += h + 6;
      });
      y += 6;
    }
    const tpls = [
      ["Cold email template", safeTemplateStr(goToMarket.coldEmailTemplate || goToMarket.coldEmail)],
      ["LinkedIn DM template", safeTemplateStr(goToMarket.linkedInDmTemplate || goToMarket.linkedInDm)],
      ["Reddit launch post", safeTemplateStr(goToMarket.redditLaunchPost || goToMarket.redditPost)],
      ["X (Twitter) launch post", safeTemplateStr(goToMarket.twitterLaunchPost || goToMarket.twitterPost || goToMarket.xPost)],
    ].filter((t) => t[1]);
    if (tpls.length) {
      sub("Ready-to-send copy");
      tpls.forEach(([name, body]) =>
        cardRow([{ fill: C.soft, title: name, titleColor: C.orangeInk, body, bodySize: 9.5, bodyColor: C.ink2 }])
      );
    }
  } else unavailable();

  // =========================================================================
  // LAUNCH CHECKLIST
  // =========================================================================
  section("Launch Checklist", "Launch");
  if (okList(launchChecklist)) {
    hr(y);
    launchChecklist.forEach((item) => {
      const lines = wrap(item, CW - 40, 10.5);
      const h = Math.max(lines.length * 15.5, 16) + 20;
      ensure(h);
      stroke([199, 199, 204]);
      doc.setLineWidth(1.4);
      doc.circle(M + 9, y + h / 2, 6.5, "S");
      font("normal", 10.5, C.ink);
      lines.forEach((l, i) => doc.text(l, M + 32, y + 10 + 10.5 * BL + i * 15.5));
      y += h;
      hr(y);
    });
    y += 10;
  } else unavailable();

  // =========================================================================
  // INVESTOR PITCH
  // =========================================================================
  section("Investor Pitch", "Investors");
  if (ok(pitch)) {
    if (pitch.elevatorPitch) {
      const lines = wrap(pitch.elevatorPitch, CW - 30, 15);
      const h = lines.length * 23;
      ensure(h + 30);
      eyebrow("Elevator pitch", M + 18, y + 8, C.orangeInk);
      fill(C.orange);
      rr(M, y, 3.5, h + 24, 1.75, "F");
      font("normal", 15, C.ink);
      lines.forEach((l, i) => doc.text(l, M + 18, y + 38 + i * 23));
      y += h + 44;
    }
    if (pitch.executiveSummary) {
      sub("Executive summary");
      para(pitch.executiveSummary, { size: 10.5 });
    }
  } else unavailable();

  // =========================================================================
  // ROADMAP
  // =========================================================================
  section("Startup Roadmap", "Roadmap", "Four weeks from idea to public launch.");
  if (ok(roadmap)) {
    const ms = arr(roadmap.milestones);
    ms.forEach((m, i) => {
      const tasks = arr(m.tasks);
      const h = 44 + bulletsHeight(tasks, CW - 34, 9.5) + 10;
      ensure(h);
      const top = y;
      if (i < ms.length - 1) {
        stroke(C.line);
        doc.setLineWidth(1.6);
        doc.line(M + 10, top + 24, M + 10, top + h + 6);
      }
      fill(C.white);
      stroke(C.orange);
      doc.setLineWidth(2.2);
      doc.circle(M + 10, top + 10, 6.5, "FD");
      eyebrow(m.week, M + 34, top + 8, C.orangeInk);
      font("bold", 13.5, C.ink);
      spaced(-0.2);
      doc.text(clean(m.title), M + 34, top + 26);
      spaced(0);
      y = top + 40;
      bullets(tasks, { x: M + 34, w: CW - 34, size: 9.5, dot: C.ink3 });
      y = top + h;
    });
    callout("Launch plan", roadmap.launchPlan);
  } else unavailable();

  // closing sign-off
  ensure(90);
  y += 24;
  hr(y);
  y += 34;
  fill(C.orange);
  doc.circle(PW / 2, y, 3, "F");
  font("bold", 11, C.ink);
  doc.text("Built with IdeaPulse AI", PW / 2, y + 22, { align: "center" });
  font("normal", 9, C.ink3);
  doc.text("idea-pulse-startup-validator.vercel.app", PW / 2, y + 38, { align: "center" });

  // =========================================================================
  // PAGE 2 — CONTENTS (drawn last so page numbers are known)
  // =========================================================================
  doc.setPage(2);
  eyebrow("Blueprint", M, 94, C.orange);
  font("bold", 32, C.ink);
  spaced(-0.6);
  doc.text("Contents", M, 130);
  spaced(0);
  const listTop = 164;
  const rowH = Math.min(30, (BOTTOM - listTop) / Math.max(1, toc.length));
  toc.forEach((t, i) => {
    const ry = listTop + i * rowH;
    font("bold", 8.5, C.orange);
    doc.text(pad2(t.n), M, ry + rowH / 2 + 3);
    font("normal", 12, C.ink);
    doc.text(clean(t.title), M + 34, ry + rowH / 2 + 4);
    font("normal", 11, C.ink3);
    doc.text(String(t.page), M + CW, ry + rowH / 2 + 4, { align: "right" });
    hr(ry + rowH);
    doc.link(M, ry, CW, rowH, { pageNumber: t.page });
  });

  // =========================================================================
  // RUNNING HEADER + FOOTER (all pages except the cover)
  // =========================================================================
  const total = doc.getNumberOfPages();
  const generated = formattedDate();
  for (let p = 2; p <= total; p++) {
    doc.setPage(p);
    fill(C.orange);
    doc.circle(M + 3, 33, 3, "F");
    font("bold", 8.5, C.ink);
    doc.text("IdeaPulse", M + 12, 36);
    font("normal", 8.5, C.ink3);
    let ht = clean(info.title);
    while (ht.length > 4 && doc.getTextWidth(ht) > 280) ht = ht.slice(0, -2);
    if (ht !== clean(info.title)) ht = ht.trim() + "...";
    doc.text(ht, M + CW, 36, { align: "right" });
    hr(48);

    font("normal", 8, C.ink3);
    doc.text(`Startup Blueprint  \u00B7  ${generated}`, M, PH - 32);
    doc.text(`${p - 1} / ${total - 1}`, M + CW, PH - 32, { align: "right" });
  }

  doc.setPage(1);
  doc.save("ideapulse-blueprint.pdf");
}
