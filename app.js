// Item formats: "text" | {t:"text", sub:["child", ...]} | {h:"Subheading"} | null
// Ticks are saved by position, so a removed item is left as null to keep the
// items after it lined up with their saved ticks.
const DATA = [
  { title: "Overnight bag", items: [
    { t: "Friday evening clothes", sub: ["T-shirt", "Casual trousers or joggers", "Underwear", "Socks", "Comfortable shoes or trainers"] },
    "Sleepwear", "Warm hoodie or jumper", "Warm jacket", "Waterproof coat", "Toothbrush", "Toothpaste", "Deodorant", "Shower gel",
    "Lip balm", "Vitamins and supplements you normally take", "Wallet", "British Triathlon licence or membership",
    "Breakfast for race morning", "Evening snacks"
  ]},
  { title: "Camera and electronics bag", items: [
    "DSLR camera", "Lens 1", "Lens 2", "Spare DSLR batteries", "GoPro", "GoPro charger and cable", "Phone", "Phone charger",
    "Garmin watch", "Garmin watch charger", "Bike computer", "Bike computer charger", "Heart-rate monitor chest strap", "AirPods"
  ]},
  { title: "Race-day kit bag", items: [
    "Race documents and registration details", "Race pack, if issued", "Photo ID", "British Triathlon licence or membership", "Phone",
    "Wallet or bank card", "Car keys", "Timing chip", "Timing chip ankle strap", "Race numbers", "Bike number and stickers",
    "Helmet stickers", "Safety pins", "Permanent marker", "Sunscreen", "Lip balm", "Vaseline", "BodyGlide or anti-chafe balm",
    "First-aid kit", "Goggles", "Anti-fog solution", "Swim cap", "Nose clip", "Flip-flops or sandals",
    "Warm hoodie or jumper", "Waterproof coat", "Wet bag or dry bag for wetsuit", "Foam roller"
  ]},
  { title: "Race morning clothes", items: [
    "Socks", "T-shirt", "Comfortable shorts", "Hoodie or warm jumper", "Waterproof coat", "Comfortable trainers", "Flip-flops or sliders"
  ]},
  { title: "Worn to the swim start", items: [
    "Trisuit", "Wetsuit", "Goggles", "Anti-fog applied to goggles", "Swim cap", "Race-issued swim cap, if required", "Nose clip",
    "Garmin watch", "Heart-rate monitor", "Timing chip",
    { t: "BodyGlide", sub: ["Neck", "Shoulders", "Wrists", "Ankles"] },
    "Flip-flops or sliders", "Warm hoodie or jumper for waiting", "Waterproof coat"
  ]},
  { title: "T1 transition bag: swim to bike", items: [
    "Cycling helmet", "Cycling shoes", "Socks", "Cycling glasses", "Cycling gloves", "Race belt", "Race number attached to race belt",
    "Small towel for drying feet", "Gel or snack for the start of the bike"
  ]},
  { title: "On the bike", items: [
    "Boardman road bike", "Bike computer", "Bike number fitted", "Water bottle 1", "Water bottle 2",
    "Electrolytes or hydration mix in bottles", "Bike gels", "Other bike nutrition", "Nutrition and tool bag", "Saddle bag",
    "Spare inner tube", "Tyre levers", "Mini pump", "Multi-tool"
  ]},
  { title: "T2 transition bag: bike to run", items: [
    "Running shoes", "Fresh running socks", "Running glasses", "Running cap or visor",
    "Race belt and race number, if not already wearing it", "Running gels", "Small towel"
  ]},
  { title: "Spare bike kit (in the car)", items: [
    "Track pump", "Second spare inner tube", "Allen keys", "Spare water bottle", "Spare electrolytes",
    "Spare hydration tablets", "Spare gels", "Spare nutrition"
  ]},
  { title: "Food and drink", items: [
    { h: "Before the race" }, null, "Oranges", "Water", "Pre-race electrolyte drink", "Hydration tablets", "Pre-race gel, if planned",
    null, null, null, null,
    null,
    { h: "After the race" }, "Water", "Electrolytes", "Hydration tablet", "Meal replacement shake", "Recovery food or snacks"
  ]},
  { title: "Warm, dry clothes for after the race", items: [
    "Dry underwear", "Dry socks", "Dry T-shirt", "Warm hoodie or jumper", "Warm trousers or joggers", "Waterproof coat",
    "Dry comfortable trainers", "Beanie or warm hat, if cold", "Large towel", "Wet bag for wetsuit",
    "Plastic bag for wet trisuit and other kit", "Dry robe"
  ]},
  { title: "Bike checks before leaving", items: [
    "Bike mechanically sound", "Tyres checked", "Tyres inflated to chosen pressure", "No obvious tyre cuts or damage", "Wheels secure",
    "Thru-axles or quick releases secure", "Brakes working", "Gears working", "Chain clean and lubricated", "Pedals secure",
    "Bottle cages secure", "Bike computer secure", "Bike computer fully charged", "Bike computer working", "Sensors connected",
    "Heart-rate monitor connected", "Spare tube on bike", "Mini pump on bike", "Multi-tool on bike", "Tyre levers on bike",
    "Gels and nutrition attached or stored", "Both water bottles filled"
  ]}
];

