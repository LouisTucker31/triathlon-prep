// Draws a Code 128 barcode as an SVG string, the format parkrun barcodes use
// (e.g. "A1234567"). Hand-written rather than a library, so it works offline.
// Uses code set B, which covers every printable ASCII character.
const Barcode = (() => {
  // Bar and space widths (in modules) for each symbol value 0–106; 104 is
  // "start B" and 106 is the stop pattern
  const PATTERNS = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
  ];
  const START_B = 104, STOP = 106, QUIET = 10; // quiet zone either side, in modules

  // Returns an SVG string, or "" if the text has characters code set B can't hold
  function svg(text, { height = 60 } = {}) {
    if (!text || !/^[\x20-\x7e]+$/.test(text)) return "";
    const values = [...text].map(ch => ch.charCodeAt(0) - 32);
    const checksum = values.reduce((sum, v, i) => sum + v * (i + 1), START_B) % 103;
    const widths = [START_B, ...values, checksum, STOP].map(v => PATTERNS[v]).join("");

    let x = QUIET, bars = "";
    [...widths].forEach((w, i) => {
      if (i % 2 === 0) bars += `M${x} 0h${w}v${height}h-${w}z`; // even positions are bars
      x += Number(w);
    });
    const width = x + QUIET;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" shape-rendering="crispEdges" role="img" aria-label="Barcode for ${text}"><rect width="${width}" height="${height}" fill="#fff"/><path d="${bars}" fill="#000"/></svg>`;
  }

  return { svg };
})();
