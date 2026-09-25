// Writes the one-page A4 "Download this event" PDF. Hand-written rather than a
// library so it works offline and needs no third-party script: text in PDF's
// built-in Helvetica fonts, lines, rounded boxes and clickable links.
// Takes a summary model from main.js ({ title, subtitle, sections, footer }).
const EventPdf = (() => {
  const PAGE_W = 595.28, PAGE_H = 841.89, MARGIN = 40;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  // Match the app: near-black text, grey labels, light borders and dividers
  const COLOURS = {
    text: [0.102, 0.102, 0.102],
    muted: [0.4, 0.4, 0.4],
    border: [0.89, 0.89, 0.89],
    divider: [0.94, 0.94, 0.94],
    link: [0.145, 0.388, 0.922]
  };

  // Character widths (1/1000 em) for ASCII 32-126, from the standard Helvetica
  // and Helvetica-Bold font metrics; used to fit and truncate text
  const WIDTHS = {
    regular: [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584],
    bold: [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584]
  };
  // Characters outside ASCII that the fonts' WinAnsi encoding can show
  const WIN_ANSI = { "€": 0x80, "…": 0x85, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97 };
  const NARROW = { 0x85: 1000, 0x91: 222, 0x92: 222, 0xB7: 278, 0xB0: 400 };

  const codeFor = ch => {
    const c = ch.codePointAt(0);
    if (c >= 32 && c <= 126) return c;
    if (WIN_ANSI[ch]) return WIN_ANSI[ch];
    if (c >= 0xA0 && c <= 0xFF) return c;   // Latin-1 (£, °, é, · ...) maps straight across
    return 63;                              // anything else prints as "?"
  };
  const widthOf = (text, size, bold) => [...text].reduce((sum, ch) => {
    const c = codeFor(ch);
    const w = c >= 32 && c <= 126 ? WIDTHS[bold ? "bold" : "regular"][c - 32] : NARROW[c] ?? 556;
    return sum + w;
  }, 0) * size / 1000;
  // Shorten with "…" so text never runs outside its box
  function fit(text, size, bold, maxWidth) {
    if (widthOf(text, size, bold) <= maxWidth) return text;
    let cut = text;
    while (cut.length > 1 && widthOf(cut + "…", size, bold) > maxWidth) cut = cut.slice(0, -1);
    return cut.trimEnd() + "…";
  }
  // PDF string literal: escape ( ) \ and write non-ASCII as octal byte codes
  const pdfString = text => "(" + [...text].map(ch => {
    const c = codeFor(ch);
    if (ch === "(" || ch === ")" || ch === "\\") return "\\" + ch;
    return c >= 32 && c <= 126 ? String.fromCharCode(c) : "\\" + c.toString(8).padStart(3, "0");
  }).join("") + ")";
  const n = value => Number(value.toFixed(2));

  function render(model) {
    const ops = [], links = [];
    const colour = (rgb, stroke) => `${rgb.map(n).join(" ")} ${stroke ? "RG" : "rg"}`;
    // y is measured from the top of the page; PDF measures from the bottom
    const text = (x, baseline, value, size, bold, rgb) =>
      ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${colour(rgb)} ${n(x)} ${n(PAGE_H - baseline)} Td ${pdfString(value)} Tj ET`);
    const line = (x1, y1, x2, y2, rgb, width = 0.75) =>
      ops.push(`${width} w ${colour(rgb, true)} ${n(x1)} ${n(PAGE_H - y1)} m ${n(x2)} ${n(PAGE_H - y2)} l S`);
    function roundedBox(x, y, w, h, r, stroke) {
      const k = r * 0.5523, top = PAGE_H - y, bottom = PAGE_H - y - h;   // 0.5523: circle from Béziers
      const path = [
        `${n(x + r)} ${n(top)} m`, `${n(x + w - r)} ${n(top)} l`,
        `${n(x + w - r + k)} ${n(top)} ${n(x + w)} ${n(top - r + k)} ${n(x + w)} ${n(top - r)} c`,
        `${n(x + w)} ${n(bottom + r)} l`,
        `${n(x + w)} ${n(bottom + r - k)} ${n(x + w - r + k)} ${n(bottom)} ${n(x + w - r)} ${n(bottom)} c`,
        `${n(x + r)} ${n(bottom)} l`,
        `${n(x + r - k)} ${n(bottom)} ${n(x)} ${n(bottom + r - k)} ${n(x)} ${n(bottom + r)} c`,
        `${n(x)} ${n(top - r)} l`,
        `${n(x)} ${n(top - r + k)} ${n(x + r - k)} ${n(top)} ${n(x + r)} ${n(top)} c`
      ].join(" ");
      ops.push(`0.75 w ${colour(stroke, true)} ${path} S`);
    }
    const link = (x, y, w, h, url) => links.push({ x, y, w, h, url });

    let y = MARGIN;
    text(MARGIN, y + 24, fit(model.title, 26, true, CONTENT_W), 26, true, COLOURS.text);
    y += 36;
    if (model.subtitle) {
      text(MARGIN, y + 11, fit(model.subtitle, 11, false, CONTENT_W), 11, false, COLOURS.muted);
      y += 22;
    }
    line(MARGIN, y, PAGE_W - MARGIN, y, COLOURS.border);
    y += 20;

    const PAD = 12;
    model.sections.forEach(section => {
      text(MARGIN + 2, y + 9, section.heading, 10, true, COLOURS.muted);
      y += 16;

      if (section.fields) {
        // Label / value pairs in columns (two unless the section asks for more),
        // like the app's field groups. Empty values stay blank to write in by hand.
        const ROW_H = 36, cols = section.columns || 2, colW = CONTENT_W / cols;
        const count = section.fields.length, rows = Math.ceil(count / cols);
        roundedBox(MARGIN, y, CONTENT_W, rows * ROW_H, 8, COLOURS.border);
        section.fields.forEach((field, i) => {
          const row = Math.floor(i / cols), col = i % cols;
          const cellX = MARGIN + col * colW, cellY = y + row * ROW_H;
          const last = i === count - 1;   // the last field stretches to fill a short final row
          const width = (last ? MARGIN + CONTENT_W - cellX : colW) - PAD * 2;
          if (row > 0 && col === 0) line(MARGIN, cellY, MARGIN + CONTENT_W, cellY, COLOURS.divider);
          if (col > 0) line(cellX, cellY, cellX, cellY + ROW_H, COLOURS.divider);
          text(cellX + PAD, cellY + 13, fit(field.label, 8, false, width), 8, false, COLOURS.muted);
          const value = fit(field.value, 11, false, width);
          text(cellX + PAD, cellY + 28, value, 11, false, field.link ? COLOURS.link : COLOURS.text);
          if (field.link) link(cellX + PAD, cellY + 17, widthOf(value, 11, false), 14, field.link);
        });
        y += rows * ROW_H + 18;
      }

      if (section.table) {
        // A header row, then one row per entry and a bold total. The first column
        // (the row names) is narrower; the rest share the width equally. An
        // optional list of dividers separates groups of columns (leg | goal | actual).
        const { columns, rows, total, dividersBefore = [] } = section.table;
        const HEAD_H = 24, ROW_H = 26, FIRST_W = CONTENT_W * 0.18;
        const restW = (CONTENT_W - FIRST_W) / (columns.length - 1);
        const colLeft = c => MARGIN + (c === 0 ? 0 : FIRST_W + (c - 1) * restW);
        const colWidth = c => (c === 0 ? FIRST_W : restW) - PAD;
        const allRows = total ? [...rows, total] : rows;
        const h = HEAD_H + allRows.length * ROW_H;
        roundedBox(MARGIN, y, CONTENT_W, h, 8, COLOURS.border);
        line(MARGIN, y + HEAD_H, MARGIN + CONTENT_W, y + HEAD_H, COLOURS.border);
        dividersBefore.forEach(c => line(colLeft(c), y, colLeft(c), y + h, COLOURS.border));
        columns.forEach((label, c) => text(colLeft(c) + PAD, y + 15.5, fit(label, 8, true, colWidth(c)), 8, true, COLOURS.muted));
        allRows.forEach((cells, r) => {
          const rowY = y + HEAD_H + r * ROW_H, isTotal = total && r === allRows.length - 1;
          if (r > 0) line(MARGIN, rowY, MARGIN + CONTENT_W, rowY, isTotal ? COLOURS.border : COLOURS.divider);
          cells.forEach((cell, c) => {
            const bold = isTotal || c === 0;
            text(colLeft(c) + PAD, rowY + 17, fit(cell, 11, bold, colWidth(c)), 11, bold, COLOURS.text);
          });
        });
        y += h + 18;
      }
    });

    if (model.footer) text(MARGIN, PAGE_H - 28, model.footer, 8, false, COLOURS.muted);
    return { content: ops.join("\n"), links };
  }

  function build(model) {
    const { content, links } = render(model);
    const objects = [];
    const add = body => objects.push(body);   // object number = index + 1
    add("<< /Type /Catalog /Pages 2 0 R >>");
    add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    const annotRefs = links.map((_, i) => `${7 + i} 0 R`).join(" ");
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R` +
      (links.length ? ` /Annots [${annotRefs}]` : "") + " >>");
    add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    links.forEach(l => add(`<< /Type /Annot /Subtype /Link /Border [0 0 0] ` +
      `/Rect [${n(l.x)} ${n(PAGE_H - l.y - l.h)} ${n(l.x + l.w)} ${n(PAGE_H - l.y)}] ` +
      `/A << /S /URI /URI ${pdfString(l.url)} >> >>`));
    add(`<< /Title ${pdfString(model.title)} /Producer (Tri packing) >>`);

    // Everything above is plain ASCII, so string length equals byte length
    let pdf = "%PDF-1.4\n";
    const offsets = objects.map((body, i) => {
      const offset = pdf.length;
      pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
      return offset;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
      offsets.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return new Blob([pdf], { type: "application/pdf" });
  }

  return { build };
})();
