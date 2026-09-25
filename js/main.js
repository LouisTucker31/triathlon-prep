// Everything is saved to localStorage on this device. It can be unavailable
// (private browsing, storage full or blocked), in which case the app still works
// for the session and simply won't remember changes, so failures are ignored here.
const storage = {
  read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* see note above */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* see note above */ }
  }
};

const STORAGE_KEYS = { packing: "tri-packing-list-v2", tasks: "tri-tasks-v1", settings: "tri-settings-v1", view: "tri-view" };

function buildChecklist(sections, storageKey, listEl, progressTextEl, progressFillEl, doneWord) {
  const state = storage.read(storageKey, {});
  state.checked = state.checked || {};
  state.open = state.open || {};
  const save = () => storage.write(storageKey, state);

  function makeCheckItem(id, text) {
    const label = document.createElement("label");
    label.className = "check-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!state.checked[id];
    const labelText = document.createElement("span");
    labelText.textContent = text;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.checked[id] = true; else delete state.checked[id];
      save(); updateProgress();
    });
    label.append(checkbox, labelText);
    return label;
  }

  sections.forEach((section, sectionIndex) => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "checklist-section";
    if (state.open[sectionIndex]) sectionEl.classList.add("is-open");

    const heading = document.createElement("h2");
    const toggle = document.createElement("button");
    toggle.className = "checklist-section__toggle";
    toggle.type = "button";
    // Fixed markup only; the section title goes in via textContent below
    toggle.innerHTML = `<span class="checklist-section__chevron" aria-hidden="true">▶</span><span class="checklist-section__title"></span><span class="checklist-section__count" aria-hidden="true"></span><span class="sr-only checklist-section__count-sr"></span>`;
    toggle.querySelector(".checklist-section__title").textContent = section.title;
    const panelId = `${storageKey}-body-${sectionIndex}`;
    toggle.setAttribute("aria-controls", panelId);
    toggle.setAttribute("aria-expanded", String(sectionEl.classList.contains("is-open")));
    toggle.addEventListener("click", () => {
      state.open[sectionIndex] = sectionEl.classList.toggle("is-open");
      save();
      toggle.setAttribute("aria-expanded", String(state.open[sectionIndex]));
    });
    heading.append(toggle);

    const panel = document.createElement("div");
    panel.className = "checklist-section__items";
    panel.id = panelId;
    // Ticks are keyed by position ("section-item"), so every entry that holds a
    // position must advance the counter, including removed (null) ones
    let position = 0;
    const nextId = () => `${sectionIndex}-${position++}`;
    section.items.forEach(entry => {
      if (entry === null) nextId();
      else if (typeof entry === "string") panel.append(makeCheckItem(nextId(), entry));
      else {
        const subheading = document.createElement("h3");
        subheading.className = "checklist-section__subheading";
        subheading.textContent = entry.h;
        panel.append(subheading);
      }
    });

    sectionEl.append(heading, panel);
    listEl.append(sectionEl);
  });

  function updateProgress() {
    let total = 0, done = 0;
    listEl.querySelectorAll(".checklist-section").forEach(sectionEl => {
      const boxes = sectionEl.querySelectorAll("input[type=checkbox]");
      const ticked = [...boxes].filter(box => box.checked).length;
      total += boxes.length;
      done += ticked;
      sectionEl.querySelector(".checklist-section__count").textContent = `${ticked}/${boxes.length}`;
      sectionEl.querySelector(".checklist-section__count-sr").textContent = `, ${ticked} of ${boxes.length} ${doneWord}`;
      sectionEl.classList.toggle("is-done", ticked === boxes.length);
    });
    progressTextEl.textContent = `${done} of ${total} ${doneWord}`;
    progressFillEl.style.width = (total ? (done / total) * 100 : 0) + "%";
  }
  updateProgress();
}

buildChecklist(PACKING_SECTIONS, STORAGE_KEYS.packing, document.getElementById("packingList"),
  document.getElementById("packingProgressText"), document.getElementById("packingProgressFill"), "packed");
buildChecklist(TASK_SECTIONS, STORAGE_KEYS.tasks, document.getElementById("tasksList"),
  document.getElementById("tasksProgressText"), document.getElementById("tasksProgressFill"), "done");

// Settings
const settings = storage.read(STORAGE_KEYS.settings, {});
settings.theme = settings.theme || "light";
settings.fields = settings.fields || {};
const saveSettings = () => storage.write(STORAGE_KEYS.settings, settings);

