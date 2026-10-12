/* ================= shared ================= */
const G_PER_OZ = 28.35, CM2_PER_IN2 = 6.4516;
const CAN_G = 794;   // one large (28 oz) can of tomatoes
const LS_KEY = "pizza-night-planner-v2", LS_OLD = "detroit-pan-planner-v1";
const $ = (s) => document.querySelector(s);
const clone = (o) => JSON.parse(JSON.stringify(o));
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

/* Pizza styles. To add another style: add an entry here, a screen block in the HTML, and its render/text functions. */
const TYPES = [
  { id: "detroit", label: "Detroit-style", blurb: "Thick pan pizza with a crispy cheese edge",
    credit: "Detroit ratios adapted from Charlie Anderson's Detroit-Style Pizza Calculator (V2).",
    icon: `<svg width="44" height="34" viewBox="0 0 44 34" aria-hidden="true"><rect x="1" y="1" width="42" height="32" rx="3" fill="var(--steel)"/><rect x="4" y="4" width="36" height="26" rx="1.5" fill="var(--dough)" stroke="var(--frico)" stroke-width="2"/><rect x="7" y="10" width="30" height="4" rx="2" fill="var(--sauce)"/><rect x="7" y="20" width="30" height="4" rx="2" fill="var(--sauce)"/></svg>` },
  { id: "nyc", label: "New York-style", blurb: "Thin, foldable round pies",
    credit: "New York ratios adapted from Charlie Anderson's NYC Pizza Calculator.",
    icon: `<svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="18" fill="var(--dough)" stroke="var(--frico)" stroke-width="1.5"/><circle cx="19" cy="19" r="14.5" fill="var(--sauce)"/><circle cx="14" cy="15" r="3.5" fill="var(--mozz)"/><circle cx="24" cy="13" r="3" fill="var(--mozz)"/><circle cx="23" cy="24" r="4" fill="var(--mozz)"/><circle cx="13" cy="24" r="2.5" fill="var(--mozz)"/></svg>` },
  { id: "sourdough", label: "Sourdough", blurb: "Naturally leavened, 72-hour cold ferment",
    credit: "Sourdough formula developed for this planner.",
    icon: sdPieSVG(38) }
];
function sdPieSVG(size) {
  const r = size / 2, c = r, k = size / 38;
  const spots = [[-0.8, -0.45], [0.55, -0.75], [0.85, 0.35], [-0.3, 0.88], [-0.88, 0.3], [0.2, -0.92]];
  const blobs = [[-0.32, -0.2, 0.2], [0.3, -0.28, 0.17], [0.05, 0.35, 0.22]];
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle cx="${c}" cy="${c}" r="${r - 1}" fill="var(--dough)" stroke="var(--frico)" stroke-width="${1.2 * k}"/>
    ${spots.map(([x, y]) => `<circle cx="${c + x * (r - 2.5 * k)}" cy="${c + y * (r - 2.5 * k)}" r="${1.3 * k}" fill="var(--char)"/>`).join("")}
    <circle cx="${c}" cy="${c}" r="${r * 0.72}" fill="var(--sauce)"/>
    ${blobs.map(([x, y, rr]) => `<circle cx="${c + x * r}" cy="${c + y * r}" r="${rr * r}" fill="var(--mozz)"/>`).join("")}
    <ellipse cx="${c + 0.3 * r}" cy="${c + 0.12 * r}" rx="${0.14 * r}" ry="${0.07 * r}" transform="rotate(-35 ${c + 0.3 * r} ${c + 0.12 * r})" fill="var(--basil)"/>
    <ellipse cx="${c - 0.28 * r}" cy="${c + 0.3 * r}" rx="${0.13 * r}" ry="${0.065 * r}" transform="rotate(25 ${c - 0.28 * r} ${c + 0.3 * r})" fill="var(--basil)"/>
  </svg>`;
}

/* ================= Sourdough config ================= */
const SD_ADV_DEFAULTS = { starter: 14, salt: 2 };
const SD_HOUSE_HYDRATION = 72;
const SD_TF = 0.085;              // oz of dough per sq in for a thin, pizza-oven pie; used only to estimate size
const SD_TOP = { sauce: 0.32, mozz: 0.36 };   // per gram of dough ball; ~80 g sauce and ~90 g mozzarella on a 250 g ball

/* ================= Detroit config ================= */
const STYLES = {
  traditional: { label: "Traditional", hydration: 65, tf: 0.1323 },
  artisan:     { label: "Artisan",     hydration: 75, tf: 0.1256 }
};
const CHEESE = [
  { id: "low", label: "Light", pct: 93.5 }, { id: "medium", label: "Medium", pct: 113.5 },
  { id: "high", label: "Heavy", pct: 133.5 }, { id: "cheesy", label: "Take it cheesy", pct: 153.5 }
];
const SAUCE = [
  { id: "low", label: "Light", pct: 69 }, { id: "medium", label: "Medium", pct: 89 },
  { id: "high", label: "Heavy", pct: 109 }, { id: "danger", label: "Danger", pct: 129 }
];
const PRESETS = [
  { id: "8x10",  label: "8 × 10 in Detroit pan",  shape: "rect",  a: 8,  b: 10 },
  { id: "10x14", label: "10 × 14 in Detroit pan", shape: "rect",  a: 10, b: 14 },
  { id: "9x13",  label: "9 × 13 in baking pan",   shape: "rect",  a: 9,  b: 13 },
  { id: "12x12", label: "12 × 12 in square",      shape: "rect",  a: 12, b: 12 },
  { id: "r10",   label: "10 in round",            shape: "round", a: 10 },
  { id: "r12",   label: "12 in round",            shape: "round", a: 12 }
];
const ADV_DEFAULTS = { hydration: null, tf: null, ww: 5, malt: 1, yeast: 0.5, salt: 2 };

/* ================= NYC config ================= */
const N_CRUST = [
  { id: "traditional", label: "Traditional", sub: "61% water", hydration: 61 },
  { id: "airy", label: "Airy", sub: "65% · recommended", hydration: 65 },
  { id: "ultra", label: "Ultra airy", sub: "69% water", hydration: 69 }
];
const N_LEVELS = [
  { id: "low", label: "Light", pct: 58.5 }, { id: "medium", label: "Medium", pct: 68.5 },
  { id: "high", label: "Heavy", pct: 78.5 }, { id: "max", label: "", pct: 90.5 }
];
const N_ADV_DEFAULTS = { hydration: null, tf: 0.09, rye: 9.1, salt: 3, yeast: 0.5, sugar: 1.5 };
const N_PROTEIN_DEFAULTS = { start: 12.7, vwg: 75, goal: 14.2 };
const N_SIZES = [12, 14, 16, 18];

const DEFAULTS = {
  type: "detroit",
  detroit: {
    pans: [{ shape: "rect", a: 8, b: 10, count: 4 }],
    dimUnit: "in", style: "artisan", cheese: "medium", sauce: "medium",
    adv: { ...ADV_DEFAULTS }, tomatoG: CAN_G, bake: null, ferment: 2, proof: 3, oven: "home"
  },
  nyc: {
    size: 14, unit: "in", count: 1, crust: "airy", cheese: "medium", sauce: "medium", flour: "hg",
    protein: { ...N_PROTEIN_DEFAULTS }, adv: { ...N_ADV_DEFAULTS }, tomatoG: CAN_G, redpack: false
  },
  sourdough: {
    count: 6, ball: 217, hydration: SD_HOUSE_HYDRATION, adv: { ...SD_ADV_DEFAULTS }, bake: null, fridge: 72
  }
};

let S = load();
let D = S.detroit, N = S.nyc, Sd = S.sourdough;

function load() {
  const s = clone(DEFAULTS);
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (TYPES.some((t) => t.id === o.type)) s.type = o.type;
      Object.assign(s.detroit, o.detroit || {});
      Object.assign(s.nyc, o.nyc || {});
      Object.assign(s.sourdough, o.sourdough || {});
    } else {
      const old = localStorage.getItem(LS_OLD);   // carry over settings from the Detroit-only version
      if (old) { const o = JSON.parse(old); delete o.wUnit; Object.assign(s.detroit, o); }
    }
  } catch (e) {}
  for (const k of ["detroit", "nyc"]) {   // older saves stored tomatoes in ounces
    if (s[k].tomatoes != null) { s[k].tomatoG = Math.round(num(s[k].tomatoes) * G_PER_OZ); delete s[k].tomatoes; }
  }
  s.detroit.adv = Object.assign({ ...ADV_DEFAULTS }, s.detroit.adv || {});
  if (!Array.isArray(s.detroit.pans) || !s.detroit.pans.length) s.detroit.pans = clone(DEFAULTS.detroit.pans);
  if (!s.detroit.bake || isNaN(new Date(s.detroit.bake))) s.detroit.bake = toLocalInput(nextSaturday());
  s.nyc.adv = Object.assign({ ...N_ADV_DEFAULTS }, s.nyc.adv || {});
  s.nyc.protein = Object.assign({ ...N_PROTEIN_DEFAULTS }, s.nyc.protein || {});
  s.sourdough.adv = Object.assign({ ...SD_ADV_DEFAULTS }, s.sourdough.adv || {});
  if (!s.sourdough.bake || isNaN(new Date(s.sourdough.bake))) s.sourdough.bake = toLocalInput(nextSaturday(5));
  try { const h = location.hash.slice(1); if (TYPES.some((t) => t.id === h)) s.type = h; } catch (e) {}
  return s;
}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------- dates ---------- */
function nextSaturday(minDays = 3) {
  const now = new Date(), d = new Date();
  d.setHours(18, 0, 0, 0);
  do { d.setDate(d.getDate() + 1); } while (d.getDay() !== 6 || d - now < minDays * 864e5);
  return d;
}
function toLocalInput(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fmtWhen(d) {
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/* ---------- formatting ---------- */
function fmtW(g) {
  return (g < 10 ? g.toFixed(1) : Math.round(g).toLocaleString()) + " g";
}
const pctLabel = (p) => +(p * 100).toFixed(2) + "%";
function segHTML(name, items, current, attr) {
  return items.map((it) =>
    `<label><input type="radio" name="${name}" id="${name}-${it.id}" value="${it.id}" ${attr} ${it.id === current ? "checked" : ""}><span>${it.label}${it.sub ? `<small>${it.sub}</small>` : ""}</span></label>`
  ).join("");
}
function doughTable(rows, sum, total) {
  return `<thead><tr><th>Ingredient</th><th class="r">Baker's %</th><th class="r">Weight</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${r.name}</td><td class="r num">${r.pct == null ? "" : pctLabel(r.pct)}</td><td class="r num">${fmtW(r.g)}</td></tr>`).join("")}
    <tr class="total"><td>Total</td><td class="r num">${pctLabel(sum)}</td><td class="r num">${fmtW(total)}</td></tr></tbody>`;
}
function summaryHTML(items) { return items.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join(""); }

/* ================= Detroit ================= */
function dimLabel(p) {
  const u = D.dimUnit, f = (v) => +num(v).toFixed(1);
  return p.shape === "round" ? `${f(p.a)} ${u} round` : `${f(p.a)} × ${f(p.b)} ${u}`;
}
function areaIn2(p) {
  const a = num(p.a), b = num(p.b);
  const raw = p.shape === "round" ? Math.PI * (a / 2) ** 2 : a * b;
  return D.dimUnit === "cm" ? raw / CM2_PER_IN2 : raw;
}
function calcDetroit() {
  const st = STYLES[D.style], adv = D.adv;
  const hydration = (adv.hydration ?? st.hydration) / 100;
  const tf = adv.tf ?? st.tf;
  const ww = Math.min(Math.max(num(adv.ww), 0), 100) / 100;
  const malt = num(adv.malt) / 100, yeast = num(adv.yeast) / 100, salt = num(adv.salt) / 100;
  const sum = 1 + malt + yeast + hydration + salt;
  const cheesePct = CHEESE.find((c) => c.id === D.cheese).pct / 100;
  const saucePct = SAUCE.find((c) => c.id === D.sauce).pct / 100;
  const pans = D.pans.map((p) => {
    const area = Math.max(areaIn2(p), 0);
    const count = Math.max(Math.round(num(p.count)), 0);
    const ball = area * tf * G_PER_OZ;
    return { p, area, count, ball, cheese: ball * cheesePct / sum, sauce: ball * saucePct / sum, pepG: area * 0.3, parm: area * 0.0375 };
  });
  const totalDough = pans.reduce((t, x) => t + x.ball * x.count, 0);
  const flour = totalDough / sum;
  const tot = (k) => pans.reduce((t, x) => t + x[k] * x.count, 0);
  return {
    hydration, tf, sum, pans, totalDough,
    pizzas: pans.reduce((t, x) => t + x.count, 0),
    dough: [
      { name: "Bread flour", pct: 1 - ww, g: flour * (1 - ww) },
      { name: "Whole wheat flour", pct: ww, g: flour * ww },
      { name: "Diastatic malt powder", pct: malt, g: flour * malt },
      { name: "Instant yeast", pct: yeast, g: flour * yeast },
      { name: "Water", pct: hydration, g: flour * hydration },
      { name: "Salt", pct: salt, g: flour * salt }
    ].filter((r) => r.pct > 0),
    cheeseTotal: tot("cheese"), sauceTotal: tot("sauce"), pepTotal: tot("pepG"), parmTotal: tot("parm")
  };
}
function panRowHTML(p, i) {
  const u = D.dimUnit;
  const field = (f, label) =>
    `<label class="fld"><span>${label}</span><span class="in"><input id="pan${i}${f}" type="number" inputmode="decimal" min="1" step="0.5" data-i="${i}" data-f="${f}" value="${p[f] ?? ""}"><em>${u}</em></span></label>`;
  const dims = p.shape === "round" ? field("a", "Diameter") : `${field("a", "Width")}<span class="x">×</span>${field("b", "Length")}`;
  const presetOpts = PRESETS.map((x) => `<option value="${x.id}">${x.label}</option>`).join("");
  return `<div class="pan-row">
    <div class="pan-top">
      <div class="seg compact" role="radiogroup" aria-label="Pan shape">
        <label><input type="radio" name="shape${i}" id="shape${i}r" value="rect" data-i="${i}" data-f="shape" ${p.shape !== "round" ? "checked" : ""}><span>Rectangle</span></label>
        <label><input type="radio" name="shape${i}" id="shape${i}c" value="round" data-i="${i}" data-f="shape" ${p.shape === "round" ? "checked" : ""}><span>Round</span></label>
      </div>
      <select id="preset${i}" data-i="${i}" data-f="preset" aria-label="Pick a common pan size"><option value="">Common sizes…</option>${presetOpts}</select>
      ${D.pans.length > 1 ? `<button class="icon-btn" type="button" data-remove="${i}" aria-label="Remove this pan size">×</button>` : ""}
    </div>
    <div class="pan-dims">${dims}
      <label class="fld count"><span>Pizzas</span><span class="in"><input id="pan${i}count" type="number" inputmode="numeric" min="0" step="1" data-i="${i}" data-f="count" value="${p.count}"></span></label>
    </div>
  </div>`;
}
function renderDetroitPanel() {
  $("#pans").innerHTML = D.pans.map(panRowHTML).join("");
  $("#cheeseSeg").innerHTML = segHTML("cheese", CHEESE, D.cheese, 'data-k="cheese"');
  $("#sauceSeg").innerHTML = segHTML("sauce", SAUCE, D.sauce, 'data-k="sauce"');
  document.querySelectorAll("#screen-detroit input[type=radio][data-k]").forEach((r) => { r.checked = D[r.dataset.k] === r.value; });
  const st = STYLES[D.style];
  $("#advHydration").value = D.adv.hydration ?? ""; $("#advHydration").placeholder = st.hydration;
  $("#advTf").value = D.adv.tf == null ? "" : +(D.adv.tf * G_PER_OZ).toFixed(2); $("#advTf").placeholder = (st.tf * G_PER_OZ).toFixed(2);
  $("#advWw").value = D.adv.ww; $("#advMalt").value = D.adv.malt; $("#advYeast").value = D.adv.yeast; $("#advSalt").value = D.adv.salt;
  $("#tomatoes").value = D.tomatoG; $("#bake").value = D.bake; $("#ferment").value = String(D.ferment); $("#proof").value = D.proof;
}
function panSVG(x, scale, idx) {
  const p = x.p, k = D.dimUnit === "cm" ? 1 / 2.54 : 1;
  const a = Math.max(num(p.a) * k, 1), b = Math.max(num(p.b) * k, 1);
  if (p.shape === "round") {
    const d = a * scale, r = d / 2, c = r + 4;
    return `<svg width="${d + 8}" height="${d + 8}" viewBox="0 0 ${d + 8} ${d + 8}" aria-hidden="true">
      <defs><clipPath id="clip${idx}"><circle cx="${c}" cy="${c}" r="${r - 6}"/></clipPath></defs>
      <circle cx="${c}" cy="${c}" r="${r}" fill="var(--steel)"/>
      <circle cx="${c}" cy="${c}" r="${r - 3.5}" fill="var(--dough)" stroke="var(--frico)" stroke-width="2.5"/>
      <g clip-path="url(#clip${idx})" fill="var(--sauce)">
        <rect x="0" y="${c - d * 0.22}" width="${d + 8}" height="${Math.max(d * 0.1, 3)}" rx="2"/>
        <rect x="0" y="${c + d * 0.12}" width="${d + 8}" height="${Math.max(d * 0.1, 3)}" rx="2"/>
      </g></svg>`;
  }
  const w = Math.max(a, b) * scale, h = Math.min(a, b) * scale, sh = Math.max(h * 0.12, 3);
  return `<svg width="${w + 8}" height="${h + 8}" viewBox="0 0 ${w + 8} ${h + 8}" aria-hidden="true">
    <rect x="4" y="4" width="${w}" height="${h}" rx="3" fill="var(--steel)"/>
    <rect x="7.5" y="7.5" width="${w - 7}" height="${h - 7}" rx="1.5" fill="var(--dough)" stroke="var(--frico)" stroke-width="2.5"/>
    <rect x="11" y="${4 + h * 0.3 - sh / 2}" width="${w - 14}" height="${sh}" rx="${sh / 2}" fill="var(--sauce)"/>
    <rect x="11" y="${4 + h * 0.7 - sh / 2}" width="${w - 14}" height="${sh}" rx="${sh / 2}" fill="var(--sauce)"/>
  </svg>`;
}
function maxSpanIn() {
  const k = D.dimUnit === "cm" ? 1 / 2.54 : 1;
  return Math.max(1, ...D.pans.map((p) => Math.max(num(p.a), p.shape === "round" ? 0 : num(p.b)) * k));
}
function renderDetroit() {
  const R = calcDetroit();
  const st = STYLES[D.style];
  const custom = D.adv.hydration != null || D.adv.tf != null;
  $("#summary").innerHTML = summaryHTML([
    [R.pizzas, R.pizzas === 1 ? "Pizza" : "Pizzas"], [fmtW(R.totalDough), "Total dough"],
    [Math.round(R.hydration * 100) + "%", "Hydration"], [fmtW(R.cheeseTotal), "Brick cheese"], [fmtW(R.sauceTotal), "Sauce"]
  ]);
  $("#doughNote").textContent = `${custom ? "Custom formula" : st.label + " crust"} · ${(R.tf * G_PER_OZ).toFixed(2)} g of dough per square inch`;
  $("#doughTbl").innerHTML = doughTable(R.dough, R.sum, R.totalDough);

  const scale = Math.min(9, 120 / maxSpanIn());
  const active = R.pans.filter((x) => x.count > 0 && x.area > 0);
  $("#panCards").innerHTML = active.length ? active.map((x, i) => `
    <article class="pan-card">
      <header>${panSVG(x, scale, i)}<div><h3>${dimLabel(x.p)}</h3><p>${x.count} ${x.count === 1 ? "pizza" : "pizzas"} · ${Math.round(x.area)} sq in</p></div></header>
      <dl class="kv">
        <dt><span class="dot" style="background:var(--dough);outline:1px solid var(--line)"></span>Dough ball</dt><dd>${fmtW(x.ball)}</dd>
        <dt><span class="dot" style="background:var(--cheese)"></span>Wisconsin brick cheese</dt><dd>${fmtW(x.cheese)}<small>grated · half on top, half at the edges</small></dd>
        <dt><span class="dot" style="background:var(--sauce)"></span>Sauce</dt><dd>${fmtW(x.sauce)}</dd>
        <dt><span class="dot" style="background:var(--frico)"></span>Pepperoni</dt><dd>${fmtW(x.pepG)}<small>about ${Math.round(x.pepG / 2)} slices</small></dd>
        <dt><span class="dot" style="background:var(--muted)"></span>Parmigiano Reggiano</dt><dd>${fmtW(x.parm)}<small>grated</small></dd>
      </dl>
    </article>`).join("") : `<p class="hint">Add at least one pan with a size and a pizza count to see per-pizza amounts.</p>`;

  const T = Math.max(num(D.tomatoG), 0);
  $("#sauceTbl").innerHTML = `<tbody>${detroitSauce(T).map(([n, g]) => `<tr><td>${n}</td><td class="r num">${fmtW(g)}</td></tr>`).join("")}</tbody>`;
  $("#sauceMeter").innerHTML = sauceMeterHTML(R.sauceTotal, T * 0.75, 0.75, "scaleSauce") +
    `<p class="hint">Simmer everything in a saucepan, stirring often, until reduced by about 25% (around 20 minutes). It should be thick but not pasty. Add a splash of water if it goes too far.</p>`;

  renderSchedule();
  renderMethod(R);
}
// Seasoning weights per 794 g can. Herbs converted from teaspoons: ~1 g/tsp dried oregano and thyme, ~3.1 g/tsp garlic powder, ~1.8 g/tsp pepper flakes.
function detroitSauce(T) {
  const k = T / CAN_G;
  return [["Whole peeled tomatoes", T], ["Salt", 3 * k],
    [`Dried oregano (${spoon(1 * k)})`, 1 * k], [`Dried thyme (${spoon(0.5 * k)})`, 0.5 * k],
    [`Garlic powder (${spoon(0.25 * k)})`, 0.78 * k], [`Red pepper flakes (${spoon(0.25 * k)})`, 0.45 * k]];
}
function nycSauce(T) {
  const k = T / CAN_G;
  return [["Canned tomatoes", T], ...(N.redpack ? [["Water", T / 4]] : []), ["Salt", 3 * k], ["Sugar", 12 * k],
    [`Dried oregano (${spoon(2 * k)})`, 2 * k]];
}
// Spoon measure for small seasonings: quarter steps (eighths below ¼ tsp), tablespoons from 3 tsp up.
function spoon(tsp) {
  const big = tsp >= 3, x = big ? tsp / 3 : tsp;
  const q = !big && x < 0.25 ? Math.round(x * 8) / 8 : Math.round(x * 4) / 4;
  if (q === 0) return "pinch";
  const whole = Math.floor(q);
  const f = { 0: "", 0.125: "⅛", 0.25: "¼", 0.375: "⅜", 0.5: "½", 0.625: "⅝", 0.75: "¾", 0.875: "⅞" }[q - whole];
  return `${whole ? whole + (f ? " " : "") : ""}${f} ${big ? "Tbsp" : "tsp"}`;
}
// need: grams of sauce needed; yieldG: grams the batch makes; yieldPerG: grams of sauce per gram of tomatoes
function sauceMeterHTML(need, yieldG, yieldPerG, btnId) {
  const needG = Math.ceil(need / yieldPerG / 10) * 10;
  const pct = yieldG > 0 ? Math.min(need / yieldG, 1) * 100 : 100;
  return `<div class="eyebrow">This bake uses</div>
    <div class="bar" role="img" aria-label="Sauce needed as a share of the batch"><i style="width:${pct}%"></i></div>
    <p style="margin:0"><span class="num">${fmtW(need)}</span> of the <span class="num">${fmtW(yieldG)}</span> this batch makes.</p>
    ${need > yieldG
      ? `<div class="note">That's not enough sauce. Use about <b class="num">${fmtW(needG)}</b> of tomatoes. <button class="btn small" type="button" id="${btnId}">Scale the batch</button></div>`
      : `<div class="ok">${yieldG - need > 200 ? "Plenty left over. It keeps in the fridge for a week or freezes well." : "Enough for this bake with a little to spare."}</div>`}`;
}
function renderSchedule() {
  const bake = new Date(D.bake);
  if (isNaN(bake)) { $("#timeline").innerHTML = ""; $("#schedWarn").innerHTML = `<div class="note">Pick a date and time for the first bake.</div>`; return; }
  const H = 36e5, proof = Math.min(Math.max(num(D.proof), 1), 8), days = num(D.ferment) || 2;
  const pull = new Date(bake - proof * H);
  const fridge = new Date(pull - days * 24 * H);
  const mix = new Date(fridge - 2.5 * H);
  const preheat = new Date(bake - H);
  const events = [
    [mix, "Mix the dough", "About 10 minutes of work, then 3–4 rounds of folding with 20-minute rests."],
    [fridge, "Into the fridge", `Once it has risen about 50%. It cold-ferments for ${days} ${days === 1 ? "day" : "days"}.`],
    [pull, "Divide and pan", "Portion the cold dough by weight into oiled pans. Press it toward the corners about once an hour."],
    [preheat, "Preheat the oven", "Highest setting for a home oven, medium-low for a pizza oven."],
    [bake, "First bake", "Dough should be 2–3 times its original size. Cheese, par-bake, sauce, finish.", true]
  ];
  $("#timeline").innerHTML = events.map(([d, t, s, hot]) =>
    `<li class="${hot ? "hot" : ""}"><time datetime="${d.toISOString()}">${fmtWhen(d)}</time><div class="pip"></div><div><b>${t}</b><span>${s}</span></div></li>`
  ).join("");
  $("#schedWarn").innerHTML = mix < new Date()
    ? `<div class="note" style="margin-bottom:14px">To bake then, you'd have needed to start mixing ${fmtWhen(mix)}. Move the bake later or shorten the cold ferment.</div>` : "";
}
function renderMethod(R) {
  const live = R.pans.filter((x) => x.count > 0);
  const half = live.length === 1 ? ` (about ${fmtW(live[0].cheese / 2)} per pizza)` : "";
  const home = `<ol class="sub-steps">
      <li>Bake 7 minutes, until the dough is set.</li>
      <li>Pull it out. Lay the sauce on top in two stripes, add any extra toppings, and pack the rest of the cheese around the edges against the pan for the crispy frico edge.</li>
      <li>Bake 4 more minutes. Switch to the broiler for the last minute if you want more color.</li>
      <li>Get it out of the pan right away and let it rest on a wire rack for a few minutes before slicing.</li></ol>`;
  const oven = `<ol class="sub-steps">
      <li>Check the stone with an infrared thermometer. Aim for 650–700°F.</li>
      <li>Cover the pan with a steel lid or foil and bake 6 minutes until set. Uncover and give it 30 more seconds.</li>
      <li>Pull it out. Add the sauce stripes, any toppings, and the rest of the cheese around the edges.</li>
      <li>Bake about 3 minutes uncovered, adjusting the flame until it's as done as you like.</li>
      <li>Get it out of the pan right away and rest it on a wire rack before slicing.</li></ol>`;
  $("#method").innerHTML = `
    <h3 class="phase">Day 1 · Mix</h3>
    <ol class="steps">
      <li><div>Combine everything except the salt and mix until no dry flour is left, 1–2 minutes on low with a mixer. Sprinkle the salt over the top, cover, and rest 20 minutes.</div></li>
      <li><div>Fold or knead the dough in the bowl until it tightens up and gets too sticky to handle. Rest 20 minutes. Repeat 3–4 times, until the dough is smooth and strong.</div></li>
      <li><div>When it has grown by about half, refrigerate it for 1–4 days. Two days is ideal.</div></li>
    </ol>
    <h3 class="phase">Bake day</h3>
    <ol class="steps" style="counter-reset:s 3">
      <li><div>Divide the cold dough using the dough ball weights above and put each piece in an oiled pan. Leave the pans at room temperature and press the dough toward the corners about every hour until it stays put.</div></li>
      <li><div>An hour before baking, preheat the oven.</div></li>
      <li><div>When the dough has grown to 2–3 times its size, spread half the cheese${half} over the top, keeping it off the pan walls. Flat pepperoni can go on now too.</div></li>
      <li><div>
        <div class="seg compact oven-switch" role="radiogroup" aria-label="Oven type">
          <label><input type="radio" name="oven" id="ovenHome" value="home" data-k="oven" ${D.oven === "home" ? "checked" : ""}><span>Home oven</span></label>
          <label><input type="radio" name="oven" id="ovenPizza" value="pizza" data-k="oven" ${D.oven === "pizza" ? "checked" : ""}><span>Pizza oven</span></label>
        </div>
        ${D.oven === "pizza" ? oven : home}</div></li>
    </ol>`;
}
function detroitText() {
  const R = calcDetroit(), st = STYLES[D.style], L = [];
  const pans = R.pans.filter((x) => x.count > 0 && x.area > 0);
  L.push(`DETROIT-STYLE PIZZA: ${R.pizzas} ${R.pizzas === 1 ? "pizza" : "pizzas"}`);
  L.push(`${pans.map((x) => `${x.count} × ${dimLabel(x.p)}`).join(", ")} · ${st.label} crust, ${Math.round(R.hydration * 100)}% hydration`);
  L.push("", `DOUGH (${fmtW(R.totalDough)} total)`);
  R.dough.forEach((r) => L.push(`- ${r.name}: ${fmtW(r.g)}`));
  pans.forEach((x) => {
    L.push("", `EACH ${dimLabel(x.p).toUpperCase()} PIZZA`);
    L.push(`- Dough ball: ${fmtW(x.ball)}`, `- Brick cheese: ${fmtW(x.cheese)} (half on top, half at the edges)`,
      `- Sauce: ${fmtW(x.sauce)}`, `- Pepperoni: ${fmtW(x.pepG)} (about ${Math.round(x.pepG / 2)} slices)`, `- Parmigiano: ${fmtW(x.parm)}`);
  });
  L.push("", "SAUCE");
  detroitSauce(num(D.tomatoG)).forEach(([n, g]) => L.push(`- ${n}: ${fmtW(g)}`));
  L.push("- Simmer until reduced by about 25%.");
  L.push("", `SHOPPING: ${fmtW(R.cheeseTotal)} brick cheese, ${fmtW(R.parmTotal)} parmigiano, ${fmtW(R.pepTotal)} pepperoni`);
  return L.join("\n");
}