const TASKS = [
  { title: "14 days out", items: [
    "Confirm race entry and registration details",
    "Read race information or athlete guide",
    "Confirm race distances and format",
    "Check start time and wave time",
    "Check how to register and collect your race pack",
    "Check transition rules",
    "Check wetsuit rules",
    "Check parking and venue access",
    "Confirm hotel booking",
    "Plan travel to the hotel and race venue",
    "Check British Triathlon membership or licence",
    "Check bike is mechanically sound",
    "Book bike service if anything needs attention",
    "Check tyres for wear or damage",
    "Check brake pads",
    "Check gears and drivetrain",
    "Check running shoes are in good condition",
    "Make sure wetsuit, goggles and trisuit fit correctly",
    "Decide what you'll eat during the race",
    "Decide what you'll drink during the race",
    "Use only nutrition and equipment you've already tested",
    "Start easing off training"
  ]},
  { title: "7 days out", items: [
    "Re-read race instructions",
    "Check provisional weather forecast",
    "Check water temperature, if available",
    "Confirm travel times",
    "Confirm hotel check-in",
    "Confirm parking arrangements",
    "Plan race-morning breakfast",
    "Plan pre-race nutrition",
    "Plan bike nutrition",
    "Plan run nutrition",
    "Plan post-race nutrition",
    "Buy any missing gels",
    "Buy electrolytes or hydration tablets",
    "Buy oranges and pre-race food",
    "Buy meal replacement or recovery shake",
    "Check all chargers work",
    "Check Garmin",
    "Check bike computer",
    "Check heart-rate monitor battery",
    "Check GoPro",
    "Check camera memory cards",
    "Charge spare DSLR batteries",
    "Make sure race belt is ready",
    "Make sure wet bag is ready",
    "Start organising equipment into packing-list categories"
  ]},
  { title: "3–4 days out", items: [
    "Do your last hard training sessions",
    "Keep remaining training easy",
    "Prioritise sleep",
    "Prioritise hydration",
    "Eat normally",
    "Avoid experimenting with new foods",
    "Check updated weather forecast",
    "Decide race clothing based on forecast",
    "Decide whether extra warm or waterproof clothing is needed",
    "Clean bike",
    "Lubricate chain",
    null,
    null,
    null,
    "Check wheels",
    "Check bottle cages",
    "Check pedals",
    "Check bike computer mount",
    "Check saddle bag and tool storage",
    "Check spare inner tube",
    "Check mini pump",
    "Check multi-tool",
    "Check tyre levers",
    "Clean cycling glasses",
    "Clean running glasses",
    "Clean goggles",
    "Test anti-fog solution",
    "Check wetsuit for damage"
  ]},
  { title: "2 days out", items: [
    "Pack overnight bag",
    "Pack camera and electronics bag",
    "Pack race-day kit bag",
    "Pack T1 transition bag",
    "Pack T2 transition bag",
    "Pack the spare bike kit",
    "Prepare warm, dry post-race clothes",
    "Put all nutrition and hydration together",
    "Put race documents together",
    "Download or screenshot race information",
    "Save race venue location",
    "Save parking location",
    "Charge phone",
    "Charge Garmin",
    "Charge bike computer",
    "Charge GoPro",
    "Charge DSLR batteries",
    "Charge AirPods",
    "Empty or format camera memory cards, if needed",
    "Empty or format GoPro memory card, if needed"
  ]},
  { title: "Day before", items: [
    { h: "Final packing and bike prep" },
    "Run through the full packing list",
    "Check bike one final time",
    "Pump tyres to about race pressure",
    "Check front wheel and thru-axle if removing the wheel for transport",
    "Fit bike number if already issued",
    "Fit bike stickers if already issued",
    "Fit helmet stickers if already issued",
    "Mount and check bike computer",
    "Put spare tube, mini pump, tyre levers and multi-tool on bike",
    "Prepare bike nutrition",
    "Prepare running gels",
    "Prepare hydration products for the morning",
    "Prepare race-morning breakfast",
    "Put oranges and pre-race food somewhere obvious",
    "Prepare meal replacement shake for after",
    "Lay out race morning clothes",
    "Put race documents, wallet and car keys together",
    "Load everything into the car except items needed overnight",
    "Load bike in or on the car",
    { h: "Final planning" },
    "Check weather one final time",
    "Check race start and wave time",
    "Confirm hotel-to-venue journey time",
    "Work out what time to leave the hotel",
    "Work out what time to wake up",
    "Set alarm",
    "Set backup alarm",
    { h: "Evening" },
    "Eat a familiar evening meal",
    "Drink as normal",
    "Avoid alcohol",
    "Get an early night"
  ]},
  { title: "Race morning: after waking", items: [
    "Wake up at planned time",
    "Eat race-morning breakfast",
    "Start drinking water and electrolytes",
    "Take normal vitamins and supplements",
    "Put trisuit on",
    "Get dressed in race morning clothes",
    "Put sunscreen on",
    "Put heart-rate monitor on"
  ]},
  { title: "Race morning: final preparation", items: [
    "Fill bike water bottles",
    "Add electrolytes or hydration mix",
    "Put bike gels and nutrition on bike",
    "Take oranges and pre-race food",
    "Take planned pre-race gel, if using one",
    "Check Garmin battery",
    "Check bike computer battery",
    "Check race documents",
    "Check timing chip, if already collected",
    "Check T1 bag",
    "Check T2 bag",
    "Check race-day kit bag",
    "Check camera and electronics bag",
    "Check warm post-race clothes",
    "Load remaining overnight items",
    "Check phone",
    "Check wallet",
    "Check car keys",
    "Check bike",
    "Check race bags",
    "Leave with plenty of spare time"
  ]},
  { title: "Arrive at venue", items: [
    "Park",
    "Take bike and race equipment to event area",
    "Register or collect race pack, if required",
    "Collect timing chip, if required",
    "Attach race numbers and stickers",
    "Put timing chip on (left ankle) before the swim",
    "Check race number is on race belt",
    "Check helmet stickers",
    "Check bike number",
    "Visit toilets early"
  ]},
  { title: "Learn the transition layout", items: [
    "Find transition entrance",
    "Find your rack position",
    "Find the swim start",
    "Find the swim exit",
    "Find bike out",
    "Find bike in",
    "Find run out",
    "Check transition flow",
    "Memorise landmarks near your bike"
  ]},
  { title: "Set up bike and T1", items: [
    "Rack bike correctly",
    "Put bike bottles on bike",
    "Check bike nutrition",
    "Check bike computer",
    "Check heart-rate monitor connection",
    "Put bike in an easy gear for the start",
    "Position helmet",
    "Position cycling shoes",
    "Position cycling glasses",
    "Position race belt",
    "Position T1 towel",
    "Walk through T1 mentally"
  ]},
  { title: "Set up T2", items: [
    "Position running shoes",
    "Position fresh socks",
    "Position running glasses",
    "Position running cap or visor",
    "Position running gels",
    "Position small towel",
    "Walk through T2 mentally"
  ]},
  { title: "Before you leave transition", items: [
    "Make sure everything is laid out how you want it",
    null,
    null,
    null,
    null,
    null,
    null,
    "Leave transition with enough time before the swim start"
  ]},
  { title: "Before the swim", items: [
    "Visit toilet one final time",
    "Don't drink too much just before the start",
    "Apply BodyGlide",
    "Put wetsuit on",
    "Put Garmin into triathlon mode",
    "Check heart-rate monitor",
    "Make sure timing chip is secure",
    "Put swim cap on",
    "Apply anti-fog to goggles",
    "Put goggles on",
    "Put nose clip on",
    "Look at the swim course and turn buoys",
    "Confirm number of swim laps",
    "Hand over warm clothes and waterproof coat, or leave them where instructed",
    "Get to the start with time to spare"
  ]},
  { title: "Immediately after the race", items: [
    { h: "First few minutes" },
    "Stop and save Garmin activity",
    "Drink water or electrolytes",
    "Have meal replacement or recovery shake",
    "Eat recovery food",
    "Put waterproof coat on if cold or wet",
    { h: "Change and recover" },
    "Change into warm, dry clothes",
    "Put wetsuit and wet kit into wet bag",
    { h: "Collect everything" },
    "Collect T1 equipment",
    "Collect T2 equipment",
    "Collect race-day kit bag",
    "Collect bike",
    "Check timing chip return requirements",
    "Check your rack and transition area one final time",
    "Make sure nothing has been left behind",
    "Pack bike safely for the journey home"
  ]}
];