// Goal times are typed like a phone timer and stored as "h:mm:ss"
const GOAL_LEGS = ["goalSwim", "goalT1", "goalBike", "goalT2", "goalRun"];
const pad2 = n => String(n).padStart(2, "0");
const toSeconds = text => String(text).split(":").reduce((total, part) => total * 60 + (Number(part) || 0), 0);
const formatHMS = seconds => {
  seconds = Math.round(seconds);
  return `${Math.floor(seconds / 3600)}:${pad2(Math.floor(seconds / 60) % 60)}:${pad2(seconds % 60)}`;
};

// Convert goals saved by earlier versions, once:
//   goalSwim "15:00"            typed text (minutes:seconds, or h:mm:ss)
//   goalSwimH / M / S           separate hour, minute and second dropdowns
//   goalSwimTime "00:15"        the time picker's hours:minutes (one colon)
const OLD_GOAL_KEYS = ["goalTotal", "paceSwim", "speedBike", "paceRun"];
let migratedGoals = false;
GOAL_LEGS.forEach(leg => {
  const f = settings.fields, key = leg + "Time";
  let seconds = null;
  if (leg in f) seconds = toSeconds(f[leg]);
  else if (leg + "H" in f) seconds = (Number(f[leg + "H"]) || 0) * 3600 + (Number(f[leg + "M"]) || 0) * 60 + (Number(f[leg + "S"]) || 0);
  else if (/^\d+:\d+$/.test(f[key] || "")) seconds = toSeconds(f[key]) * 60;
  if (seconds === null) return;
  if (seconds) f[key] = formatHMS(seconds); else delete f[key];
  [leg, leg + "H", leg + "M", leg + "S"].forEach(old => delete f[old]);
  migratedGoals = true;
});
OLD_GOAL_KEYS.forEach(key => { if (key in settings.fields) { delete settings.fields[key]; migratedGoals = true; } });
if (migratedGoals) saveSettings();