/* ================= New York ================= */
function nSizeIn() { return Math.max(num(N.size) / (N.unit === "cm" ? 2.54 : 1), 0); }
function vwgShare() {
  const p = N.protein, s = num(p.start), v = num(p.vwg), g = num(p.goal);
  if (v <= s || g <= s) return 0;
  return Math.min((g - s) / (v - s), 0.5);
}
function calcNyc() {
  const crust = N_CRUST.find((c) => c.id === N.crust) || N_CRUST[1], adv = N.adv;
  const hydration = (adv.hydration ?? crust.hydration) / 100;
  const tf = num(adv.tf) || N_ADV_DEFAULTS.tf;
  const rye = Math.min(Math.max(num(adv.rye), 0), 100) / 100;
  const salt = num(adv.salt) / 100, yeast = num(adv.yeast) / 100, sugar = num(adv.sugar) / 100;
  const sum = 1 + hydration + salt + yeast + sugar;
  const count = Math.max(Math.round(num(N.count)), 0);
  const dIn = nSizeIn();
  const doughD = Math.max(dIn - 0.75, 0);
  const area = Math.PI * (doughD / 2) ** 2;
  const ball = area * tf * G_PER_OZ;
  const total = ball * count;
  const flour = total / sum;
  const main = flour * (1 - rye);
  const share = N.flour === "vwg" ? vwgShare() : 0;
  const lv = (id) => (N_LEVELS.find((l) => l.id === id) || N_LEVELS[1]).pct / 100;
  const flourRows = N.flour === "vwg"
    ? [{ name: "Bread flour", pct: (1 - rye) * (1 - share), g: main * (1 - share) },
       { name: "Vital wheat gluten", pct: (1 - rye) * share, g: main * share }]
    : [{ name: "High-gluten flour", pct: 1 - rye, g: main }];
  return {
    hydration, tf, sum, count, dIn, doughD, ball, total, share,
    sauce: ball * lv(N.sauce) / sum, cheese: ball * lv(N.cheese) / sum, pecorino: ball * 0.04 / sum,
    dough: [
      ...flourRows,
      { name: "Sifted spelt or rye flour", pct: rye, g: flour * rye },
      { name: "Water", pct: hydration, g: flour * hydration },
      { name: "Salt", pct: salt, g: flour * salt },
      { name: "Instant yeast", pct: yeast, g: flour * yeast },
      { name: "Sugar", pct: sugar, g: flour * sugar }
    ].filter((r) => r.pct > 0)
  };
}
function nLevels(isCheese) {
  return N_LEVELS.map((l) => l.id === "max" ? { ...l, label: isCheese ? "Take it cheesy" : "Danger" } : l);
}
function renderNycPanel() {
  $("#nCrustSeg").innerHTML = segHTML("nCrust", N_CRUST, N.crust, 'data-nk="crust"');
  $("#nCheeseSeg").innerHTML = segHTML("nCheese", nLevels(true), N.cheese, 'data-nk="cheese"');
  $("#nSauceSeg").innerHTML = segHTML("nSauce", nLevels(false), N.sauce, 'data-nk="sauce"');
  document.querySelectorAll("#screen-nyc input[type=radio][data-nk]").forEach((r) => { r.checked = String(N[r.dataset.nk]) === r.value; });
  $("#nSize").value = N.size; $("#nCount").value = N.count; $("#nSizeUnit").textContent = N.unit;
  $("#nTomatoes").value = N.tomatoG; $("#nRedPack").checked = !!N.redpack;
  $("#nPStart").value = N.protein.start; $("#nPVwg").value = N.protein.vwg; $("#nPGoal").value = N.protein.goal;
  const crust = N_CRUST.find((c) => c.id === N.crust) || N_CRUST[1];
  $("#nAdvHydration").value = N.adv.hydration ?? ""; $("#nAdvHydration").placeholder = crust.hydration;
  $("#nAdvTf").value = +(num(N.adv.tf) * G_PER_OZ).toFixed(2); $("#nAdvRye").value = N.adv.rye; $("#nAdvSalt").value = N.adv.salt;
  $("#nAdvYeast").value = N.adv.yeast; $("#nAdvSugar").value = N.adv.sugar;
  renderNycChips();
}
function renderNycChips() {
  const k = N.unit === "cm" ? 2.54 : 1;
  $("#nSizeChips").innerHTML = N_SIZES.map((s) => {
    const v = Math.round(s * k);
    return `<button type="button" class="chip" data-nsize="${v}" aria-pressed="${num(N.size) === v}">${v} ${N.unit}</button>`;
  }).join("");
  $("#nVwgBox").hidden = N.flour !== "vwg";
}
function nycPieSVG(dIn) {
  const d = Math.max(Math.min(dIn / 18, 1.2), 0.3) * 96, r = d / 2, c = r + 3, s = d + 6;
  const blobs = [[-0.35, -0.25, 0.16], [0.3, -0.35, 0.13], [0.25, 0.3, 0.17], [-0.3, 0.32, 0.12], [0.02, 0.02, 0.1]];
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" aria-hidden="true">
    <circle cx="${c}" cy="${c}" r="${r}" fill="var(--dough)" stroke="var(--frico)" stroke-width="1.5"/>
    <circle cx="${c}" cy="${c}" r="${r * 0.86}" fill="var(--sauce)"/>
    ${blobs.map(([x, y, rr]) => `<circle cx="${c + x * r}" cy="${c + y * r}" r="${rr * r}" fill="var(--mozz)"/>`).join("")}
  </svg>`;
}
function renderNyc() {
  const R = calcNyc();
  const crust = N_CRUST.find((c) => c.id === N.crust) || N_CRUST[1];
  const custom = N.adv.hydration != null || Math.abs(num(N.adv.tf) - N_ADV_DEFAULTS.tf) > 1e-6;
  const sizeTxt = `${+num(N.size).toFixed(1)} ${N.unit}`;
  $("#nSummary").innerHTML = summaryHTML([
    [R.count, R.count === 1 ? "Pizza" : "Pizzas"], [fmtW(R.total), "Total dough"],
    [Math.round(R.hydration * 100) + "%", "Hydration"], [fmtW(R.cheese * R.count), "Mozzarella"], [fmtW(R.sauce * R.count), "Sauce"]
  ]);
  $("#nDoughNote").textContent = `${custom ? "Custom formula" : crust.label + " crust"} · ${(R.tf * G_PER_OZ).toFixed(2)} g of dough per square inch`;
  $("#nDoughTbl").innerHTML = doughTable(R.dough, R.sum, R.total) +
    (N.flour === "vwg" ? `<caption style="caption-side:bottom;text-align:left;padding-top:10px" class="hint">Gluten is ${(R.share * 100).toFixed(1)}% of the bread flour, raising ${num(N.protein.start)}% protein to ${num(N.protein.goal)}%.</caption>` : "");
  $("#nEachNote").textContent = `${sizeTxt} pie`;
  $("#nCards").innerHTML = R.count > 0 && R.dIn > 0.75 ? `
    <article class="pan-card">
      <header>${nycPieSVG(R.dIn)}<div><h3>${sizeTxt} pizza</h3><p>${R.count} ${R.count === 1 ? "pizza" : "pizzas"} · dough stretched to ${+(N.unit === "cm" ? R.doughD * 2.54 : R.doughD).toFixed(1)} ${N.unit}</p></div></header>
      <dl class="kv">
        <dt><span class="dot" style="background:var(--dough);outline:1px solid var(--line)"></span>Dough ball</dt><dd>${fmtW(R.ball)}</dd>
        <dt><span class="dot" style="background:var(--sauce)"></span>Sauce</dt><dd>${fmtW(R.sauce)}</dd>
        <dt><span class="dot" style="background:var(--mozz);outline:1px solid var(--line)"></span>Low-moisture mozzarella</dt><dd>${fmtW(R.cheese)}<small>grated</small></dd>
        <dt><span class="dot" style="background:var(--muted)"></span>Pecorino Romano</dt><dd>${fmtW(R.pecorino)}<small>grated</small></dd>
      </dl>
    </article>` : `<p class="hint">Enter a pizza size and how many you're making to see per-pizza amounts.</p>`;

  const T = Math.max(num(N.tomatoG), 0), per = N.redpack ? 1.25 : 1;
  $("#nSauceTbl").innerHTML = `<tbody>${nycSauce(T).map(([n, g]) => `<tr><td>${n}</td><td class="r num">${fmtW(g)}</td></tr>`).join("")}</tbody>`;
  $("#nSauceMeter").innerHTML = sauceMeterHTML(R.sauce * R.count, T * per, per, "nScaleSauce") +
    `<p class="hint">Stir the seasonings into the tomatoes. This sauce goes on uncooked.</p>`;
}
function nycText() {
  const R = calcNyc(), crust = N_CRUST.find((c) => c.id === N.crust) || N_CRUST[1], L = [];
  const sizeTxt = `${+num(N.size).toFixed(1)} ${N.unit}`;
  L.push(`NEW YORK-STYLE PIZZA: ${R.count} × ${sizeTxt}`);
  L.push(`${crust.label} crust, ${Math.round(R.hydration * 100)}% hydration`);
  L.push("", `DOUGH (${fmtW(R.total)} total, ${fmtW(R.ball)} per ball)`);
  R.dough.forEach((r) => L.push(`- ${r.name}: ${fmtW(r.g)}`));
  L.push("", "EACH PIZZA", `- Sauce: ${fmtW(R.sauce)}`, `- Low-moisture mozzarella: ${fmtW(R.cheese)}`, `- Pecorino Romano: ${fmtW(R.pecorino)}`);
  L.push("", "SAUCE");
  nycSauce(num(N.tomatoG)).forEach(([n, g]) => L.push(`- ${n}: ${fmtW(g)}`));
  return L.join("\n");
}

