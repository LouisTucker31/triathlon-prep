// Item formats: "text" | {t:"text", sub:["child", ...]} | {h:"Subheading"}
const DATA = [
  { title: "Overnight bag", items: [
    { t: "Friday evening clothes", sub: ["T-shirt", "Casual trousers / joggers", "Underwear", "Socks", "Comfortable shoes / trainers"] },
    "Sleepwear", "Warm hoodie / jumper", "Warm jacket", "Waterproof coat", "Toothbrush", "Toothpaste", "Deodorant", "Shower gel",
    "Lip balm", "Vitamins / supplements normally taken", "Wallet", "British Triathlon licence / membership",
    "Breakfast for race morning", "Evening snacks"
  ]},
  { title: "Camera / electronics bag", items: [
    "DSLR camera", "Lens 1", "Lens 2", "Spare DSLR batteries", "GoPro", "GoPro charger / cable", "Phone", "Phone charger",
    "Garmin watch", "Garmin watch charger", "Bike computer", "Bike computer charger", "Heart-rate monitor / chest strap", "AirPods"
  ]},
  { title: "Race-day kit bag", items: [
    "Race documents / registration details", "Race packet if issued", "Photo ID", "British Triathlon licence / membership", "Phone",
    "Wallet / bank card", "Car keys", "Timing chip", "Timing chip ankle strap", "Race numbers", "Bike number / stickers",
    "Helmet stickers", "Safety pins", "Permanent marker", "Sunscreen", "Lip balm", "Vaseline", "BodyGlide / anti-chafe",
    "First-aid kit", "Goggles", "Anti-fog / demister solution", "Swim cap", "Nose clip", "Flip-flops / sandals",
    "Warm hoodie / jumper", "Waterproof coat", "Wet bag / waterproof dry bag for wetsuit", "Foam roller"
  ]},
  { title: "Morning-of-the-race clothes", items: [
    "Socks", "T-shirt", "Comfortable shorts", "Hoodie / warm jumper", "Waterproof coat", "Comfortable trainers", "Flip-flops / sliders"
  ]},
  { title: "Swim / worn to the start", items: [
    "Trisuit", "Wetsuit", "Goggles", "Anti-fog applied to goggles", "Swim cap", "Race-issued swim cap if required", "Nose clip",
    "Garmin watch", "Heart-rate monitor", "Timing chip",
    { t: "BodyGlide", sub: ["Neck", "Shoulders", "Wrists", "Ankles"] },
    "Flip-flops / sliders", "Warm hoodie / jumper while waiting", "Waterproof coat"
  ]},
  { title: "T1 transition bag: Swim → Bike", items: [
    "Cycling helmet", "Cycling shoes", "Socks", "Cycling glasses", "Cycling gloves", "Race belt", "Race number attached to race belt",
    "Small towel for drying feet", "Gel / nutrition for start of bike"
  ]},
  { title: "Bike: fitted / carried on bike", items: [
    "Boardman road bike", "Bike computer", "Bike number fitted", "Water bottle 1", "Water bottle 2",
    "Electrolytes / hydration mix in bottles", "Bike gels", "Other bike nutrition", "Nutrition / tool bag", "Saddle bag",
    "Spare inner tube", "Tyre levers", "Mini pump", "Multi-tool"
  ]},
  { title: "T2 transition bag: Bike → Run", items: [
    "Running shoes", "Fresh running socks", "Running glasses", "Running cap / visor",
    "Race belt / race number if not already wearing it", "Running gels", "Small towel"
  ]},
  { title: "Bike equipment: carried separately", items: [
    "Track pump", "Second spare inner tube", "Allen keys", "Spare water bottle", "Spare electrolytes",
    "Spare hydration tablets", "Spare gels", "Spare nutrition"
  ]},
  { title: "Nutrition & hydration", items: [
    { h: "Before race" }, "Race-morning breakfast", "Oranges", "Water", "Pre-race electrolyte drink", "Hydration tablets", "Pre-race gel if planned",
    { h: "Bike" }, "2 × water bottles", "Electrolytes / hydration mix", "Bike gels", "Bike food / bars if using them",
    { h: "Run" }, "Running gels",
    { h: "After race" }, "Water", "Electrolytes", "Hydration tablet", "Meal replacement shake", "Recovery food / snacks"
  ]},
  { title: "Warm / dry clothes for immediately after", items: [
    "Dry underwear", "Dry socks", "Dry T-shirt", "Warm hoodie / jumper", "Warm trousers / joggers", "Waterproof coat",
    "Dry comfortable trainers", "Beanie / warm hat if cold", "Large towel", "Wet bag for wetsuit",
    "Plastic bag for wet trisuit / other kit", "Dry robe"
  ]},
  { title: "Bike checks before leaving", items: [
    "Bike mechanically sound", "Tyres checked", "Tyres inflated to chosen pressure", "No obvious tyre cuts / damage", "Wheels secure",
    "Thru-axles / quick releases secure", "Brakes working", "Gears working", "Chain clean and lubricated", "Pedals secure",
    "Bottle cages secure", "Bike computer secure", "Bike computer fully charged", "Bike computer working", "Sensors connected",
    "Heart-rate monitor connected", "Spare tube on bike", "Mini pump on bike", "Multi-tool on bike", "Tyre levers on bike",
    "Gels / nutrition attached or stored", "Both water bottles filled"
  ]}
];

