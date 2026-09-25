// Draws the "Download this event" social image as a PNG race card on a canvas,
// in the app's light or dark style with glass panels like the nav. Sizes suit
// the main social formats; the layout is one column, scaled to fit and centred
// vertically.
// Takes a model from main.js ({ kicker, title, location, heroLabel, heroTime,
// legs for triathlon or stats for single-sport events, footer }), a theme and a
// size, and returns a PNG blob. No library, so it works offline.
const EventImage = (() => {
  const SIZES = {
    square: [1080, 1080],      // 1:1 posts
    portrait: [1080, 1350],    // 4:5 feed posts
    story: [1080, 1920],       // 9:16 stories and reels
    landscape: [1350, 1080]    // 5:4 landscape posts
  };
  const PAD = 80, FOOTER_H = 60;
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
      // Sage green accent, as in the app: the split bar runs soft to deep, and a
      // faint green glow sits in the bottom corner
      accent: "#2a7350", accentSoft: "#a8d8bc", accentGlow: "rgba(143, 209, 171, 0.22)"
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
      accent: "#8fd1ab", accentSoft: "#3d8a63", accentGlow: "rgba(95, 180, 136, 0.14)"
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
  function text(ctx, value, x, y, weight, size, colour, align = "left") {
    setFont(ctx, weight, size);
    ctx.fillStyle = colour;
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
    ctx.textAlign = "left";
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

  // Blocks: each takes a top-left corner and a width, draws itself only when
  // paint is true (so it can be measured first), and returns its height
  function headerBlock(ctx, model, x, y, w, paint) {
    // Kicker (event, distance, date, start) wraps onto a second line if it's
    // long, breaking between items rather than mid-item
    let h = 0;
    setFont(ctx, 600, 30);
    const SEPARATOR = "  ·  ", kickerLines = [];
    model.kicker.split(SEPARATOR).forEach(part => {
      const last = kickerLines.length - 1;
      if (last >= 0 && ctx.measureText(kickerLines[last] + SEPARATOR + part).width <= w) kickerLines[last] += SEPARATOR + part;
      else kickerLines.push(part);
    });
    kickerLines.slice(0, 2).map(line => fit(ctx, line, w)).forEach((line, i) => {
      h += i ? 40 : 30;
      if (paint) text(ctx, line, x, y + h, 600, 30, C.muted);
    });
    setFont(ctx, 800, 76);
    wrap(ctx, model.title, w, 2).forEach(line => {
      h += 84;
      if (paint) text(ctx, line, x, y + h, 800, 76, C.text);
    });
    if (model.location) {
      h += 60;
      setFont(ctx, 500, 32);
      if (paint) text(ctx, fit(ctx, model.location, w), x, y + h, 500, 32, C.muted);
    }
    return h + 12;
  }
  function heroBlock(ctx, model, x, y, w, paint) {
    if (paint) {
      text(ctx, model.heroLabel, x, y + 30, 600, 30, C.accent);
      text(ctx, model.heroTime || "–", x - 6, y + 180, 800, 160, C.text);
    }
    return 192;
  }
  // Each leg's share of the race time. One accent gradient runs across the
  // whole bar (soft to deep), so the legs read as a single journey; the short
  // transitions are fainter so the swim, bike and run stand out.
  function splitBlock(ctx, model, x, y, w, paint) {
    const timed = model.legs.filter(leg => leg.seconds);
    const total = timed.reduce((sum, leg) => sum + leg.seconds, 0), GAP = 6, BAR_H = 16;
    if (paint) {
      const usable = w - GAP * (timed.length - 1);
      const gradient = ctx.createLinearGradient(x, 0, x + w, 0);
      gradient.addColorStop(0, C.accentSoft);
      gradient.addColorStop(1, C.accent);
      ctx.fillStyle = gradient;
      let barX = x;
      timed.forEach(leg => {
        const legW = Math.max(BAR_H, usable * leg.seconds / total);
        ctx.globalAlpha = leg.name === "T1" || leg.name === "T2" ? 0.35 : 1;
        roundedRect(ctx, barX, y, legW, BAR_H, BAR_H / 2);
        ctx.fill();
        barX += legW + GAP;
      });
      ctx.globalAlpha = 1;
    }
    return BAR_H;
  }
  // Single-sport events: a grid of glass stat tiles
  function statsBlock(ctx, model, x, y, w, paint) {
    const GAP = 24, TILE_H = 200, tileW = (w - GAP) / 2;
    const rows = Math.ceil(model.stats.length / 2);
    if (paint) model.stats.forEach((stat, i) => {
      const tileX = x + (i % 2) * (tileW + GAP), tileY = y + Math.floor(i / 2) * (TILE_H + GAP);
      glassPanel(ctx, tileX, tileY, tileW, TILE_H, 36);
      text(ctx, stat.label, tileX + 36, tileY + 62, 600, 28, C.muted);
      setFont(ctx, 800, 64);
      text(ctx, fit(ctx, stat.value || "–", tileW - 72), tileX + 36, tileY + 146, 800, 64, C.text);
    });
    return rows * TILE_H + (rows - 1) * GAP;
  }
  // Triathlon: a glass panel with one row per leg
  function legsBlock(ctx, model, x, y, w, paint) {
    const ROW_BIG = 124, ROW_SMALL = 84, INSET = 40;
    const isBig = leg => !!(leg.detail || leg.pace);
    const h = model.legs.reduce((sum, leg) => sum + (isBig(leg) ? ROW_BIG : ROW_SMALL), 0);
    if (!paint) return h;
    glassPanel(ctx, x, y, w, h, 40);
    let rowY = y;
    model.legs.forEach((leg, i) => {
      const big = isBig(leg), left = x + INSET, right = x + w - INSET;
      if (i > 0) {
        ctx.fillStyle = C.divider;
        ctx.fillRect(left, rowY, w - INSET * 2, 2);
      }
      const nameY = rowY + (big ? 58 : 54), subY = rowY + 98, colour = big ? C.text : C.muted;
      text(ctx, leg.name, left, nameY, 700, big ? 42 : 34, colour);
      text(ctx, leg.time || "–", right, nameY, 700, big ? 44 : 34, colour, "right");
      if (big) {
        setFont(ctx, 500, 28);
        if (leg.detail) text(ctx, fit(ctx, leg.detail, w / 2 - INSET), left, subY, 500, 28, C.muted);
        if (leg.pace) text(ctx, leg.pace, right, subY, 500, 28, C.muted, "right");
      }
      rowY += big ? ROW_BIG : ROW_SMALL;
    });
    return h;
  }

  // A column of blocks with gaps between them; returns a function with the same
  // shape as a block, so the whole card can be measured and painted like one
  const column = parts => (ctx, model, x, y, w, paint) => parts.reduce((h, part, i) =>
    h + (i ? part.gap : 0) + part.block(ctx, model, x, y + h + (i ? part.gap : 0), w, paint), 0);

  function draw(model, theme, size) {
    C = THEMES[theme] || THEMES.light;
    const [W, H] = SIZES[size] || SIZES.portrait;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "alphabetic";

    // Background with a soft light glow in the top corner...
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, Math.max(W, H) * 0.8);
    glow.addColorStop(0, C.glow);
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    // ...and a faint green glow from the opposite corner
    const greenGlow = ctx.createRadialGradient(0, H, 0, 0, H, Math.max(W, H) * 0.75);
    greenGlow.addColorStop(0, C.accentGlow);
    greenGlow.addColorStop(1, "rgba(143, 209, 171, 0)");
    ctx.fillStyle = greenGlow;
    ctx.fillRect(0, 0, W, H);

    const parts = [{ block: headerBlock }, { block: heroBlock, gap: 54 }];
    if (!model.stats && model.legs.filter(leg => leg.seconds).length > 1) parts.push({ block: splitBlock, gap: 38 });
    parts.push({ block: model.stats ? statsBlock : legsBlock, gap: 56 });
    const card = column(parts);
    const availW = W - PAD * 2, availH = H - PAD * 2 - FOOTER_H;

    // Scale down if needed to fit the height, then centre vertically
    const heightAt = scale => card(ctx, model, 0, 0, availW / scale, false);
    let scale = Math.min(1, availH / heightAt(1));
    scale = Math.min(scale, availH / heightAt(scale));   // re-check once: a wider column can wrap differently
    const h = heightAt(scale) * scale;
    ctx.setTransform(scale, 0, 0, scale, PAD, PAD + (availH - h) / 2);
    card(ctx, model, 0, 0, availW / scale, true);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    text(ctx, model.footer, PAD, H - PAD + 20, 600, 26, C.faint);
    return canvas;
  }

  // Made straight away (toDataURL, not toBlob's callback) so iPhone still treats
  // the tap as the reason for opening the share sheet
  function build(model, theme, size) {
    const bytes = atob(draw(model, theme, size).toDataURL("image/png").split(",")[1]);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
    return new Blob([buffer], { type: "image/png" });
  }

  return { build };
})();