/* ================= Sourdough ================= */
function calcSd() {
  const h = Math.min(Math.max(num(Sd.hydration), 60), 100) / 100;
  const a = Math.max(num(Sd.adv.starter), 0) / 100, sl = Math.max(num(Sd.adv.salt), 0) / 100;
  const count = Math.min(Math.max(Math.round(num(Sd.count)), 0), 24);
  const ball = Math.max(num(Sd.ball), 0);
  const total = count * ball;
  // Hydration counts the starter's flour and water (starter is half of each):
  // (water + starter/2) / (flour + starter/2) = h, and flour + water + starter + salt = total.
  const flour = total / (1 + h * (1 + a / 2) + a / 2 + sl);
  const starter = a * flour;
  const water = h * (flour + starter / 2) - starter / 2;
  const salt = sl * flour;
  const pieIn = ball > 0 ? 2 * Math.sqrt(ball / (G_PER_OZ * SD_TF) / Math.PI) : 0;
  return {
    h, count, ball, total, flour, starter, water, salt, pieIn,
    totalFlour: flour + starter / 2, totalWater: water + starter / 2,
    sauce: ball * SD_TOP.sauce, mozz: ball * SD_TOP.mozz,
    dough: [
      { name: "Bread flour", pct: 1, g: flour },
      { name: "Water", pct: flour ? water / flour : h * (1 + a / 2) - a / 2, g: water },
      { name: "Sourdough starter (100% hydration)", pct: a, g: starter },
      { name: "Salt", pct: sl, g: salt }
    ].filter((r) => r.pct > 0 || r.name === "Bread flour")
  };
}
function hydrationFeel(p) {
  if (p < 65) return "Stiff and easy to shape. Chewier, tighter crumb.";
  if (p <= 70) return "Firm and forgiving. A good place to start.";
  if (p <= 75) return "Soft and extensible with an open rim. Your house dough is 72%.";
  if (p <= 82) return "Wet and slack. Use strong flour and wet hands, and expect a very airy rim.";
  return "Very wet. Hard to ball and stretch; mainly for experiments.";
}
function renderSdPanel() {
  $("#sdCount").value = Sd.count; $("#sdBall").value = Sd.ball;
  $("#sdHydration").value = Sd.hydration;
  $("#sdAdvStarter").value = Sd.adv.starter; $("#sdAdvSalt").value = Sd.adv.salt;
  $("#sdBake").value = Sd.bake; $("#sdFridge").value = String(Sd.fridge);
}
function renderSd() {
  const R = calcSd(), hp = Math.round(R.h * 100);
  $("#sdHydOut").textContent = hp + "%";
  $("#sdHydHint").textContent = hydrationFeel(hp);
  $("#sdHydReset").hidden = hp === SD_HOUSE_HYDRATION;
  $("#sdBallHint").textContent = R.ball > 0 ? `Makes roughly a ${Math.round(R.pieIn)} in pie when stretched thin.` : "Enter a dough ball weight.";

  $("#sdSummary").innerHTML = summaryHTML([
    [R.count, R.count === 1 ? "Pizza" : "Pizzas"], [fmtW(R.total), "Total dough"],
    [hp + "%", "Hydration"], [fmtW(R.starter), "Starter"], [fmtW(R.mozz * R.count), "Mozzarella"]
  ]);
  $("#sdDoughNote").textContent = `${R.count} × ${fmtW(R.ball)} balls · baker's % of added flour`;
  $("#sdDoughTbl").innerHTML = doughTable(R.dough, R.total / (R.flour || 1), R.total);
  $("#sdStarterHint").textContent = R.total > 0
    ? `Hydration counts the starter: ${fmtW(R.totalWater)} total water ÷ ${fmtW(R.totalFlour)} total flour = ${hp}%. Feed your starter so you have at least ${fmtW(Math.ceil(R.starter / 10) * 10 + 20)} at its peak.`
    : "";

  $("#sdCards").innerHTML = R.count > 0 && R.ball > 0 ? `
    <article class="pan-card">
      <header>${sdPieSVG(Math.round(Math.min(Math.max(R.pieIn / 14, 0.5), 1.2) * 92))}<div><h3>About ${Math.round(R.pieIn)} in pizza</h3><p>${R.count} ${R.count === 1 ? "pizza" : "pizzas"} · ${fmtW(R.ball)} dough balls</p></div></header>
      <dl class="kv">
        <dt><span class="dot" style="background:var(--sauce)"></span>Crushed tomatoes</dt><dd>${fmtW(R.sauce)}<small>salted to taste, uncooked</small></dd>
        <dt><span class="dot" style="background:var(--mozz);outline:1px solid var(--line)"></span>Fresh mozzarella</dt><dd>${fmtW(R.mozz)}<small>torn and patted dry</small></dd>
        <dt><span class="dot" style="background:var(--basil)"></span>Fresh basil</dt><dd>2 g<small>3–4 leaves</small></dd>
        <dt><span class="dot" style="background:var(--cheese)"></span>Olive oil (1 tsp)</dt><dd>4 g<small>drizzled after baking</small></dd>
      </dl>
      <p class="hint">For all ${R.count}: ${fmtW(R.sauce * R.count)} tomatoes (${Math.max(1, Math.ceil(R.sauce * R.count / CAN_G))} × ${CAN_G} g can) and ${fmtW(R.mozz * R.count)} mozzarella. These are starting amounts; adjust to taste.</p>
    </article>` : `<p class="hint">Enter how many pizzas and a ball weight to see per-pizza amounts.</p>`;

  renderSdSchedule(R);
  renderSdMethod(R);
}
function renderSdSchedule(R) {
  const bake = new Date(Sd.bake);
  if (isNaN(bake)) { $("#sdTimeline").innerHTML = ""; $("#sdSchedWarn").innerHTML = `<div class="note">Pick a date and time for the first bake.</div>`; return; }
  const H = 36e5, fridgeH = num(Sd.fridge) || 72;
  const out = new Date(bake - H);
  const balls = new Date(out - fridgeH * H);
  const bulk = new Date(balls - 2 * H);
  const mix = new Date(bulk - 2 * H);
  const events = [
    [mix, "Mix, then stretch and fold", "Combine everything, then 2 hours of stretch and folds."],
    [bulk, "Bulk ferment", "Cover and leave at room temperature for 2 hours."],
    [balls, "Divide and refrigerate", `Cut into ${R.count} balls of about ${fmtW(R.ball)}, each in a lightly oiled container. ${fridgeH} hours in the fridge.`],
    [out, "Dough out, oven on", "Let the balls warm up while the oven heats for an hour. Aim for 750°F on the stone."],
    [bake, "First pizza", "Top and bake for 60–90 seconds.", true]
  ];
  $("#sdTimeline").innerHTML = events.map(([d, t, s, hot]) =>
    `<li class="${hot ? "hot" : ""}"><time datetime="${d.toISOString()}">${fmtWhen(d)}</time><div class="pip"></div><div><b>${t}</b><span>${s}</span></div></li>`
  ).join("");
  $("#sdSchedWarn").innerHTML = mix < new Date()
    ? `<div class="note" style="margin-bottom:14px">To bake then, you'd have needed to start mixing ${fmtWhen(mix)}. Move the bake later or pick a shorter cold ferment.</div>` : "";
}
function renderSdMethod(R) {
  $("#sdMethod").innerHTML = `
    <h3 class="phase">Day 1 · Mix</h3>
    <ol class="steps">
      <li><div>Combine the flour, water, starter and salt until no dry flour is left.</div></li>
      <li><div>Stretch and fold for 2 hours. Lift one side of the dough, stretch it up and fold it over, turn the bowl, and repeat all the way around. Give it a set about every 30 minutes.</div></li>
      <li><div>Cover and bulk ferment at room temperature for 2 hours.</div></li>
      <li><div>Divide into ${R.count} even balls of about ${fmtW(R.ball)}. Put each one in a lightly oiled small container and cover.</div></li>
      <li><div>Refrigerate for at least 72 hours.</div></li>
    </ol>
    <h3 class="phase">Bake day</h3>
    <ol class="steps" style="counter-reset:s 5">
      <li><div>An hour before baking, take the dough out of the fridge and start heating the pizza oven.</div></li>
      <li><div>Check the stone with an infrared thermometer. Aim for 750°F.</div></li>
      <li><div>Stretch a ball, top it, and bake for 60–90 seconds, turning as needed for even color.</div></li>
    </ol>`;
}
function sdText() {
  const R = calcSd(), L = [];
  L.push(`SOURDOUGH PIZZA: ${R.count} × ${fmtW(R.ball)} dough balls (about ${Math.round(R.pieIn)} in pies)`);
  L.push(`${Math.round(R.h * 100)}% hydration, including the starter`);
  L.push("", `DOUGH (${fmtW(R.total)} total)`);
  R.dough.forEach((r) => L.push(`- ${r.name}: ${fmtW(r.g)}`));
  L.push("", "EACH PIZZA (starting point)", `- Crushed tomatoes: ${fmtW(R.sauce)}`, `- Fresh mozzarella: ${fmtW(R.mozz)}`, "- Basil: 2 g", "- Olive oil (1 tsp): 4 g");
  L.push("", "METHOD", "- Mix, then stretch and fold for 2 hours", "- Bulk ferment 2 hours", `- Divide into ${R.count} balls, oiled containers, fridge ${num(Sd.fridge) || 72}+ hours`,
    "- Out 1 hour before baking; preheat oven 1 hour to 750°F stone", "- Bake 60–90 seconds");
  return L.join("\n");
}