function buildList(data, storageKey, listEl, overallEl, barEl, doneWord) {
  let state;
  try { state = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { state = {}; }
  state.checked = state.checked || {}; state.open = state.open || {};
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} };

  function makeItem(id, text, child) {
    const label = document.createElement("label");
    label.className = "item" + (child ? " child" : "");
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = !!state.checked[id];
    const span = document.createElement("span"); span.textContent = text;
    cb.addEventListener("change", () => {
      if (cb.checked) state.checked[id] = true; else delete state.checked[id];
      save(); update();
    });
    label.append(cb, span);
    return label;
  }

  data.forEach((sec, si) => {
    const wrap = document.createElement("div");
    wrap.className = "section";
    if (state.open[si]) wrap.classList.add("open");
    const heading = document.createElement("h2");
    const head = document.createElement("button");
    head.className = "head"; head.type = "button";
    head.innerHTML = `<span class="chev" aria-hidden="true">▶</span><span class="name"></span><span class="count" aria-hidden="true"></span><span class="sr-only count-sr"></span>`;
    head.querySelector(".name").textContent = sec.title;
    const bodyId = `${storageKey}-body-${si}`;
    head.setAttribute("aria-controls", bodyId);
    head.setAttribute("aria-expanded", String(wrap.classList.contains("open")));
    head.addEventListener("click", () => {
      wrap.classList.toggle("open");
      state.open[si] = wrap.classList.contains("open"); save();
      head.setAttribute("aria-expanded", String(state.open[si]));
    });
    heading.append(head);
    const body = document.createElement("div"); body.className = "body"; body.id = bodyId;
    let n = 0;
    sec.items.forEach(it => {
      if (it === null) n++; // removed item: keep later items' saved ticks in place
      else if (typeof it === "string") body.append(makeItem(`${si}-${n++}`, it));
      else if (it.h) { const h = document.createElement("h3"); h.className = "sub"; h.textContent = it.h; body.append(h); }
      else {
        body.append(makeItem(`${si}-${n++}`, it.t));
        it.sub.forEach(x => body.append(makeItem(`${si}-${n++}`, x, true)));
      }
    });
    wrap.append(heading, body);
    listEl.append(wrap);
  });

  function update() {
    let total = 0, done = 0;
    listEl.querySelectorAll(".section").forEach(sec => {
      const boxes = sec.querySelectorAll("input[type=checkbox]");
      const c = [...boxes].filter(x => x.checked).length;
      total += boxes.length; done += c;
      sec.querySelector(".count").textContent = `${c}/${boxes.length}`;
      sec.querySelector(".count-sr").textContent = `, ${c} of ${boxes.length} ${doneWord}`;
      sec.classList.toggle("done", c === boxes.length);
    });
    overallEl.textContent = `${done} of ${total} ${doneWord}`;
    barEl.style.width = (total ? (done / total) * 100 : 0) + "%";
  }
  update();
}

