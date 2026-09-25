// Draws the "Download this event" social image: a 1080 x 1350 (4:5) PNG race
// card on a canvas, in the app's light or dark style with glass panels like the nav.
// Takes a model from main.js ({ kicker, title, location, heroLabel, heroTime,
// legs for triathlon or stats for single-sport events, footer }) and a theme,
// and returns a PNG blob. No library, so it works offline.
const EventImage = (() => {
  const W = 1080, H = 1350, PAD = 80;
  const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const THEMES = {
    light: {
      bg: "#f2f2f7",
      glow: "rgba(255, 255, 255, 0.9)",          // soft light in the top corner
      text: "#1a1a1a",
      muted: "rgba(60, 60, 67, 0.62)",
      faint: "rgba(60, 60, 67, 0.4)",
      panel: "rgba(255, 255, 255, 0.85)",
      rimTop: "rgba(255, 255, 255, 1)",
      rim: "rgba(0, 0, 0, 0.08)",
      shadow: "rgba(0, 0, 0, 0.06)",
      divider: "rgba(0, 0, 0, 0.07)",
      // Split bar shades per leg, like the app's monochrome greys
      split: { Swim: "rgba(26,26,26,0.95)", T1: "rgba(26,26,26,0.15)", Bike: "rgba(26,26,26,0.6)", T2: "rgba(26,26,26,0.15)", Run: "rgba(26,26,26,0.35)" }
    },
    dark: {
      bg: "#0b0b0c",
      glow: "rgba(255, 255, 255, 0.09)",
      text: "#f2f2f7",
      muted: "rgba(235, 235, 245, 0.6)",
      faint: "rgba(235, 235, 245, 0.35)",
      panel: "rgba(255, 255, 255, 0.06)",
      rimTop: "rgba(255, 255, 255, 0.28)",
      rim: "rgba(255, 255, 255, 0.14)",
      shadow: "rgba(0, 0, 0, 0)",
      divider: "rgba(255, 255, 255, 0.08)",
      split: { Swim: "rgba(255,255,255,0.95)", T1: "rgba(255,255,255,0.25)", Bike: "rgba(255,255,255,0.65)", T2: "rgba(255,255,255,0.25)", Run: "rgba(255,255,255,0.4)" }
    }
  };
  let C = THEMES.light;   // the palette for the image being drawn

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  const setFont = (ctx, weight, size) => { ctx.font = `${weight} ${size}px ${FONT}`; };
  // Shorten with "…" to fit a width
  function fit(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let cut = text;
    while (cut.length > 1 && ctx.measureText(cut + "…").width > maxWidth) cut = cut.slice(0, -1);
    return cut.trimEnd() + "…";
  }
  // Split into at most maxLines lines that fit, the last one shortened if needed
  function wrap(ctx, text, maxWidth, maxLines) {
    const words = text.split(/\s+/), lines = [];
    let line = "";
    words.forEach(word => {
      const attempt = line ? `${line} ${word}` : word;
      if (ctx.measureText(attempt).width <= maxWidth || !line) line = attempt;
      else { lines.push(line); line = word; }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) lines.splice(maxLines - 1, lines.length, lines.slice(maxLines - 1).join(" "));
    return lines.map(l => fit(ctx, l, maxWidth));
  }

  // Rounded glass panel: soft fill (lifted by a shadow in light mode), with a rim
  // that's brightest at the top like light on glass
  function glassPanel(ctx, x, y, w, h, r) {
    roundedRect(ctx, x, y, w, h, r);
    ctx.save();
    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.restore();
    const rim = ctx.createLinearGradient(0, y, 0, y + h);
    rim.addColorStop(0, C.rimTop);
    rim.addColorStop(1, C.rim);
    ctx.strokeStyle = rim;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  function drawFooter(ctx, text) {
    setFont(ctx, 600, 26);
    ctx.fillStyle = C.faint;
    ctx.textAlign = "left";
    ctx.fillText(text, PAD, H - PAD + 20);
  }

  function draw(model, theme) {
    C = THEMES[theme] || THEMES.light;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const contentW = W - PAD * 2;

    // Background with a soft glow in the top corner
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, W * 0.9);
    glow.addColorStop(0, C.glow);
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.textBaseline = "alphabetic";
    let y = PAD + 30;

    // Kicker: event type, distance and date
    setFont(ctx, 600, 30);
    ctx.fillStyle = C.muted;
    ctx.fillText(fit(ctx, model.kicker, contentW), PAD, y);
    y += 30;

    // Race name, up to two lines
    setFont(ctx, 800, 76);
    ctx.fillStyle = C.text;
    wrap(ctx, model.title, contentW, 2).forEach(line => { y += 84; ctx.fillText(line, PAD, y); });

    if (model.location) {
      y += 60;
      setFont(ctx, 500, 32);
      ctx.fillStyle = C.muted;
      ctx.fillText(fit(ctx, model.location, contentW), PAD, y);
    }

    // Hero: the finish (or goal) time
    y += 96;
    setFont(ctx, 600, 30);
    ctx.fillStyle = C.muted;
    ctx.fillText(model.heroLabel, PAD, y);
    y += 150;
    setFont(ctx, 800, 160);
    ctx.fillStyle = C.text;
    ctx.fillText(model.heroTime || "–", PAD - 6, y);

    // Split bar: each leg's share of the race time
    const timed = model.legs.filter(leg => leg.seconds);
    if (timed.length > 1) {
      y += 48;
      const total = timed.reduce((sum, leg) => sum + leg.seconds, 0), GAP = 6, BAR_H = 16;
      const usable = contentW - GAP * (timed.length - 1);
      let x = PAD;
      timed.forEach(leg => {
        const w = Math.max(BAR_H, usable * leg.seconds / total);
        ctx.fillStyle = C.split[leg.name] || C.muted;
        roundedRect(ctx, x, y, w, BAR_H, BAR_H / 2);
        ctx.fill();
        x += w + GAP;
      });
      y += BAR_H;
    }

    // Single-sport events: a grid of glass stat tiles instead of the leg rows
    if (model.stats) {
      y += 64;
      const GAP = 24, TILE_H = 200, tileW = (contentW - GAP) / 2;
      model.stats.forEach((stat, i) => {
        const x = PAD + (i % 2) * (tileW + GAP), tileY = y + Math.floor(i / 2) * (TILE_H + GAP);
        glassPanel(ctx, x, tileY, tileW, TILE_H, 36);
        setFont(ctx, 600, 28);
        ctx.fillStyle = C.muted;
        ctx.fillText(stat.label, x + 36, tileY + 62);
        setFont(ctx, 800, 64);
        ctx.fillStyle = C.text;
        ctx.fillText(fit(ctx, stat.value || "–", tileW - 72), x + 36, tileY + 146);
      });
      drawFooter(ctx, model.footer);
      return canvas;
    }

    // Triathlon: glass panel with one row per leg
    y += 56;
    const ROW_BIG = 124, ROW_SMALL = 84, INSET = 40;
    const panelH = model.legs.reduce((sum, leg) => sum + (leg.detail || leg.pace ? ROW_BIG : ROW_SMALL), 0);
    glassPanel(ctx, PAD, y, contentW, panelH, 40);

    let rowY = y;
    model.legs.forEach((leg, i) => {
      const big = !!(leg.detail || leg.pace), rowH = big ? ROW_BIG : ROW_SMALL;
      if (i > 0) {
        ctx.fillStyle = C.divider;
        ctx.fillRect(PAD + INSET, rowY, contentW - INSET * 2, 2);
      }
      const left = PAD + INSET, right = W - PAD - INSET;
      const nameY = rowY + (big ? 58 : 54), subY = rowY + 98;
      setFont(ctx, 700, big ? 42 : 34);
      ctx.fillStyle = big ? C.text : C.muted;
      ctx.textAlign = "left";
      ctx.fillText(leg.name, left, nameY);
      setFont(ctx, 700, big ? 44 : 34);
      ctx.textAlign = "right";
      ctx.fillStyle = big ? C.text : C.muted;
      ctx.fillText(leg.time || "–", right, nameY);
      if (big) {
        setFont(ctx, 500, 28);
        ctx.fillStyle = C.muted;
        ctx.textAlign = "left";
        if (leg.detail) ctx.fillText(fit(ctx, leg.detail, contentW / 2 - INSET), left, subY);
        ctx.textAlign = "right";
        if (leg.pace) ctx.fillText(leg.pace, right, subY);
      }
      ctx.textAlign = "left";
      rowY += rowH;
    });

    drawFooter(ctx, model.footer);

    return canvas;
  }

  // Made straight away (toDataURL, not toBlob's callback) so iPhone still treats
  // the tap as the reason for opening the share sheet
  function build(model, theme) {
    const bytes = atob(draw(model, theme).toDataURL("image/png").split(",")[1]);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
    return new Blob([buffer], { type: "image/png" });
  }

  return { build };
})();