/* ================= app shell ================= */
function renderTabs() {
  $("#styleTabs").innerHTML = TYPES.map((t) => `
    <label class="style-tab">
      <input type="radio" name="pizzaType" id="type-${t.id}" value="${t.id}" data-g="type" ${S.type === t.id ? "checked" : ""}>
      ${t.icon}<span><b>${t.label}</b><small>${t.blurb}</small></span><span class="tick"></span>
    </label>`).join("");
}
function renderPanels() {
  renderDetroitPanel(); renderNycPanel(); renderSdPanel();
}
function render() {
  TYPES.forEach((t) => { $("#screen-" + t.id).hidden = S.type !== t.id; });
  ({ nyc: renderNyc, sourdough: renderSd }[S.type] || renderDetroit)();
  $("#credit").textContent = TYPES.find((t) => t.id === S.type).credit + " Your settings stay in this browser only.";
  save();
}
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => (t.hidden = true), 2200);
}

/* ---------- theme & screen wake ---------- */
const UI_KEY = "pizza-night-planner-ui";
let UI = { theme: "auto" };
try { Object.assign(UI, JSON.parse(localStorage.getItem(UI_KEY)) || {}); } catch (e) {}
function applyTheme() {
  const root = document.documentElement;
  if (UI.theme === "light" || UI.theme === "dark") root.setAttribute("data-theme", UI.theme);
  else root.removeAttribute("data-theme");
  document.querySelectorAll('input[data-ui="theme"]').forEach((r) => { r.checked = r.value === UI.theme; });
  try { localStorage.setItem(UI_KEY, JSON.stringify(UI)); } catch (e) {}
}