buildList(DATA, "tri-packing-list-v2", document.getElementById("list"),
  document.getElementById("overall"), document.getElementById("barFill"), "packed");
buildList(TASKS, "tri-tasks-v1", document.getElementById("tasksList"),
  document.getElementById("tasksOverall"), document.getElementById("tasksBarFill"), "done");

/* ---------- Settings ---------- */
const SKEY = "tri-settings-v1";
let settings = (() => { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch { return {}; } })();
settings.theme = settings.theme || "light";
settings.fields = settings.fields || {};
function saveSettings() { try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch {} }

document.querySelectorAll("#view-settings [data-key]").forEach(el => {
  const k = el.dataset.key;
  if (settings.fields[k] != null) el.value = settings.fields[k];
  el.addEventListener("input", () => {
    settings.fields[k] = el.value.trim() === "" ? "" : el.value;
    saveSettings(); renderRaceLine();
  });
});

/* Custom swim / bike / run distances, shown when distance is "Other" */
const distanceSelect = document.querySelector('[data-key="raceDistance"]');
const customDistance = document.getElementById("customDistance");
function toggleCustomDistance() { customDistance.hidden = distanceSelect.value !== "Other"; }
distanceSelect.addEventListener("change", toggleCustomDistance);
toggleCustomDistance();

