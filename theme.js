// Apply the saved theme before the page paints (no flash)
(function () {
  var pref = "light";
  try { pref = (JSON.parse(localStorage.getItem("tri-settings-v1")) || {}).theme || "light"; } catch (e) {}
  var dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
})();
