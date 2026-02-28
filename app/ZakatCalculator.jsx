"use client";

import { useState, useRef, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const ZAKAT_RATE          = 0.025;
const GOLD_NISAB_GRAMS    = 85;
const SILVER_NISAB_GRAMS  = 595;
const DEFAULT_GOLD_PRICE  = 16473;
const DEFAULT_SILVER_PRICE = 285;

// ─── Formatting ───────────────────────────────────────────────────────────────
const formatINR = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val));
const formatIndian = (val) => {
  const n = Math.round(parseFloat(val));
  return isNaN(n) ? "" : new Intl.NumberFormat("en-IN").format(n);
};
const stripCommas = (str) => String(str).replace(/,/g, "");

// ─── useIndianInput ───────────────────────────────────────────────────────────
const useIndianInput = (initial) => {
  const [display, setDisplay] = useState(initial === 0 ? "" : formatIndian(initial));
  const inputRef = useRef(null);
  const numeric = parseFloat(stripCommas(display)) || 0;
  const onChange = (e) => {
    const raw = stripCommas(e.target.value);
    if (!/^\d*\.?\d*$/.test(raw)) return;
    if (raw === "" || raw === ".") { setDisplay(raw); return; }
    const [intPart, decPart] = raw.split(".");
    const formattedInt = intPart === "" ? "" : new Intl.NumberFormat("en-IN").format(parseInt(intPart, 10));
    const newDisplay = decPart !== undefined ? formattedInt + "." + decPart : formattedInt;
    const oldCursor = e.target.selectionStart ?? 0;
    const commasBefore = (e.target.value.slice(0, oldCursor).match(/,/g) || []).length;
    const rawCursor = oldCursor - commasBefore;
    const newCommasBefore = (newDisplay.slice(0, rawCursor).match(/,/g) || []).length;
    setDisplay(newDisplay);
    requestAnimationFrame(() => { if (inputRef.current) inputRef.current.setSelectionRange(rawCursor + newCommasBefore, rawCursor + newCommasBefore); });
  };
  const onBlur  = () => { const n = parseFloat(stripCommas(display)); setDisplay(isNaN(n) || n === 0 ? "" : formatIndian(n)); };
  const onFocus = (e) => { const l = e.target.value.length; e.target.setSelectionRange(l, l); };
  return { display, numeric, onChange, onBlur, onFocus, inputRef };
};