const TASKS = [
  { title: "14 days out", items: [
    "Confirm race entry and registration details",
    "Read race information / athlete guide",
    "Confirm race distances and format",
    "Check start time and wave time",
    "Check registration / race-pack collection requirements",
    "Check transition rules",
    "Check wetsuit rules",
    "Check parking and venue access",
    "Confirm hotel booking",
    "Plan travel to the hotel and race venue",
    "Check British Triathlon membership / licence",
    "Check bike is mechanically sound",
    "Book bike service if anything needs attention",
    "Check tyres for wear / damage",
    "Check brake pads",
    "Check gears / drivetrain",
    "Check running shoes are in good condition",
    "Make sure wetsuit, goggles and trisuit fit correctly",
    "Confirm race nutrition strategy",
    "Confirm hydration strategy",
    "Use only nutrition / equipment already tested",
    "Start reducing unnecessary training fatigue"
  ]},
  { title: "7 days out", items: [
    "Re-read race instructions",
    "Check provisional weather forecast",
    "Check water temperature if available",
    "Confirm travel times",
    "Confirm hotel check-in",
    "Confirm parking arrangements",
    "Plan race-morning breakfast",
    "Plan pre-race nutrition",
    "Plan bike nutrition",
    "Plan run nutrition",
    "Plan post-race nutrition",
    "Buy any missing gels",
    "Buy electrolytes / hydration tablets",
    "Buy oranges / pre-race food",
    "Buy meal replacement / recovery shake",
    "Check all chargers work",
    "Check Garmin",
    "Check bike computer",
    "Check heart-rate monitor battery",
    "Check GoPro",
    "Check camera memory / storage",
    "Charge spare DSLR batteries",
    "Make sure race belt is ready",
    "Make sure wet bag is ready",
    "Start organising equipment into packing-list categories"
  ]},
  { title: "3–4 days out", items: [
    "Complete final meaningful training sessions",
    "Keep remaining training easy",
    "Prioritise sleep",
    "Prioritise hydration",
    "Eat normally",
    "Avoid experimenting with new foods",
    "Check updated weather forecast",
    "Decide race clothing based on forecast",
    "Decide whether extra warm / waterproof clothing is needed",
    "Clean bike",
    "Lubricate chain",
    "Check gears",
    "Check brakes",
    "Check tyres",
    "Check wheels",
    "Check bottle cages",
    "Check pedals",
    "Check bike computer mount",
    "Check saddle bag / tool storage",
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
    "Pack camera / electronics bag",
    "Pack race-day kit bag",
    "Pack T1 transition bag",
    "Pack T2 transition bag",
    "Prepare separately carried bike equipment",
    "Prepare warm / dry post-race clothes",
    "Put all nutrition and hydration together",
    "Put race documents together",
    "Download / screenshot race information",
    "Save race venue location",
    "Save parking location",
    "Charge phone",
    "Charge Garmin",
    "Charge bike computer",
    "Charge GoPro",
    "Charge DSLR batteries",
    "Charge AirPods",
    "Empty / format camera memory cards if required",
    "Empty / format GoPro memory card if required"
  ]},
  { title: "Day before", items: [
    { h: "Final packing & bike prep" },
    "Run through the full packing list",
    "Check bike one final time",
    "Inflate tyres to approximately the correct pressure",
    "Check front wheel / thru-axle if removing the wheel for transport",
    "Fit bike number if already issued",
    "Fit bike stickers if already issued",
    "Fit helmet stickers if already issued",
    "Mount / check bike computer",
    "Put spare tube, mini pump, tyre levers and multi-tool on bike",
    "Prepare bike nutrition",
    "Prepare running gels",
    "Prepare hydration products for the morning",
    "Prepare race-morning breakfast",
    "Put oranges / pre-race food somewhere obvious",
    "Prepare meal replacement shake for after",
    "Lay out morning-of-race clothes",
    "Put race documents, wallet and car keys together",
    "Load everything into the car except items needed overnight",
    "Put bike in / on the car when practical",
    { h: "Final planning" },
    "Check weather one final time",
    "Check race start / wave time",
    "Confirm hotel-to-venue journey time",
    "Work backwards to establish hotel departure time",
    "Work backwards to establish wake-up time",
    "Set alarm",
    "Set backup alarm",
    { h: "Evening" },
    "Eat a familiar evening meal",
    "Hydrate normally",
    "Avoid alcohol",
    "Get an early night"
  ]},
  { title: "Race morning: after waking", items: [
    "Wake up at planned time",
    "Eat race-morning breakfast",
    "Start drinking water / electrolytes",
    "Take normal vitamins / supplements",
    "Put trisuit on",
    "Get dressed in morning-of-race clothes",
    "Apply sunscreen if required",
    "Put heart-rate monitor on"
  ]},
  { title: "Race morning: final preparation", items: [
    "Fill bike water bottles",
    "Add electrolytes / hydration mix",
    "Put bike gels / nutrition on bike",
    "Take oranges / pre-race food",
    "Take planned pre-race gel if using one",
    "Check Garmin battery",
    "Check bike computer battery",
    "Check race documents",
    "Check timing chip if already collected",
    "Check T1 bag",
    "Check T2 bag",
    "Check race-day kit bag",
    "Check camera / electronics bag",
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
    "Register / collect race pack if required",
    "Collect timing chip if required",
    "Attach race numbers / stickers",
    "Attach timing chip when appropriate",
    "Check race number is on race belt",
    "Check helmet stickers",
    "Check bike number",
    "Visit toilets early"
  ]},
  { title: "Familiarise yourself with transition", items: [
    "Find transition entrance",
    "Find your rack position",
    "Identify swim start",
    "Identify swim exit",
    "Identify bike out",
    "Identify bike in",
    "Identify run out",
    "Check transition flow",
    "Memorise landmarks near your bike"
  ]},
  { title: "Set up bike / T1", items: [
    "Rack bike correctly",
    "Put bike bottles on bike",
    "Check bike nutrition",
    "Check bike computer",
    "Check heart-rate monitor connection",
    "Set bike into an appropriate starting gear",
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
    "Position running cap / visor",
    "Position running gels",
    "Position small towel",
    "Walk through T2 mentally"
  ]},
  { title: "Final preparation before leaving transition", items: [
    "Make sure everything is laid out how you want it",
    "Check bike computer one final time",
    "Check bottles are on bike",
    "Check helmet is ready",
    "Check cycling shoes are ready",
    "Check running shoes are ready",
    "Check race number / race belt",
    "Leave transition with enough time before the swim start"
  ]},
  { title: "Before the swim", items: [
    "Visit toilet one final time",
    "Stop drinking excessively close to the start",
    "Apply BodyGlide",
    "Put wetsuit on",
    "Put Garmin into triathlon mode",
    "Check heart-rate monitor",
    "Make sure timing chip is secure",
    "Put swim cap on",
    "Apply anti-fog to goggles",
    "Put goggles on",
    "Put nose clip on",
    "Familiarise yourself with swim course and turn buoys",
    "Confirm number of swim laps",
    "Hand over warm clothes / waterproof coat or place them where instructed",
    "Get to the start with time to spare"
  ]},
  { title: "Immediately after the race", items: [
    { h: "First few minutes" },
    "Stop / save Garmin activity",
    "Drink water / electrolytes",
    "Have meal replacement / recovery shake",
    "Eat recovery food",
    "Put waterproof coat on if cold / wet",
    { h: "Change & recover" },
    "Change into warm / dry clothes",
    "Put wetsuit and wet kit into wet bag",
    { h: "Collect everything" },
    "Collect T1 equipment",
    "Collect T2 equipment",
    "Collect race-day kit bag",
    "Collect bike",
    "Check timing chip return requirements",
    "Check your rack / transition area one final time",
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
    const head = document.createElement("button");
    head.className = "head"; head.type = "button";
    head.innerHTML = `<span class="chev">▶</span><span class="name"></span><span class="count"></span>`;
    head.querySelector(".name").textContent = sec.title;
    head.addEventListener("click", () => {
      wrap.classList.toggle("open");
      state.open[si] = wrap.classList.contains("open"); save();
    });
    const body = document.createElement("div"); body.className = "body";
    let n = 0;
    sec.items.forEach(it => {
      if (typeof it === "string") body.append(makeItem(`${si}-${n++}`, it));
      else if (it.h) { const h = document.createElement("div"); h.className = "sub"; h.textContent = it.h; body.append(h); }
      else {
        body.append(makeItem(`${si}-${n++}`, it.t));
        it.sub.forEach(x => body.append(makeItem(`${si}-${n++}`, x, true)));
      }
    });
    wrap.append(head, body);
    listEl.append(wrap);
  });

  function update() {
    let total = 0, done = 0;
    listEl.querySelectorAll(".section").forEach(sec => {
      const boxes = sec.querySelectorAll("input[type=checkbox]");
      const c = [...boxes].filter(x => x.checked).length;
      total += boxes.length; done += c;
      sec.querySelector(".count").textContent = `${c}/${boxes.length}`;
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

/* Race summary under the packing title */
function renderRaceLine() {
  const f = settings.fields;
  document.querySelectorAll(".race-line").forEach(el => {
  const bits = [];
  if (f.raceDate) {
    const d = new Date(f.raceDate + "T00:00:00");
    bits.push(d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }));
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
function showView(i) {
  VIEWS.forEach((v, n) => { document.getElementById("view-" + v).hidden = n !== i; });
  try { localStorage.setItem("tri-tab", String(i)); } catch {}
}
let startTab = 0;
try { startTab = Math.max(0, Math.min(2, parseInt(localStorage.getItem("tri-tab") || "0", 10) || 0)); } catch {}
tabs.forEach((t, n) => {
  t.classList.toggle("is-active", n === startTab);
  if (n === startTab) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
});
showView(startTab);
nav.addEventListener("lg:change", e => { showView(e.detail.index); window.scrollTo(0, 0); });

// PWA: register the service worker (needs http(s) - skipped on file://)
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(reg => {
      // Home-screen apps are often resumed rather than reloaded, so check for a new version on resume
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
    }).catch(err => console.warn("Service worker registration failed:", err));

    // When a new version takes over, reload once so the page runs the new code
    if (navigator.serviceWorker.controller) {
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!reloaded) { reloaded = true; location.reload(); }
      });
    }
  });
}

// Block pinch-zoom (iOS Safari ignores user-scalable=no)
["gesturestart", "gesturechange", "gestureend"].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
document.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