let wakeLock = null, wantWake = false;
function setWakeUI(on) { $("#wakeBtn").setAttribute("aria-checked", on ? "true" : "false"); }
async function acquireWake() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => { wakeLock = null; if (!wantWake) setWakeUI(false); });
    setWakeUI(true);
    return true;
  } catch (err) { wakeLock = null; return false; }
}
async function toggleWake() {
  if (wantWake) {
    wantWake = false;
    try { await wakeLock?.release(); } catch (e) {}
    wakeLock = null; setWakeUI(false); toast("Screen can dim again");
    return;
  }
  if (!("wakeLock" in navigator)) { toast("This browser can't keep the screen on"); return; }
  wantWake = true;
  if (await acquireWake()) toast("Screen will stay on while this page is open");
  else { wantWake = false; setWakeUI(false); toast("Couldn't keep the screen on here"); }
}
// The browser drops the lock when the page is hidden; take it back when the cook returns.
document.addEventListener("visibilitychange", () => {
  if (wantWake && !wakeLock && document.visibilityState === "visible") acquireWake();
});

/* ---------- events ---------- */
document.addEventListener("input", onInput);
document.addEventListener("change", onInput);
function onInput(e) {
  const el = e.target, ds = el.dataset;
  if (el.type === "radio" && !el.checked) return;

  if (ds.ui === "theme") { UI.theme = el.value; applyTheme(); return; }
  if (ds.g) {
    S[ds.g] = el.value;
    if (ds.g === "type") { try { history.replaceState(null, "", "#" + el.value); } catch (err) {} $("#resetConfirm").hidden = true; }
    render(); return;
  }

  /* Detroit */
  if (ds.k) {
    const k = ds.k;
    if (k === "dimUnit" && D.dimUnit !== el.value) {
      const f = el.value === "cm" ? 2.54 : 1 / 2.54;
      D.pans.forEach((p) => { p.a = +(num(p.a) * f).toFixed(1); if (p.b != null) p.b = +(num(p.b) * f).toFixed(1); });
      D.dimUnit = el.value; renderDetroitPanel(); render(); return;
    }
    D[k] = el.value;
    if (k === "style") renderDetroitPanel();
    render(); return;
  }
  if (ds.adv) {
    const v = el.value.trim();
    D.adv[ds.adv] = v === "" ? ADV_DEFAULTS[ds.adv] : ds.adv === "tf" ? num(v) / G_PER_OZ : num(v);
    render(); return;
  }
  if (ds.i != null) {
    const p = D.pans[+ds.i], f = ds.f;
    if (!p) return;
    if (f === "shape") {
      p.shape = el.value; if (p.shape === "rect" && p.b == null) p.b = p.a;
      renderDetroitPanel();
    } else if (f === "preset") {
      const pr = PRESETS.find((x) => x.id === el.value); if (!pr) return;
      const k = D.dimUnit === "cm" ? 2.54 : 1;
      p.shape = pr.shape; p.a = +(pr.a * k).toFixed(1); p.b = pr.b ? +(pr.b * k).toFixed(1) : p.b;
      renderDetroitPanel();
    } else {
      p[f] = el.value;
    }
    render(); return;
  }

  /* New York */
  if (ds.nk) {
    const k = ds.nk;
    if (k === "unit" && N.unit !== el.value) {
      N.size = +(num(N.size) * (el.value === "cm" ? 2.54 : 1 / 2.54)).toFixed(1);
      N.unit = el.value; renderNycPanel(); render(); return;
    }
    N[k] = el.type === "checkbox" ? el.checked : el.value;
    if (k === "crust") renderNycPanel();
    if (k === "size" || k === "flour") renderNycChips();
    render(); return;
  }
  if (ds.np) { N.protein[ds.np] = el.value; render(); return; }

  /* Sourdough */
  if (ds.sk) { Sd[ds.sk] = el.value; render(); return; }
  if (ds.sadv) {
    const v = el.value.trim();
    Sd.adv[ds.sadv] = v === "" ? SD_ADV_DEFAULTS[ds.sadv] : num(v);
    render(); return;
  }
  if (ds.nadv) {
    const v = el.value.trim();
    N.adv[ds.nadv] = v === "" ? N_ADV_DEFAULTS[ds.nadv] : ds.nadv === "tf" ? num(v) / G_PER_OZ : num(v);
    render(); return;
  }
}
document.addEventListener("click", async (e) => {
  const rm = e.target.closest("[data-remove]");
  if (rm) { D.pans.splice(+rm.dataset.remove, 1); renderDetroitPanel(); render(); return; }
  const chip = e.target.closest("[data-nsize]");
  if (chip) { N.size = +chip.dataset.nsize; $("#nSize").value = N.size; renderNycChips(); render(); return; }
  if (e.target.closest("#wakeBtn")) { toggleWake(); return; }
  const id = e.target.closest("button")?.id || e.target.id;
  if (id === "addPan") {
    const k = D.dimUnit === "cm" ? 2.54 : 1;
    D.pans.push({ shape: "rect", a: +(10 * k).toFixed(1), b: +(14 * k).toFixed(1), count: 1 });
    renderDetroitPanel(); render();
  } else if (id === "advReset") {
    D.adv = { ...ADV_DEFAULTS }; renderDetroitPanel(); render();
  } else if (id === "sdHydReset") {
    Sd.hydration = SD_HOUSE_HYDRATION; renderSdPanel(); render();
  } else if (id === "sdAdvReset") {
    Sd.adv = { ...SD_ADV_DEFAULTS }; renderSdPanel(); render();
  } else if (id === "nAdvReset") {
    N.adv = { ...N_ADV_DEFAULTS }; renderNycPanel(); render();
  } else if (id === "scaleSauce") {
    D.tomatoG = Math.ceil(calcDetroit().sauceTotal / 0.75 / 10) * 10; renderDetroitPanel(); render(); toast("Sauce batch scaled");
  } else if (id === "nScaleSauce") {
    const R = calcNyc();
    N.tomatoG = Math.ceil(R.sauce * R.count / (N.redpack ? 1.25 : 1) / 10) * 10; renderNycPanel(); render(); toast("Sauce batch scaled");
  } else if (id === "resetBtn") {
    $("#resetMsg").textContent = `Reset the ${TYPES.find((t) => t.id === S.type).label} settings to the defaults?`;
    $("#resetConfirm").hidden = false;
  } else if (id === "resetNo") {
    $("#resetConfirm").hidden = true;
  } else if (id === "resetYes") {
    if (S.type === "nyc") { S.nyc = clone(DEFAULTS.nyc); N = S.nyc; }
    else if (S.type === "sourdough") { S.sourdough = clone(DEFAULTS.sourdough); S.sourdough.bake = toLocalInput(nextSaturday(5)); Sd = S.sourdough; }
    else { S.detroit = clone(DEFAULTS.detroit); S.detroit.bake = toLocalInput(nextSaturday()); D = S.detroit; }
    $("#resetConfirm").hidden = true; renderPanels(); render(); toast("Back to the defaults");
  } else if (id === "copyBtn") {
    const text = ({ nyc: nycText, sourdough: sdText }[S.type] || detroitText)();
    try { await navigator.clipboard.writeText(text); toast("Recipe copied"); $("#copyFallback").hidden = true; }
    catch (err) {
      const box = $("#copyFallback");
      box.hidden = false;
      box.innerHTML = `<p class="hint">Copying isn't allowed here. Select the text below and copy it yourself.</p><textarea class="fallback" id="copyText" readonly></textarea>`;
      const ta = $("#copyText"); ta.value = text; ta.focus(); ta.select();
    }
  }
});

applyTheme();
renderTabs();
renderPanels();
render();
