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
  clearApp() {
    try { Object.keys(localStorage).filter(k => k.startsWith("tri-")).forEach(k => localStorage.removeItem(k)); } catch { /* see note above */ }
  }
};

const STORAGE_KEYS = { packing: "tri-packing-list-v2", tasks: "tri-tasks-v1", settings: "tri-settings-v1", tab: "tri-tab" };

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

// Number-only boxes: digits and one decimal point, with commas for thousands (1,500)
function formatNumber(raw) {
  let digits = raw.replace(/[^\d.]/g, "");
  const dot = digits.indexOf(".");
  if (dot !== -1) digits = digits.slice(0, dot + 1) + digits.slice(dot + 1).replace(/\./g, "");
  let [whole, fraction] = digits.split(".");
  whole = whole.replace(/^0+(?=\d)/, "").slice(0, 7).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? whole : `${whole || "0"}.${fraction.slice(0, 2)}`;
}
document.querySelectorAll("#view-settings [data-number]").forEach(input => {
  // Registered before the save handler below, so the formatted value is what's saved
  input.addEventListener("input", () => {
    const before = input.value;
    const caret = input.selectionStart ?? before.length;
    const keptLeftOfCaret = before.slice(0, caret).replace(/[^\d.]/g, "").length;
    const after = formatNumber(before);
    if (after === before) return;
    input.value = after;
    let pos = 0, seen = 0;
    while (pos < after.length && seen < keptLeftOfCaret) { if (/[\d.]/.test(after[pos])) seen++; pos++; }
    input.setSelectionRange(pos, pos);
  }, { capture: true });
});

document.querySelectorAll("#view-settings [data-key]").forEach(field => {
  const key = field.dataset.key;
  if (settings.fields[key] != null) field.value = settings.fields[key];
  // Tidy older free-text distances, e.g. "1.9km" -> "1.9"
  if ("number" in field.dataset && field.value && formatNumber(field.value) !== field.value) {
    field.value = settings.fields[key] = formatNumber(field.value);
    saveSettings();
  }
  field.addEventListener("input", () => {
    settings.fields[key] = field.value.trim() === "" ? "" : field.value;
    saveSettings();
    renderRaceLine();
  });
});

// Custom swim / bike / run distances, shown when distance is "Other"
const distanceSelect = document.querySelector('[data-key="raceDistance"]');
const customDistance = document.getElementById("customDistance");
function toggleCustomDistance() { customDistance.hidden = distanceSelect.value !== "Other"; }
distanceSelect.addEventListener("change", toggleCustomDistance);
toggleCustomDistance();

// Venue search: suggests real places (OpenStreetMap, via Photon) as you type.
// If the search fails (offline, service down) the suggestions just close and
// the box carries on working as plain text, which is the fallback.
(() => {
  const input = document.getElementById("raceLocation");
  const suggestions = document.getElementById("locationSuggest");
  const list = document.getElementById("locationList");
  const status = document.getElementById("locationStatus");
  let debounce = 0, pending = null, places = [], active = -1;

  function describePlace(p) {
    const parts = [p.name || [p.housenumber, p.street].filter(Boolean).join(" "),
      p.city || p.town || p.village || p.district || p.county, p.postcode,
      p.countrycode !== "GB" ? p.country : ""];
    return parts.filter((part, i) => part && parts.indexOf(part) === i).join(", ");
  }
  function setActive(index) {
    active = index;
    [...list.children].forEach((option, i) => option.setAttribute("aria-selected", String(i === index)));
    if (index >= 0) {
      input.setAttribute("aria-activedescendant", list.children[index].id);
      list.children[index].scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }
  function close() {
    suggestions.hidden = true;
    input.setAttribute("aria-expanded", "false");
    setActive(-1);
  }
  function render() {
    list.textContent = "";
    places.forEach((label, i) => {
      const option = document.createElement("li");
      option.id = "loc-opt-" + i;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.textContent = label;
      option.addEventListener("mousedown", e => e.preventDefault()); // keep focus in the input
      option.addEventListener("click", () => choose(i));
      list.append(option);
    });
    suggestions.hidden = !places.length;
    input.setAttribute("aria-expanded", String(!!places.length));
    setActive(-1);
    status.textContent = places.length ? `${places.length} places found. Use the up and down arrows to choose.` : "";
  }
  function choose(index) {
    input.value = places[index];
    input.dispatchEvent(new Event("input")); // saves it, like typing would
    close();
  }
  async function search(query) {
    if (pending) pending.abort();
    pending = new AbortController();
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en&lat=54.5&lon=-2.5`;
      // Only the search text is sent: no referrer, no cookies
      const result = await (await fetch(url, { signal: pending.signal, referrerPolicy: "no-referrer", credentials: "omit" })).json();
      places = [...new Set(result.features.map(f => describePlace(f.properties)).filter(Boolean))];
      if (document.activeElement === input) render();
    } catch (err) {
      if (err.name !== "AbortError") { places = []; close(); }
    }
  }

  input.addEventListener("input", e => {
    if (!e.isTrusted) return; // our own event from choose()
    clearTimeout(debounce);
    const query = input.value.trim();
    if (query.length < 3) {
      if (pending) pending.abort();
      places = [];
      close();
      return;
    }
    debounce = setTimeout(() => search(query), 300);
  });
  input.addEventListener("keydown", e => {
    if (suggestions.hidden) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((active + 1) % places.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active <= 0 ? places.length - 1 : active - 1); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  });
  // Delay so a tap on a suggestion lands before the list closes
  input.addEventListener("blur", () => setTimeout(close, 150));
})();

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

// Tabs
const VIEWS = ["packing", "tasks", "settings"];
const APP_TITLE = "Triathlon packing list";
const nav = document.querySelector(".lg-nav");
const tabs = [...nav.querySelectorAll(".lg-nav__item")];
function showView(index) {
  VIEWS.forEach((view, i) => { document.getElementById("view-" + view).hidden = i !== index; });
  const title = document.querySelector(`#view-${VIEWS[index]} h1`);
  document.title = title.textContent === APP_TITLE ? APP_TITLE : `${title.textContent} – ${APP_TITLE}`;
  storage.write(STORAGE_KEYS.tab, index);
  return title;
}
const savedTab = Number(storage.read(STORAGE_KEYS.tab, 0));
const startTab = Number.isInteger(savedTab) ? Math.max(0, Math.min(VIEWS.length - 1, savedTab)) : 0;
tabs.forEach((tab, i) => {
  tab.classList.toggle("is-active", i === startTab);
  if (i === startTab) tab.setAttribute("aria-current", "page"); else tab.removeAttribute("aria-current");
});
showView(startTab);
nav.addEventListener("lg:change", e => {
  const title = showView(e.detail.index);
  window.scrollTo(0, 0);
  title.focus({ preventScroll: true }); // so screen readers announce the new view
});

// Reset: clear every saved list, setting and tab, then start fresh
const resetDialog = document.getElementById("resetDialog");
document.getElementById("resetApp").addEventListener("click", () => resetDialog.showModal());
document.getElementById("resetCancel").addEventListener("click", () => resetDialog.close());
resetDialog.addEventListener("click", e => { if (e.target === resetDialog) resetDialog.close(); }); // tap outside
document.getElementById("resetConfirm").addEventListener("click", () => {
  storage.clearApp();
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
