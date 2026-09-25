/* =====================================================================
   Liquid Glass Nav - reusable floating tab bar
   Pair with liquid-glass-nav.css. Plain script, no build step, works
   from file:// - include it at the end of the body with a
     script tag: src="liquid-glass-nav.js"

   Every <nav class="lg-nav"> on the page is set up automatically.
   Listen for tab changes:
     nav.addEventListener('lg:change', e => console.log(e.detail.index, e.detail.item))
   Tune the refraction (Chromium only) with data-lg-scale on the nav, or
   call LiquidGlass.initNav(nav, { scale: -120, ... }) yourself and add
   data-lg-manual to the nav to skip auto-init.

   Includes core/liquid-glass.js from https://github.com/rizzytoday/liquid-glass
   (MIT, (c) Riz Roze), unchanged apart from being wrapped for plain script-tag use.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- rizzytoday/liquid-glass core ---------- */
  function resolveConfig(el, opts) {
    const rect = el.getBoundingClientRect();
    const ab = opts.aberration ?? [0, 10, 20];
    return {
      width: opts.width ?? Math.round(rect.width),
      height: opts.height ?? Math.round(rect.height),
      radius: opts.borderRadius ?? 50,
      scale: opts.scale ?? -180,
      border: opts.border ?? 0.07,
      lightness: opts.lightness ?? 50,
      alpha: opts.alpha ?? 0.93,
      blur: opts.blur ?? 11,
      r: ab[0],
      g: ab[1],
      b: ab[2],
      frost: opts.frost ?? 0,
      saturation: opts.saturation ?? 1,
      displace: opts.displaceBlur ?? 0
    };
  }
  const isChromium = typeof navigator !== "undefined" && /Chrome\//.test(navigator.userAgent);
  const _mapCache = /* @__PURE__ */ new Map();
  function buildDisplacementMap(c) {
    const key = `${c.width}:${c.height}:${c.radius}:${c.scale}:${c.border}:${c.blur}:${c.lightness}:${c.alpha}`;
    const cached = _mapCache.get(key);
    if (cached) return cached;
    const maxDisplace = Math.max(Math.abs(c.scale) * 0.5, 20);
    const padX = Math.ceil(maxDisplace);
    const padY = Math.ceil(maxDisplace);
    const totalW = c.width + padX * 2;
    const totalH = c.height + padY * 2;
    const canvas = document.createElement("canvas");
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgb(128, 128, 128)";
    ctx.fillRect(0, 0, totalW, totalH);
    const ox = padX;
    const oy = padY;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(ox, oy, c.width, c.height, c.radius);
    ctx.clip();
    ctx.fillStyle = "#000000";
    ctx.fillRect(ox, oy, c.width, c.height);
    const redGrad = ctx.createLinearGradient(ox + c.width, oy, ox, oy);
    redGrad.addColorStop(0, "#000000");
    redGrad.addColorStop(1, "#ff0000");
    ctx.fillStyle = redGrad;
    ctx.fillRect(ox, oy, c.width, c.height);
    ctx.globalCompositeOperation = "difference";
    const blueGrad = ctx.createLinearGradient(ox, oy, ox, oy + c.height);
    blueGrad.addColorStop(0, "#000000");
    blueGrad.addColorStop(1, "#0000ff");
    ctx.fillStyle = blueGrad;
    ctx.fillRect(ox, oy, c.width, c.height);
    ctx.globalCompositeOperation = "source-over";
    const borderPx = Math.min(c.width, c.height) * (c.border * 0.5);
    ctx.filter = `blur(${c.blur}px)`;
    ctx.fillStyle = `hsla(0, 0%, ${c.lightness}%, ${c.alpha})`;
    ctx.beginPath();
    ctx.roundRect(
      ox + borderPx,
      oy + borderPx,
      c.width - borderPx * 2,
      c.height - borderPx * 2,
      c.radius
    );
    ctx.fill();
    ctx.restore();
    const uri = canvas.toDataURL();
    _mapCache.set(key, uri);
    return uri;
  }
  let _instanceCount = 0;
  function createFilterSVG(id) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.style.cssText = "position:absolute;width:0;height:0;pointer-events:none;";
    svg.innerHTML = `
      <defs>
        <filter id="${id}" color-interpolation-filters="sRGB" x="-38%" y="-188%" width="176%" height="476%">
          <feImage result="map" preserveAspectRatio="none" />
          <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispRed" data-channel="red" />
          <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispGreen" data-channel="green" />
          <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
          <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispBlue" data-channel="blue" />
          <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
          <feBlend in="red" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue" mode="screen" result="output" />
          <feGaussianBlur in="output" stdDeviation="0" />
        </filter>
      </defs>
    `;
    const filter = svg.querySelector("filter");
    const feImage = svg.querySelector("feImage");
    const red = svg.querySelector('[data-channel="red"]');
    const green = svg.querySelector('[data-channel="green"]');
    const blue = svg.querySelector('[data-channel="blue"]');
    const blurEl = svg.querySelector("feGaussianBlur");
    return { svg, feImage, red, green, blue, blur: blurEl, filter };
  }
  function applyConfig(c, refs) {
    const uri = buildDisplacementMap(c);
    const maxD = Math.max(Math.abs(c.scale) * 0.5, 20);
    const pctX = Math.ceil(maxD / c.width * 100);
    const pctY = Math.ceil(maxD / c.height * 100);
    refs.filter.setAttribute("x", `-${pctX}%`);
    refs.filter.setAttribute("y", `-${pctY}%`);
    refs.filter.setAttribute("width", `${100 + pctX * 2}%`);
    refs.filter.setAttribute("height", `${100 + pctY * 2}%`);
    refs.feImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", uri);
    refs.feImage.setAttribute("href", uri);
    refs.red.setAttribute("scale", String(c.scale + c.r));
    refs.green.setAttribute("scale", String(c.scale + c.g));
    refs.blue.setAttribute("scale", String(c.scale + c.b));
    refs.blur.setAttribute("stdDeviation", String(c.displace));
  }
  function createLiquidGlass(element, options = {}) {
    const fallback = options.fallbackFilter ?? "blur(12px)";
    if (!isChromium) {
      const prev = element.style.backdropFilter;
      const prevWebkit = element.style.getPropertyValue("-webkit-backdrop-filter");
      element.style.backdropFilter = fallback;
      element.style.setProperty("-webkit-backdrop-filter", fallback);
      const dummySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      return {
        isActive: false,
        filterElement: dummySvg,
        update() {
        },
        destroy() {
          element.style.backdropFilter = prev;
          element.style.setProperty("-webkit-backdrop-filter", prevWebkit);
        }
      };
    }
    const id = options.filterId ?? `liquid-glass-${++_instanceCount}`;
    const refs = createFilterSVG(id);
    document.body.appendChild(refs.svg);
    let currentOpts = { ...options };
    let config = resolveConfig(element, currentOpts);
    applyConfig(config, refs);
    const applyStyles = (c) => {
      element.style.backdropFilter = `url(#${id}) saturate(${c.saturation})`;
      element.style.setProperty(
        "-webkit-backdrop-filter",
        `url(#${id}) saturate(${c.saturation})`
      );
      if (c.frost > 0) {
        element.style.background = `hsl(0 0% 0% / ${c.frost})`;
      }
    };
    applyStyles(config);
    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (currentOpts.width == null || currentOpts.height == null) {
          config = resolveConfig(element, currentOpts);
          applyConfig(config, refs);
          applyStyles(config);
        }
      });
    });
    ro.observe(element);
    return {
      isActive: true,
      filterElement: refs.svg,
      update(newOpts) {
        currentOpts = { ...currentOpts, ...newOpts };
        config = resolveConfig(element, currentOpts);
        applyConfig(config, refs);
        applyStyles(config);
      },
      destroy() {
        ro.disconnect();
        cancelAnimationFrame(resizeRaf);
        refs.svg.remove();
        element.style.backdropFilter = "";
        element.style.setProperty("-webkit-backdrop-filter", "");
        element.style.background = "";
      }
    };
  }

  /* ---------- Nav behaviour ---------- */
  var DEFAULTS = {
    // identical in every kit
    scale: -45,             // refraction strength (Chrome/Edge only)
    aberration: [0, 2, 4],  // subtle rainbow fringing at the edge
    displaceBlur: 1.2,
    saturation: 1.5,
    fallbackFilter: "blur(var(--lg-lens-blur)) saturate(var(--lg-saturate))"
  };

  function initNav(nav, opts) {
    if (nav.__lg) return nav.__lg;
    var glass = nav.querySelector(".lg-surface__lens");
    var items = Array.prototype.slice.call(nav.querySelectorAll(".lg-nav__item"));
    var indicator = nav.querySelector(".lg-nav__indicator");

    var o = Object.assign({}, DEFAULTS, opts || {});
    if (nav.dataset.lgScale) o.scale = Number(nav.dataset.lgScale);
    if (o.borderRadius == null) o.borderRadius = nav.offsetHeight / 2;

    var glassInst = glass ? createLiquidGlass(glass, o) : null;
    nav.classList.add(glassInst && glassInst.isActive ? "lg--refract" : "lg--fallback");

    function activeItem() {
      return items.find(function (i) { return i.classList.contains("is-active"); }) || items[0];
    }
    function moveIndicator(el, animate) {
      if (!indicator || !el) return;
      if (!animate) indicator.classList.add("no-anim");
      var over = parseFloat(getComputedStyle(nav).getPropertyValue("--lg-nav-bubble-overhang")) || 0;
      indicator.style.width = (el.offsetWidth + over * 2) + "px";
      indicator.style.transform = "translateX(" + (el.offsetLeft - over) + "px)";
      if (!animate) { indicator.offsetWidth; indicator.classList.remove("no-anim"); }
    }
    function select(el, emit) {
      items.forEach(function (i) {
        var on = i === el;
        i.classList.toggle("is-active", on);
        if (on) i.setAttribute("aria-current", "page"); else i.removeAttribute("aria-current");
      });
      moveIndicator(el, true);
      if (emit) nav.dispatchEvent(new CustomEvent("lg:change", { detail: { index: items.indexOf(el), item: el } }));
    }

    items.forEach(function (item) {
      item.addEventListener("click", function (e) {
        if (item.getAttribute("href") === "#" || item.tagName === "BUTTON") e.preventDefault();
        select(item, true);
      });
    });

    // Little "squish" when pressed, like iOS
    nav.addEventListener("pointerdown", function () { nav.classList.add("is-pressed"); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) {
      nav.addEventListener(t, function () { nav.classList.remove("is-pressed"); });
    });

    moveIndicator(activeItem(), false);
    var ro = new ResizeObserver(function () { moveIndicator(activeItem(), false); });
    ro.observe(nav);

    nav.__lg = {
      glass: glassInst,
      select: function (i) { select(items[i], false); },
      destroy: function () { ro.disconnect(); if (glassInst) glassInst.destroy(); delete nav.__lg; }
    };
    return nav.__lg;
  }

  function autoInit() {
    document.querySelectorAll(".lg-nav:not([data-lg-manual])").forEach(function (n) { initNav(n); });
  }

  window.LiquidGlass = { createLiquidGlass: createLiquidGlass, isChromium: isChromium, initNav: initNav };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoInit);
  else autoInit();
})();