// ─── Guide Data ───────────────────────────────────────────────────────────────
const GUIDE = [
  { icon: "🕌", title: "What is Zakat?",
    body: "Zakat is one of the Five Pillars of Islam — an obligatory annual charity of 2.5% on wealth held above the Nisab threshold for one full lunar year (Hawl). It purifies wealth and redistributes it to those in need.",
    tip: "Zakat is due once every lunar year from the date your wealth first reached Nisab." },
  { icon: "⚖️", title: "What is Nisab?",
    body: "Nisab is the minimum wealth threshold. If your net wealth equals or exceeds 85g of gold OR 595g of silver for a full year, Zakat becomes obligatory. Most scholars use silver Nisab as it is lower, ensuring more people contribute.",
    tip: "At today's rates: Gold Nisab ≈ ₹14,00,205 · Silver Nisab ≈ ₹1,69,575" },
  { icon: "💵", title: "Cash & Savings",
    body: "Include all cash on hand plus money in savings, current, salary, or fixed deposit accounts. Use the balance on your Zakat date (anniversary of first reaching Nisab).",
    examples: ["Savings account balance", "Cash at home", "Fixed/recurring deposits"] },
  { icon: "📈", title: "Stocks & Investments",
    body: "Use the current market value of shares and mutual fund units (NAV × units). For Provident Fund, include only the amount currently withdrawable by you.",
    examples: ["Share portfolio market value", "Mutual fund NAV", "Withdrawable EPF/PPF balance"] },
  { icon: "🏪", title: "Business Assets",
    body: "Include inventory held for sale, raw materials, and working capital cash. Fixed assets like equipment, furniture, or property used in the business are NOT zakatable.",
    examples: ["Shop inventory for sale", "Business cash & bank balance", "Raw materials for production"] },
  { icon: "🤝", title: "Money Owed to You",
    body: "Include loans given to others that you are confident will be repaid. If recovery is uncertain, most scholars say you may defer Zakat until repayment is received.",
    examples: ["Personal loans given to others", "Security deposits you expect back", "Advance salary payments"] },
  { icon: "🥇", title: "Gold & Silver",
    body: "Gold worn regularly for personal use is debated — many scholars exempt one normal jewellery set. Gold kept as savings, investment, coins, or bars is definitely zakatable. Silver is generally always zakatable.",
    examples: ["Gold coins, bars, extra jewellery", "Silver utensils or ornaments", "Digital gold holdings"] },
  { icon: "📉", title: "Liabilities",
    body: "Deduct debts currently due or payable this year. For long-term loans (home loan, car loan), only deduct the instalments due in the current year — not the full outstanding balance.",
    examples: ["Credit card balance due", "Personal loan EMI due this month", "Rent or bills overdue"] },
  { icon: "🎁", title: "Who Receives Zakat?",
    body: "The Quran (9:60) specifies 8 categories: the poor, the needy, Zakat administrators, new Muslims, freeing captives (historical), debtors, in the path of Allah, and stranded travellers. Giving through a reputable Islamic charity ensures correct distribution.",
    tip: "Zakat cannot be given to parents, children, spouse, or non-Muslims (per most schools)." },
];

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const COLORS = ["#c8a96e","#5cb86a","#5b8ee6","#e07c5b","#a06ec8","#e0c85b","#5bc8c8"];
const DonutChart = ({ data }) => {
  const [hov, setHov] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return (
    <div style={{ textAlign:"center", padding:"2.5rem 1rem", color:"#4a5a4c", fontSize:"0.85rem" }}>
      Enter asset values above to see your wealth breakdown
    </div>
  );
  let cursor = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const R = 80, r = 48, cx = 100, cy = 100;
    const x1 = cx + R * Math.cos(cursor), y1 = cy + R * Math.sin(cursor);
    cursor += angle;
    const x2 = cx + R * Math.cos(cursor), y2 = cy + R * Math.sin(cursor);
    const ix1 = cx + r * Math.cos(cursor - angle), iy1 = cy + r * Math.sin(cursor - angle);
    const ix2 = cx + r * Math.cos(cursor), iy2 = cy + r * Math.sin(cursor);
    const lg = angle > Math.PI ? 1 : 0;
    return { ...d, color: COLORS[i % COLORS.length], pct: ((d.value / total) * 100).toFixed(1),
      path: `M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${ix2} ${iy2} A${r} ${r} 0 ${lg} 0 ${ix1} ${iy1}Z` };
  });
  const active = hov ? slices.find(s => s.label === hov) : null;
  return (
    <div className="donut-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            style={{ opacity: hov && hov !== s.label ? 0.25 : 1, cursor:"pointer", transition:"opacity 0.2s, transform 0.15s", transformOrigin:"100px 100px", transform: hov === s.label ? "scale(1.04)" : "scale(1)" }}
            onMouseEnter={() => setHov(s.label)} onMouseLeave={() => setHov(null)} />
        ))}
        <text x="100" y="95"  textAnchor="middle" fill="#f0ece3" fontSize="14" fontWeight="600">{active ? active.pct+"%" : "Total"}</text>
        <text x="100" y="112" textAnchor="middle" fill="#7a8a7d" fontSize="8.5">{active ? active.label : formatINR(total)}</text>
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className={`legend-row ${hov === s.label ? "legend-hov" : ""}`}
            onMouseEnter={() => setHov(s.label)} onMouseLeave={() => setHov(null)}>
            <span className="legend-dot" style={{ background: s.color }} />
            <span className="legend-name">{s.label}</span>
            <span className="legend-pct">{s.pct}%</span>
            <span className="legend-amt">{formatINR(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Print via hidden iframe (no popup blocker issues) ────────────────────────
const triggerPrint = (data) => {
  const { rows, totalAssets, totalLiabilities, net, nisab, meetsNisab, zakatDue, gp, sp } = data;
  const today = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
  const html = `<!DOCTYPE html><html><head><title>Zakat Summary</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Outfit:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Outfit',sans-serif;color:#1a1a1a;padding:36px 44px;max-width:640px;margin:0 auto}
  .top{text-align:center;border-bottom:2px solid #c8a96e;padding-bottom:18px;margin-bottom:24px}
  .arabic{font-family:'Amiri',serif;font-size:26px;color:#c8a96e;display:block;margin-bottom:2px}
  h1{font-size:22px;font-weight:600}
  .date{color:#999;font-size:12px;margin-top:3px}
  .sec-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#c8a96e;font-weight:600;margin:18px 0 6px;border-bottom:1px solid #ede0c8;padding-bottom:3px}
  table{width:100%;border-collapse:collapse}
  tr{border-bottom:1px solid #f5efe4}
  td{padding:6px 2px;font-size:13px}
  td:last-child{text-align:right;color:#7a5a20;font-weight:500}
  .sbox{background:#faf7f0;border:1px solid #e8ddc0;border-radius:8px;padding:14px 16px;margin-top:20px}
  .sr{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#666;border-bottom:1px solid #ede8d8}
  .sr:last-child{border-bottom:none}
  .sr.bold{color:#1a1a1a;font-weight:600;font-size:14px}
  .zbox{margin-top:20px;border:2px solid ${meetsNisab?"#5cb86a":"#e07c7c"};border-radius:10px;padding:18px;text-align:center;background:${meetsNisab?"#f0faf2":"#fdf5f5"}}
  .zlabel{font-family:'Amiri',serif;color:#c8a96e;font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
  .zamt{font-size:32px;font-weight:700;color:${meetsNisab?"#1a6e2a":"#999"}}
  .zstatus{font-size:12px;color:${meetsNisab?"#2a8a3a":"#c05050"};margin-top:5px}
  .foot{margin-top:18px;font-size:10px;color:#bbb;text-align:center;line-height:1.7}
</style></head><body>
<div class="top"><span class="arabic">حاسبة الزكاة</span><h1>Zakat Calculation Summary</h1><p class="date">Prepared on ${today}</p></div>
<div class="sec-label">Assets</div>
<table>${rows.filter(r=>r.s==="a").map(r=>`<tr><td>${r.l}</td><td>${formatINR(r.v)}</td></tr>`).join("")}</table>
<div class="sec-label">Liabilities</div>
<table>${rows.filter(r=>r.s==="l").map(r=>`<tr><td>${r.l}</td><td>${formatINR(r.v)}</td></tr>`).join("")}</table>
<div class="sbox">
  <div class="sr"><span>Total Assets</span><span>${formatINR(totalAssets)}</span></div>
  <div class="sr"><span>Total Liabilities</span><span>− ${formatINR(totalLiabilities)}</span></div>
  <div class="sr bold"><span>Net Zakatable Wealth</span><span>${formatINR(net)}</span></div>
  <div class="sr"><span>Nisab (Silver 595g × ₹${sp}/g)</span><span>${formatINR(nisab)}</span></div>
</div>
<div class="zbox">
  <div class="zlabel">Zakat Due (2.5%)</div>
  <div class="zamt">${meetsNisab ? formatINR(zakatDue) : "Not Obligatory"}</div>
  <div class="zstatus">${meetsNisab ? "✓ Nisab threshold met" : "✗ Wealth is below Nisab threshold"}</div>
</div>
<p class="foot">Gold: ₹${gp}/gram · Silver: ₹${sp}/gram · Rates as of ${today}<br/>This is an estimate. Consult a qualified Islamic scholar for your specific situation.</p>
</body></html>`;

  // Use hidden iframe — no popup blocker issues
  const existing = document.getElementById("__zakat_print_frame");
  if (existing) existing.remove();
  const iframe = document.createElement("iframe");
  iframe.id = "__zakat_print_frame";
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:800px;height:600px;border:none;";
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  iframe.contentWindow.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };
  // Fallback if onload already fired
  setTimeout(() => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch(e) {}
  }, 800);
};