// Formatted-as-you-type boxes (data-format="number"): digits and one decimal
// point, with commas for thousands (1,500). Used for the custom distances.
function formatNumber(raw) {
  let digits = raw.replace(/[^\d.]/g, "");
  const dot = digits.indexOf(".");
  if (dot !== -1) digits = digits.slice(0, dot + 1) + digits.slice(dot + 1).replace(/\./g, "");
  let [whole, fraction] = digits.split(".");
  whole = whole.replace(/^0+(?=\d)/, "").slice(0, 7).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? whole : `${whole || "0"}.${fraction.slice(0, 2)}`;
}
// Durations (data-format="duration") work like a phone timer: digits fill in
// from the right and it always reads h:mm:ss (1 -> 0:00:01, 1500 -> 0:15:00).
// Backspace removes the last digit; extra digits beyond 99:59:59 are ignored.
function formatDuration(raw) {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 6);
  if (!digits) return "";
  const padded = digits.padStart(5, "0");
  return `${Number(padded.slice(0, -4))}:${padded.slice(-4, -2)}:${padded.slice(-2)}`;
}
const FORMATTERS = { number: formatNumber, duration: formatDuration };
document.querySelectorAll("[data-format]").forEach(input => {
  const type = input.dataset.format;
  const format = FORMATTERS[type];
  // Registered before the save handler below, so the formatted value is what's saved
  input.addEventListener("input", () => {
    const before = input.value;
    const caret = input.selectionStart ?? before.length;
    const keptLeftOfCaret = before.slice(0, caret).replace(/[^\d.]/g, "").length;
    const after = format(before);
    if (after !== before) input.value = after;
    if (type === "duration") {
      input.setSelectionRange(after.length, after.length); // always type at the end, like a timer
      return;
    }
    if (after === before) return;
    let pos = 0, seen = 0;
    while (pos < after.length && seen < keptLeftOfCaret) { if (/[\d.]/.test(after[pos])) seen++; pos++; }
    input.setSelectionRange(pos, pos);
  }, { capture: true });
  // Tidy overflow when leaving the box: 0:00:75 -> 0:01:15
  if (type === "duration") input.addEventListener("blur", () => {
    if (!input.value) return;
    const tidy = formatHMS(toSeconds(input.value));
    if (tidy === input.value) return;
    input.value = tidy;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
});

document.querySelectorAll("[data-key]").forEach(field => {
  const key = field.dataset.key;
  if (settings.fields[key] != null) field.value = settings.fields[key];
  // Tidy older free-text values, e.g. a distance saved as "1.9km" -> "1.9"
  const format = FORMATTERS[field.dataset.format];
  if (format && field.value && format(field.value) !== field.value) {
    field.value = settings.fields[key] = format(field.value);
    saveSettings();
  }
  field.addEventListener("input", () => {
    settings.fields[key] = field.value.trim() === "" ? "" : field.value;
    saveSettings();
    renderRaceLine();
  });
});

// Swim / bike / run distances (swim in metres, bike and run in kilometres).
// Picking a standard distance fills them in; editing any of them afterwards
// switches the choice to "Other", so a race's real distances can be used.
const DISTANCE_PRESETS = {
  "Super sprint": { swim: 400, bike: 10, run: 2.5 },
  "Sprint": { swim: 750, bike: 20, run: 5 },
  "Olympic / Standard": { swim: 1500, bike: 40, run: 10 },
  "Middle (70.3)": { swim: 1900, bike: 90, run: 21.1 },
  "Full (Ironman)": { swim: 3800, bike: 180, run: 42.2 }
};
const distanceSelect = document.querySelector('[data-key="raceDistance"]');
const legDistanceInputs = {
  swim: document.querySelector('[data-key="swimDistance"]'),
  bike: document.querySelector('[data-key="bikeDistance"]'),
  run: document.querySelector('[data-key="runDistance"]')
};
function fillPresetDistances() {
  const preset = DISTANCE_PRESETS[distanceSelect.value];
  if (!preset) return;
  Object.entries(legDistanceInputs).forEach(([leg, input]) => {
    input.value = settings.fields[input.dataset.key] = formatNumber(String(preset[leg]));
  });
  saveSettings();
}
distanceSelect.addEventListener("change", fillPresetDistances);
Object.values(legDistanceInputs).forEach(input => input.addEventListener("input", () => {
  if (!DISTANCE_PRESETS[distanceSelect.value]) return;
  distanceSelect.value = settings.fields.raceDistance = "Other";
  saveSettings();
}));
// Races saved before the distances were always shown: fill them in once
if (DISTANCE_PRESETS[distanceSelect.value] && Object.values(legDistanceInputs).every(input => !input.value)) {
  fillPresetDistances();
}

// Goal total and paces, worked out from the goal times and the leg distances
function raceDistances() {
  const read = input => parseFloat(input.value.replace(/,/g, "")) || 0;
  return { swim: read(legDistanceInputs.swim), bike: read(legDistanceInputs.bike), run: read(legDistanceInputs.run) };
}
const legSeconds = leg => toSeconds(settings.fields[leg + "Time"] || 0);
const formatClock = seconds => {
  seconds = Math.round(seconds);
  const h = Math.floor(seconds / 3600), m = Math.floor(seconds / 60) % 60, s = seconds % 60;
  return h ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
};
const NOT_SET = "–";

function updateGoalMaths() {
  const d = raceDistances();
  const times = Object.fromEntries(GOAL_LEGS.map(leg => [leg, legSeconds(leg)]));
  const total = Object.values(times).reduce((sum, t) => sum + t, 0);
  document.getElementById("goalTotal").textContent = total ? formatHMS(total) : NOT_SET;

  document.getElementById("paceSwim").textContent =
    times.goalSwim && d.swim ? `${formatClock(times.goalSwim / (d.swim / 100))} /100m` : NOT_SET;
  document.getElementById("speedBike").textContent =
    times.goalBike && d.bike ? `${(d.bike / (times.goalBike / 3600)).toFixed(1)} km/h` : NOT_SET;
  document.getElementById("paceRun").textContent =
    times.goalRun && d.run ? `${formatClock(times.goalRun / d.run)} /km` : NOT_SET;

  // Show the distance each pace is based on, e.g. "Swim, 750 m"
  document.getElementById("paceSwimLabel").textContent = d.swim ? `Swim, ${d.swim.toLocaleString("en-GB")} m` : "Swim";
  document.getElementById("speedBikeLabel").textContent = d.bike ? `Bike, ${d.bike.toLocaleString("en-GB")} km` : "Bike";
  document.getElementById("paceRunLabel").textContent = d.run ? `Run, ${d.run.toLocaleString("en-GB")} km` : "Run";
}
// Fields save on "input" first (registered above), so settings are current here
document.getElementById("view-events").addEventListener("input", updateGoalMaths);
document.getElementById("view-events").addEventListener("change", updateGoalMaths);
updateGoalMaths();

// Location boxes (venue, accommodation) take a pasted maps link or an address.
// The pin button opens it in a maps app. On iPhone, a home-screen app opens
// ordinary web links in its own built-in browser, so the maps apps' own link
// types are used to jump straight into the app:
//   Apple device  address or Apple Maps link -> maps:// (the Maps app)
//                 Google Maps link -> the Google Maps app, or the web page if
//                 the app isn't installed
//   Android       address -> geo: (the default maps app); links open normally,
//                 and Android hands maps links to the right app
//   elsewhere     Google Maps in the browser
const IS_APPLE = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
// iPadOS reports itself as a Mac, so a touch screen marks it as iOS
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const IS_ANDROID = /Android/.test(navigator.userAgent);
const GOOGLE_MAPS_LINK = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[a-z.]+|(www\.)?google\.[a-z.]+\/maps)/i;
const APPLE_MAPS_LINK = /^https?:\/\/maps\.apple\.com\/?/i;
const isWebLink = text => /^https?:\/\//i.test(text);
const openInBrowser = url => window.open(url, "_blank", "noopener,noreferrer");

// Try an app's own link; if the page is still showing shortly after (the app
// isn't installed), fall back to the web version
function openAppOrFallback(appUrl, webUrl) {
  let leftPage = false;
  const onHide = () => { if (document.visibilityState === "hidden") leftPage = true; };
  document.addEventListener("visibilitychange", onHide);
  location.href = appUrl;
  setTimeout(() => {
    document.removeEventListener("visibilitychange", onHide);
    if (!leftPage) openInBrowser(webUrl);
  }, 1500);
}

// Where a location should open: { app } (switch to an app), { web } (browser),
// or { app, web } (try the app, fall back to the web page)
function locationTarget(text) {
  const query = encodeURIComponent(text);
  if (IS_APPLE) {
    if (GOOGLE_MAPS_LINK.test(text)) return { app: "comgooglemapsurl://" + text.replace(/^https?:\/\//i, ""), web: text };
    if (APPLE_MAPS_LINK.test(text)) return { app: text.replace(APPLE_MAPS_LINK, "maps://") };
    if (isWebLink(text)) return { web: text };
    return { app: `maps://?q=${query}` };
  }
  if (isWebLink(text)) return { web: text };
  if (IS_ANDROID) return { app: `geo:0,0?q=${query}` };
  return { web: `https://www.google.com/maps/search/?api=1&query=${query}` };
}
function openLocation(text) {
  const { app, web } = locationTarget(text);
  if (app && web) openAppOrFallback(app, web);
  else if (app) location.href = app;
  else openInBrowser(web);
}

// Buttons beside location and website boxes, shown once the box has something in it
function linkButtons(selector, idAttribute, open) {
  document.querySelectorAll(selector).forEach(button => {
    const input = document.getElementById(button.dataset[idAttribute]);
    const showButton = () => { button.hidden = !input.value.trim(); };
    input.addEventListener("input", showButton);
    showButton();
    button.addEventListener("click", () => open(input.value.trim()));
  });
}
linkButtons("[data-map-for]", "mapFor", openLocation);
// Website boxes: add https:// if it was left off; only web links are ever opened.
// On iPhone, x-safari-https:// (iOS 17+) opens the page in Safari itself rather
// than the home-screen app's built-in browser; older iOS falls back to that.
function openWebsite(text) {
  const url = isWebLink(text) ? text : "https://" + text;
  if (IS_IOS) openAppOrFallback("x-safari-" + url, url);
  else openInBrowser(url);
}
linkButtons("[data-link-for]", "linkFor", openWebsite);

// Race name under the packing and tasks titles
function renderRaceLine() {
  const { raceName } = settings.fields;
  document.querySelectorAll(".race-line").forEach(line => {
    line.textContent = "";
    if (raceName) {
      const name = document.createElement("strong");
      name.textContent = raceName;
      line.append(name);
    }
    line.hidden = !raceName;
  });
}
renderRaceLine();

// Theme: light / dark / system (js/theme.js applies it early to avoid a flash)
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
// Browser bar colour for each theme; keep in step with --bg in css/styles.css
const THEME_COLORS = { light: "#ffffff", dark: "#0b0b0c" };
function applyTheme() {
  const dark = settings.theme === "dark" || (settings.theme === "system" && darkQuery.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeColorMeta.setAttribute("content", dark ? THEME_COLORS.dark : THEME_COLORS.light);
  document.querySelectorAll("[data-theme-choice]").forEach(button =>
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === settings.theme)));
}
document.querySelectorAll("[data-theme-choice]").forEach(button => button.addEventListener("click", () => {
  settings.theme = button.dataset.themeChoice;
  saveSettings();
  applyTheme();
}));
darkQuery.addEventListener("change", applyTheme);
applyTheme();

// Views: packing, tasks and events, one per nav tab (in that order)
const VIEWS = ["packing", "tasks", "events"];
const APP_TITLE = "Triathlon packing list";
const nav = document.querySelector(".lg-nav");
const tabs = [...nav.querySelectorAll(".lg-nav__item")];
const pageTitle = title => title === APP_TITLE ? APP_TITLE : `${title} – ${APP_TITLE}`;

function showView(name) {
  VIEWS.forEach(view => { document.getElementById("view-" + view).hidden = view !== name; });
  const title = document.querySelector(`#view-${name} h1`);
  document.title = pageTitle(title.textContent);
  storage.write(STORAGE_KEYS.view, name);
  return title;
}

storage.remove("tri-tab"); // older key for the current page, replaced by tri-view
const savedView = storage.read(STORAGE_KEYS.view, "packing");
const startView = VIEWS.includes(savedView) ? savedView : "packing";
// Set the highlighted tab before the nav script reads it
tabs.forEach((tab, i) => {
  const active = VIEWS[i] === startView;
  tab.classList.toggle("is-active", active);
  if (active) tab.setAttribute("aria-current", "page"); else tab.removeAttribute("aria-current");
});
showView(startView);

nav.addEventListener("lg:change", e => {
  const title = showView(VIEWS[e.detail.index]);
  window.scrollTo(0, 0);
  title.focus({ preventScroll: true }); // so screen readers announce the new view
});

// Settings pop-up: covers everything, including the nav. Its close button sits
// where the settings button was, so the cog appears to turn into a cross.
// Closing (button or Escape) leaves you on the page you were on, and the
// browser returns focus to the settings button.
const settingsDialog = document.getElementById("settingsDialog");
let titleBeforeSettings = document.title;
document.getElementById("openSettings").addEventListener("click", () => {
  titleBeforeSettings = document.title;
  settingsDialog.showModal();
  settingsDialog.scrollTop = 0;
  document.title = pageTitle("Settings");
});
const restoreTitle = () => { document.title = titleBeforeSettings; };
document.getElementById("closeSettings").addEventListener("click", () => {
  settingsDialog.close();
  restoreTitle();
});
// Escape fires "cancel" then "close"; either restores the title (it is harmless twice)
settingsDialog.addEventListener("cancel", restoreTitle);
settingsDialog.addEventListener("close", restoreTitle);

// Reset for a new race: clears everything outside settings (packing and task
// ticks, and everything on the events page, goals included). My details,
// theme and current tab are kept.
const resetDialog = document.getElementById("resetDialog");
document.getElementById("resetApp").addEventListener("click", () => resetDialog.showModal());
document.getElementById("resetCancel").addEventListener("click", () => resetDialog.close());
resetDialog.addEventListener("click", e => { if (e.target === resetDialog) resetDialog.close(); }); // tap outside
document.getElementById("resetConfirm").addEventListener("click", () => {
  storage.remove(STORAGE_KEYS.packing);
  storage.remove(STORAGE_KEYS.tasks);
  document.querySelectorAll("#view-events [data-key]").forEach(field => delete settings.fields[field.dataset.key]);
  saveSettings();
  location.reload();
});

// PWA: register the service worker (needs http(s), so skipped on file://)
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(registration => {
      // Home-screen apps are often resumed rather than reloaded, so check for a new
      // version on resume. A failed check (e.g. offline) is retried on the next resume.
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update().catch(() => {});
      });
    }).catch(err => {
      // Kept deliberately: without the worker the app still runs, just not offline
      console.warn("Service worker registration failed:", err);
    });

    // When a new version takes over, reload once so the page runs the new code:
    // straight away if the app hasn't been used yet, otherwise when it's next
    // hidden, so it never reloads mid-use
    if (navigator.serviceWorker.controller) {
      let used = false, reloaded = false;
      const reload = () => { if (!reloaded) { reloaded = true; location.reload(); } };
      ["pointerdown", "keydown"].forEach(type => document.addEventListener(type, () => { used = true; }, { once: true, capture: true }));
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!used || document.visibilityState === "hidden") return reload();
        document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") reload(); });
      });
    }
  });
}

// Block pinch-zoom (iOS Safari ignores user-scalable=no)
["gesturestart", "gesturechange", "gestureend"].forEach(type => document.addEventListener(type, e => e.preventDefault(), { passive: false }));
document.addEventListener("touchmove", e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