/* Venue search: suggests real places (OpenStreetMap, via Photon) as you type.
   Free text still works offline or if the service is down. */
(() => {
  const input = document.getElementById("raceLocation");
  const box = document.getElementById("locationSuggest");
  const list = document.getElementById("locationList");
  const status = document.getElementById("locationStatus");
  let timer = 0, controller = null, results = [], active = -1;

  function describe(p) {
    const parts = [p.name || [p.housenumber, p.street].filter(Boolean).join(" "),
      p.city || p.town || p.village || p.district || p.county, p.postcode,
      p.countrycode !== "GB" ? p.country : ""];
    return parts.filter((x, i) => x && parts.indexOf(x) === i).join(", ");
  }
  function setActive(i) {
    active = i;
    [...list.children].forEach((li, n) => li.setAttribute("aria-selected", String(n === i)));
    if (i >= 0) { input.setAttribute("aria-activedescendant", list.children[i].id); list.children[i].scrollIntoView({ block: "nearest" }); }
    else input.removeAttribute("aria-activedescendant");
  }
  function close() {
    box.hidden = true; input.setAttribute("aria-expanded", "false"); setActive(-1);
  }
  function render() {
    list.textContent = "";
    results.forEach((label, i) => {
      const li = document.createElement("li");
      li.id = "loc-opt-" + i; li.setAttribute("role", "option"); li.setAttribute("aria-selected", "false");
      li.textContent = label;
      li.addEventListener("mousedown", e => e.preventDefault()); // keep focus in the input
      li.addEventListener("click", () => choose(i));
      list.append(li);
    });
    box.hidden = !results.length; input.setAttribute("aria-expanded", String(!!results.length)); setActive(-1);
    status.textContent = results.length ? `${results.length} places found. Use the up and down arrows to choose.` : "";
  }
  function choose(i) {
    input.value = results[i];
    input.dispatchEvent(new Event("input")); // saves it, like typing would
    close();
  }
  async function search(q) {
    if (controller) controller.abort();
    controller = new AbortController();
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en&lat=54.5&lon=-2.5`;
      const data = await (await fetch(url, { signal: controller.signal })).json();
      results = [...new Set(data.features.map(f => describe(f.properties)).filter(Boolean))];
      if (document.activeElement === input) render();
    } catch (e) { if (e.name !== "AbortError") { results = []; close(); } }
  }

  input.addEventListener("input", e => {
    if (!e.isTrusted) return; // our own event from choose()
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 3) { if (controller) controller.abort(); results = []; close(); return; }
    timer = setTimeout(() => search(q), 300);
  });
  input.addEventListener("keydown", e => {
    if (box.hidden) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((active + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active <= 0 ? results.length - 1 : active - 1); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  });
  input.addEventListener("blur", () => setTimeout(close, 150));
})();

/* Race summary under the packing title */
function renderRaceLine() {
  const f = settings.fields;
  document.querySelectorAll(".race-line").forEach(el => {
  const bits = [];
  if (f.raceDate) {
    // e.g. "26 Sep 26" (built by hand: some browsers write "Sept")
    const [y, m, d] = f.raceDate.split("-").map(Number);
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    bits.push(`${d} ${MONTHS[m - 1]} ${String(y).slice(-2)}`);
  }
  el.textContent = "";
  if (f.raceName) { const b = document.createElement("strong"); b.textContent = f.raceName; el.append(b); }
  if (bits.length) el.append((f.raceName ? " · " : "") + bits.join(" · "));
  el.hidden = !f.raceName && !bits.length;
  });
}
renderRaceLine();

/* Theme: light / dark / system */
const themeMq = window.matchMedia("(prefers-color-scheme: dark)");
const themeMeta = document.querySelector('meta[name="theme-color"]');
function applyTheme() {
  const dark = settings.theme === "dark" || (settings.theme === "system" && themeMq.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeMeta.setAttribute("content", dark ? "#000000" : "#ffffff");
  document.querySelectorAll("[data-theme-choice]").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.themeChoice === settings.theme)));
}
document.querySelectorAll("[data-theme-choice]").forEach(b => b.addEventListener("click", () => {
  settings.theme = b.dataset.themeChoice; saveSettings(); applyTheme();
}));
(themeMq.addEventListener ? themeMq.addEventListener("change", applyTheme) : themeMq.addListener(applyTheme));
applyTheme();

/* ---------- Tabs ---------- */
const VIEWS = ["packing", "tasks", "settings"];
const nav = document.querySelector(".lg-nav");
const tabs = [...nav.querySelectorAll(".lg-nav__item")];
const APP_TITLE = "Triathlon packing list";
function showView(i) {
  VIEWS.forEach((v, n) => { document.getElementById("view-" + v).hidden = n !== i; });
  const h1 = document.querySelector(`#view-${VIEWS[i]} h1`);
  document.title = h1.textContent === APP_TITLE ? APP_TITLE : `${h1.textContent} – ${APP_TITLE}`;
  try { localStorage.setItem("tri-tab", String(i)); } catch {}
  return h1;
}
let startTab = 0;
try { startTab = Math.max(0, Math.min(2, parseInt(localStorage.getItem("tri-tab") || "0", 10) || 0)); } catch {}
tabs.forEach((t, n) => {
  t.classList.toggle("is-active", n === startTab);
  if (n === startTab) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
});
showView(startTab);
nav.addEventListener("lg:change", e => {
  const h1 = showView(e.detail.index);
  window.scrollTo(0, 0);
  h1.focus({ preventScroll: true }); // so screen readers announce the new view
});

/* Reset: clear every saved list, setting and tab, then start fresh */
const resetDialog = document.getElementById("resetDialog");
document.getElementById("resetApp").addEventListener("click", () => resetDialog.showModal());
document.getElementById("resetCancel").addEventListener("click", () => resetDialog.close());
resetDialog.addEventListener("click", e => { if (e.target === resetDialog) resetDialog.close(); }); // tap outside
document.getElementById("resetConfirm").addEventListener("click", () => {
  try {
    Object.keys(localStorage).filter(k => k.startsWith("tri-")).forEach(k => localStorage.removeItem(k));
  } catch {}
  location.reload();
});

// PWA: register the service worker (needs http(s) - skipped on file://)
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(reg => {
      // Home-screen apps are often resumed rather than reloaded, so check for a new version on resume
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
    }).catch(err => console.warn("Service worker registration failed:", err));

    // When a new version takes over, reload once so the page runs the new code -
    // straight away if the app hasn't been used yet, otherwise when it's next hidden,
    // so it never reloads mid-use
    if (navigator.serviceWorker.controller) {
      let used = false, reloaded = false;
      const reload = () => { if (!reloaded) { reloaded = true; location.reload(); } };
      ["pointerdown", "keydown"].forEach(t => document.addEventListener(t, () => { used = true; }, { once: true, capture: true }));
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!used || document.visibilityState === "hidden") return reload();
        document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") reload(); });
      });
    }
  });
}

// Block pinch-zoom (iOS Safari ignores user-scalable=no)
["gesturestart", "gesturechange", "gestureend"].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
document.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