// ─── Input Row ────────────────────────────────────────────────────────────────
const InputRow = ({ label, hint, field, prefix = "₹" }) => (
  <div className="irow">
    <div className="irow-labels">
      <span className="irow-label">{label}</span>
      {hint && <span className="irow-hint">{hint}</span>}
    </div>
    <div className="irow-input">
      <span className="irow-pre">{prefix}</span>
      <input ref={field.inputRef} type="text" inputMode="numeric"
        value={field.display} onChange={field.onChange} onBlur={field.onBlur} onFocus={field.onFocus}
        placeholder="0" autoComplete="off" />
    </div>
  </div>
);

// ─── Guide Tab ────────────────────────────────────────────────────────────────
const GuideTab = () => {
  const [active, setActive] = useState(0);
  const s = GUIDE[active];
  return (
    <div className="guide-wrap">
      <div className="guide-sidebar">
        {GUIDE.map((g, i) => (
          <button key={i} className={`gsb-btn ${i === active ? "gsb-active" : ""}`} onClick={() => setActive(i)}>
            <span className="gsb-icon">{g.icon}</span>
            <span className="gsb-title">{g.title}</span>
          </button>
        ))}
      </div>
      <div className="guide-content">
        <div className="gc-icon">{s.icon}</div>
        <h3 className="gc-title">{s.title}</h3>
        <p className="gc-body">{s.body}</p>
        {s.examples && (
          <div className="gc-examples">
            <p className="gc-ex-label">Common Examples</p>
            {s.examples.map((ex, i) => (
              <div key={i} className="gc-ex-row"><span className="gc-ex-dot">◆</span><span>{ex}</span></div>
            ))}
          </div>
        )}
        {s.tip && (
          <div className="gc-tip">
            <span className="gc-tip-icon">💡</span>
            <span>{s.tip}</span>
          </div>
        )}
        <div className="gc-pager">
          <button className="gc-page-btn" onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}>← Previous</button>
          <span className="gc-page-num">{active + 1} of {GUIDE.length}</span>
          <button className="gc-page-btn" onClick={() => setActive(Math.min(GUIDE.length - 1, active + 1))} disabled={active === GUIDE.length - 1}>Next →</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ZakatCalculator() {
  const [tab, setTab] = useState("calc"); // "calc" | "guide"

  const cashSavings    = useIndianInput(0);
  const investments    = useIndianInput(0);
  const businessAssets = useIndianInput(0);
  const receivables    = useIndianInput(0);
  const otherAssets    = useIndianInput(0);
  const goldGrams      = useIndianInput(0);
  const silverGrams    = useIndianInput(0);
  const goldPrice      = useIndianInput(DEFAULT_GOLD_PRICE);
  const silverPrice    = useIndianInput(DEFAULT_SILVER_PRICE);
  const debts          = useIndianInput(0);
  const expenses       = useIndianInput(0);

  const goldValue   = goldGrams.numeric * goldPrice.numeric;
  const silverValue = silverGrams.numeric * silverPrice.numeric;
  const totalAssets = cashSavings.numeric + investments.numeric + businessAssets.numeric +
    receivables.numeric + goldValue + silverValue + otherAssets.numeric;
  const totalLiabilities   = debts.numeric + expenses.numeric;
  const netZakatableWealth = Math.max(0, totalAssets - totalLiabilities);
  const goldNisabValue     = GOLD_NISAB_GRAMS * goldPrice.numeric;
  const silverNisabValue   = SILVER_NISAB_GRAMS * silverPrice.numeric;
  const nisabThreshold     = Math.min(goldNisabValue, silverNisabValue);
  const meetsNisab         = netZakatableWealth >= nisabThreshold;
  const zakatDue           = meetsNisab ? netZakatableWealth * ZAKAT_RATE : 0;

  const chartData = [
    { label: "Cash & Savings",  value: cashSavings.numeric },
    { label: "Investments",     value: investments.numeric },
    { label: "Business Assets", value: businessAssets.numeric },
    { label: "Receivables",     value: receivables.numeric },
    { label: "Gold",            value: goldValue },
    { label: "Silver",          value: silverValue },
    { label: "Other",           value: otherAssets.numeric },
  ].filter(d => d.value > 0);

  const printRows = [
    { s:"a", l:"Cash & Bank Savings",          v: cashSavings.numeric },
    { s:"a", l:"Stocks & Investments",          v: investments.numeric },
    { s:"a", l:"Business Inventory / Assets",   v: businessAssets.numeric },
    { s:"a", l:"Money Owed to You",             v: receivables.numeric },
    { s:"a", l:`Gold (${goldGrams.numeric}g × ₹${goldPrice.numeric}/g)`, v: goldValue },
    { s:"a", l:`Silver (${silverGrams.numeric}g × ₹${silverPrice.numeric}/g)`, v: silverValue },
    { s:"a", l:"Other Zakatable Assets",        v: otherAssets.numeric },
    { s:"l", l:"Outstanding Debts",             v: debts.numeric },
    { s:"l", l:"Essential Expenses Due",        v: expenses.numeric },
  ].filter(r => r.v > 0);

  // Completion tracking — how many fields have been touched
  const filled = [cashSavings, investments, businessAssets, receivables, otherAssets, goldGrams, silverGrams, debts, expenses].filter(f => f.numeric > 0).length;
  const total9 = 9;
  const progress = Math.round((filled / total9) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f0b; min-height: 100vh; font-family: 'Outfit', sans-serif; }

        /* ── Page layout ── */
        .page {
          min-height: 100vh;
          background: radial-gradient(ellipse 90% 50% at 50% -5%, #162e1c 0%, #0a0f0b 55%);
          padding: 0 0 6rem;
        }

        /* ── Top header ── */
        .topbar {
          background: #0d1410;
          border-bottom: 1px solid #1a2e1c;
          padding: 1.25rem 1.5rem 0;
          position: sticky; top: 0; z-index: 50;
        }
        .topbar-inner { max-width: 900px; margin: 0 auto; }
        .topbar-row1 { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .topbar-brand { flex: 1; }
        .topbar-arabic { font-family: 'Amiri', serif; font-size: 1.2rem; color: #c8a96e; display: block; line-height: 1; }
        .topbar-title { font-size: 1.25rem; font-weight: 600; color: #f0ece3; letter-spacing: -0.01em; }
        .topbar-actions { display: flex; gap: 0.5rem; }
        .tbn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.9rem; border-radius: 8px; font-size: 0.78rem;
          font-family: 'Outfit', sans-serif; font-weight: 500; cursor: pointer;
          border: 1px solid; transition: all 0.2s;
        }
        .tbn-print { background: #1e1508; border-color: #5a3e12; color: #c8a96e; }
        .tbn-print:hover { background: #2a1e0a; border-color: #c8a96e; }

        /* ── Tabs ── */
        .tabs { display: flex; gap: 0; border-bottom: none; }
        .tab-btn {
          padding: 0.65rem 1.25rem; background: none; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 500;
          color: #4a6a4c; border-bottom: 2px solid transparent;
          transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem;
        }
        .tab-btn:hover { color: #8aaa8c; }
        .tab-btn.tab-active { color: #c8a96e; border-bottom-color: #c8a96e; }

        /* ── Main content ── */
        .main { max-width: 900px; margin: 0 auto; padding: 1.5rem 1rem 0; }

        /* ── Two-column layout for calc tab ── */
        .calc-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.25rem; align-items: start; }

        /* ── Card ── */
        .card { background: #0f1810; border: 1px solid #1a2e1c; border-radius: 14px; overflow: hidden; margin-bottom: 1rem; }
        .card-head { display: flex; align-items: center; gap: 0.6rem; padding: 0.85rem 1.25rem; border-bottom: 1px solid #1a2e1c; background: #0c1410; }
        .card-head-icon { font-size: 1rem; }
        .card-head-title { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #c8a96e; }
        .card-body { padding: 0.85rem 1.25rem 1rem; }
        .subdivider { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: #3a5a3c; padding: 0.75rem 0 0.2rem; border-top: 1px dashed #1a2a1c; margin-top: 0.3rem; }

        /* ── Input rows ── */
        .irow { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid #141e14; }
        .irow:last-child { border-bottom: none; }
        .irow-labels { flex: 1; min-width: 0; }
        .irow-label { display: block; color: #ccc9c0; font-size: 0.86rem; }
        .irow-hint { display: block; color: #3a5a3c; font-size: 0.72rem; margin-top: 1px; }
        .irow-input { display: flex; align-items: center; background: #080d09; border: 1px solid #243826; border-radius: 7px; overflow: hidden; transition: border-color 0.15s; width: 160px; flex-shrink: 0; }
        .irow-input:focus-within { border-color: #c8a96e; background: #0a1009; }
        .irow-pre { padding: 0 0.5rem; color: #3a5a3c; font-size: 0.8rem; user-select: none; white-space: nowrap; }
        .irow-input input { flex: 1; background: transparent; border: none; outline: none; color: #f0ece3; font-family: 'Outfit', sans-serif; font-size: 0.88rem; padding: 0.45rem 0.4rem 0.45rem 0; min-width: 0; }
        .irow-input input::placeholder { color: #1e3020; }

        /* ── Progress bar ── */
        .progress-wrap { margin-bottom: 1rem; }
        .progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
        .progress-label { font-size: 0.72rem; color: #4a6a4c; }
        .progress-pct { font-size: 0.72rem; color: #c8a96e; font-weight: 500; }
        .progress-track { height: 3px; background: #1a2e1c; border-radius: 2px; }
        .progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #3a7a3c, #c8a96e); transition: width 0.4s ease; }

        /* ── Right column: summary + chart ── */
        .right-col { position: sticky; top: 112px; display: flex; flex-direction: column; gap: 1rem; }

        /* ── Summary card ── */
        .sum-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #141e14; font-size: 0.85rem; color: #6a8a6c; }
        .sum-row:last-child { border-bottom: none; }
        .sum-row.sum-strong { color: #d4cfc6; font-weight: 500; }
        .sum-val { color: #c8a96e; font-weight: 500; font-variant-numeric: tabular-nums; }
        .sum-row.sum-strong .sum-val { color: #e0d4b8; }
        .nisab-pill { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; padding: 0.15rem 0.6rem; border-radius: 100px; font-weight: 500; }
        .nisab-pill.met { background: #1a3a1e; color: #5cb86a; border: 1px solid #2a4a2e; }
        .nisab-pill.no  { background: #3a1a1a; color: #b85c5c; border: 1px solid #4a2a2a; }

        /* ── Zakat result card ── */
        .result-card {
          background: linear-gradient(140deg, #162a16, #0e1a0e);
          border: 1px solid #c8a96e30; border-radius: 14px; padding: 1.25rem;
          text-align: center; position: relative; overflow: hidden;
        }
        .result-card.glowing { border-color: #c8a96e60; box-shadow: 0 0 28px #c8a96e18; }
        .result-card::before { content:''; position:absolute; top:-50px; left:50%; transform:translateX(-50%); width:160px; height:80px; background:radial-gradient(#c8a96e15, transparent 70%); pointer-events:none; }
        .result-arabic { font-family: 'Amiri', serif; color: #c8a96e; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.3rem; display: block; }
        .result-amount { font-size: 2.2rem; font-weight: 600; color: #f0ece3; letter-spacing: -0.03em; line-height: 1.1; }
        .result-amount.result-zero { color: #3a5a3c; }
        .result-note { margin-top: 0.4rem; color: #4a6a4c; font-size: 0.75rem; line-height: 1.4; }

        /* ── Donut chart ── */
        .donut-wrap { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; justify-content: center; }
        .donut-legend { flex: 1; min-width: 140px; display: flex; flex-direction: column; gap: 0.3rem; }
        .legend-row { display: flex; align-items: center; gap: 0.4rem; cursor: pointer; padding: 0.2rem 0.35rem; border-radius: 5px; transition: background 0.15s; }
        .legend-row:hover, .legend-hov { background: #152015; }
        .legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
        .legend-name { flex: 1; color: #7a9a7c; font-size: 0.75rem; }
        .legend-pct { color: #c8a96e; font-size: 0.72rem; font-weight: 500; margin-right: 0.25rem; }
        .legend-amt { color: #4a6a4c; font-size: 0.7rem; font-variant-numeric: tabular-nums; }

        /* ── Sticky bottom bar ── */
        .sticky-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: #0d1610ee; backdrop-filter: blur(12px);
          border-top: 1px solid #1e3020;
          padding: 0.75rem 1.25rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          transition: transform 0.3s;
        }
        .sticky-bar-inner { max-width: 900px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .sticky-label { font-size: 0.75rem; color: #4a6a4c; }
        .sticky-amount { font-size: 1.4rem; font-weight: 600; color: #c8a96e; letter-spacing: -0.02em; line-height: 1; }
        .sticky-amount.sticky-zero { color: #2a4a2c; }
        .sticky-nisab { font-size: 0.7rem; }
        .sticky-print-btn {
          background: #1e1508; border: 1px solid #5a3e12; color: #c8a96e;
          padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 500;
          transition: all 0.2s; white-space: nowrap;
        }
        .sticky-print-btn:hover { background: #2a1e0a; border-color: #c8a96e; }

        /* ── Guide layout ── */
        .guide-wrap { display: flex; gap: 0; background: #0f1810; border: 1px solid #1a2e1c; border-radius: 14px; overflow: hidden; min-height: 540px; }
        .guide-sidebar { width: 200px; flex-shrink: 0; border-right: 1px solid #1a2e1c; background: #0c1410; overflow-y: auto; }
        .gsb-btn { display: flex; align-items: flex-start; gap: 0.6rem; width: 100%; padding: 0.7rem 1rem; background: none; border: none; border-left: 2px solid transparent; cursor: pointer; text-align: left; transition: all 0.15s; }
        .gsb-btn:hover { background: #142014; }
        .gsb-active { background: #162a18 !important; border-left-color: #c8a96e !important; }
        .gsb-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
        .gsb-title { font-family: 'Outfit', sans-serif; font-size: 0.78rem; color: #7a9a7c; line-height: 1.3; }
        .gsb-active .gsb-title { color: #e0d4b8; }
        .guide-content { flex: 1; padding: 1.75rem 1.75rem 1.25rem; overflow-y: auto; }
        .gc-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .gc-title { font-size: 1.2rem; font-weight: 600; color: #f0ece3; margin-bottom: 0.75rem; }
        .gc-body { color: #8aaa8c; font-size: 0.9rem; line-height: 1.75; }
        .gc-examples { margin-top: 1.25rem; background: #0a1209; border: 1px solid #1a2e1c; border-radius: 10px; padding: 1rem 1.1rem; }
        .gc-ex-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c8a96e; margin-bottom: 0.6rem; }
        .gc-ex-row { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.84rem; color: #5a8a5c; padding: 0.2rem 0; }
        .gc-ex-dot { color: #c8a96e; font-size: 0.45rem; margin-top: 0.4rem; flex-shrink: 0; }
        .gc-tip { margin-top: 1.1rem; background: #1a2e14; border: 1px solid #2a4a1c; border-radius: 8px; padding: 0.75rem 1rem; display: flex; gap: 0.6rem; font-size: 0.83rem; color: #6a9a6c; line-height: 1.5; }
        .gc-tip-icon { font-size: 1rem; flex-shrink: 0; }
        .gc-pager { display: flex; align-items: center; justify-content: space-between; margin-top: 1.75rem; padding-top: 1rem; border-top: 1px solid #1a2e1c; }
        .gc-page-btn { background: #152015; border: 1px solid #243824; color: #7a9a7c; padding: 0.38rem 0.9rem; border-radius: 7px; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.8rem; transition: all 0.15s; }
        .gc-page-btn:hover:not(:disabled) { background: #1e2e1e; color: #f0ece3; }
        .gc-page-btn:disabled { opacity: 0.3; cursor: default; }
        .gc-page-num { font-size: 0.78rem; color: #3a5a3c; }

        .footer-note { color: #2a4a2c; font-size: 0.72rem; text-align: center; line-height: 1.7; padding: 1.5rem 0 0; }

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .calc-grid { grid-template-columns: 1fr; }
          .right-col { position: static; }
          .topbar-title { font-size: 1rem; }
          .topbar-arabic { font-size: 1rem; }
          .guide-wrap { flex-direction: column; }
          .guide-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #1a2e1c; display: flex; overflow-x: auto; padding: 0.4rem; gap: 0.2rem; }
          .gsb-btn { flex-shrink: 0; border-left: none; border-bottom: 2px solid transparent; border-radius: 7px; flex-direction: column; align-items: center; padding: 0.4rem 0.6rem; min-width: 64px; }
          .gsb-active { border-bottom-color: #c8a96e !important; }
          .irow-input { width: 140px; }
          .sticky-amount { font-size: 1.15rem; }
        }
      `}</style>

      {/* ── Sticky Topbar ── */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-row1">
            <div className="topbar-brand">
              <span className="topbar-arabic">حاسبة الزكاة</span>
              <span className="topbar-title">Zakat Calculator</span>
            </div>
            <div className="topbar-actions">
              <button className="tbn tbn-print" onClick={() => triggerPrint({ rows: printRows, totalAssets, totalLiabilities, net: netZakatableWealth, nisab: nisabThreshold, meetsNisab, zakatDue, gp: goldPrice.numeric, sp: silverPrice.numeric })}>
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>
          <div className="tabs">
            <button className={`tab-btn ${tab === "calc" ? "tab-active" : ""}`} onClick={() => setTab("calc")}>🧮 Calculator</button>
            <button className={`tab-btn ${tab === "guide" ? "tab-active" : ""}`} onClick={() => setTab("guide")}>📖 Zakat Guide</button>
          </div>
        </div>
      </div>

      <div className="page">
        <div className="main">

          {/* ── CALCULATOR TAB ── */}
          {tab === "calc" && (
            <>
              {/* Progress */}
              <div className="progress-wrap">
                <div className="progress-row">
                  <span className="progress-label">{filled === 0 ? "Start by entering your assets below" : `${filled} of ${total9} fields filled`}</span>
                  <span className="progress-pct">{progress}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: progress + "%" }} /></div>
              </div>

              <div className="calc-grid">
                {/* Left column — inputs */}
                <div>
                  {/* Cash */}
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">💵</span><span className="card-head-title">Cash & Liquid Assets</span></div>
                    <div className="card-body">
                      <InputRow label="Cash & Bank Savings"          field={cashSavings} />
                      <InputRow label="Stocks & Investments"         hint="Market value today"              field={investments} />
                      <InputRow label="Business Inventory / Assets"  hint="Goods for sale, working capital" field={businessAssets} />
                      <InputRow label="Money Owed to You"            hint="Loans you expect back"           field={receivables} />
                      <InputRow label="Other Zakatable Assets"       field={otherAssets} />
                    </div>
                  </div>

                  {/* Gold & Silver */}
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">🥇</span><span className="card-head-title">Gold & Silver</span></div>
                    <div className="card-body">
                      <InputRow label="Gold (grams)"   hint="Savings jewellery, coins, bars" field={goldGrams}   prefix="g" />
                      <InputRow label="Silver (grams)" field={silverGrams} prefix="g" />
                      <div className="subdivider">Market Prices — update to today's rates</div>
                      <InputRow label="Gold price / gram"
                        hint={goldGrams.numeric > 0 ? `Value: ${formatINR(goldValue)} · Nisab(85g)=${formatINR(goldNisabValue)}` : `Nisab (85g) = ${formatINR(goldNisabValue)}`}
                        field={goldPrice} />
                      <InputRow label="Silver price / gram"
                        hint={silverGrams.numeric > 0 ? `Value: ${formatINR(silverValue)} · Nisab(595g)=${formatINR(silverNisabValue)}` : `Nisab (595g) = ${formatINR(silverNisabValue)}`}
                        field={silverPrice} />
                    </div>
                  </div>

                  {/* Liabilities */}
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">📉</span><span className="card-head-title">Liabilities to Deduct</span></div>
                    <div className="card-body">
                      <InputRow label="Outstanding Debts"      hint="Credit cards, loans due now" field={debts} />
                      <InputRow label="Essential Expenses Due" hint="Bills due within lunar year"  field={expenses} />
                    </div>
                  </div>
                </div>

                {/* Right column — summary + chart */}
                <div className="right-col">
                  {/* Zakat Due */}
                  <div className={`result-card ${meetsNisab ? "glowing" : ""}`}>
                    <span className="result-arabic">Zakat Due (2.5%)</span>
                    <div className={`result-amount ${zakatDue === 0 ? "result-zero" : ""}`}>
                      {zakatDue === 0 ? "—" : formatINR(zakatDue)}
                    </div>
                    {meetsNisab && <p className="result-note">2.5% of {formatINR(netZakatableWealth)}</p>}
                    {!meetsNisab && netZakatableWealth > 0 && <p className="result-note">Below Nisab — not obligatory yet</p>}
                    {totalAssets === 0 && <p className="result-note">Enter your assets to calculate</p>}
                  </div>

                  {/* Summary */}
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">📋</span><span className="card-head-title">Summary</span></div>
                    <div className="card-body">
                      <div className="sum-row"><span>Total Assets</span><span className="sum-val">{formatINR(totalAssets)}</span></div>
                      <div className="sum-row"><span>Liabilities</span><span className="sum-val">−{formatINR(totalLiabilities)}</span></div>
                      <div className="sum-row sum-strong"><span>Net Zakatable</span><span className="sum-val">{formatINR(netZakatableWealth)}</span></div>
                      <div className="sum-row"><span>Nisab (Silver)</span><span className="sum-val">{formatINR(nisabThreshold)}</span></div>
                      <div className="sum-row">
                        <span>Status</span>
                        <span className={`nisab-pill ${meetsNisab ? "met" : "no"}`}>{meetsNisab ? "✓ Nisab Met" : "✗ Below Nisab"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Chart — always visible */}
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">📊</span><span className="card-head-title">Asset Breakdown</span></div>
                    <div className="card-body">
                      <DonutChart data={chartData} />
                    </div>
                  </div>
                </div>
              </div>

              <p className="footer-note">
                All amounts in Indian Rupees (INR) · Gold & silver rates as of 28 Feb 2026<br />
                This is an estimate only — consult a qualified Islamic scholar for your situation
              </p>
            </>
          )}

          {/* ── GUIDE TAB ── */}
          {tab === "guide" && <GuideTab />}

        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="sticky-bar">
        <div className="sticky-bar-inner">
          <div>
            <div className="sticky-label">Zakat Due</div>
            <div className={`sticky-amount ${zakatDue === 0 ? "sticky-zero" : ""}`}>
              {zakatDue === 0 ? (netZakatableWealth > 0 ? "Below Nisab" : "—") : formatINR(zakatDue)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="sticky-label">Net Zakatable Wealth</div>
            <div style={{ fontSize: "0.88rem", color: "#6a8a6c", fontVariantNumeric: "tabular-nums" }}>{formatINR(netZakatableWealth)}</div>
          </div>
          <button className="sticky-print-btn" onClick={() => triggerPrint({ rows: printRows, totalAssets, totalLiabilities, net: netZakatableWealth, nisab: nisabThreshold, meetsNisab, zakatDue, gp: goldPrice.numeric, sp: silverPrice.numeric })}>
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>
    </>
  );
}