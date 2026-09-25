# Triathlon packing list

A packing list and race-prep checklist for triathlon, built as an installable
web app (PWA) with plain HTML, CSS and JavaScript. No build step.

Live: https://louistucker31.github.io/triathlon-prep/

## Structure

```
index.html              the whole app (packing, tasks, events; settings pop-up)
manifest.webmanifest    install details (name, icons, colours)
sw.js                   service worker: offline support and updates (must stay in the root)
css/styles.css
js/theme.js             applies the saved theme before first paint
js/lists.js             packing and task list content (triathlon; other event types have none yet)
js/main.js              app logic
js/event-pdf.js         builds the one-page "Download this event" PDF (no library)
js/event-image.js       draws the 4:5 social image (PNG, light style) for the same button pair
js/liquid-glass-nav.js  floating tab bar
assets/icons/
```

Ticks are saved by each item's position in its list. To remove an item from
`js/lists.js`, replace it with `null` rather than deleting it; add new items at
the end of a section. See the note at the top of that file.

After changing any file, bump `VERSION` in `sw.js` if you want installed copies
to drop their old cache straight away (they update on next launch either way).

## Data and privacy

- Everything you enter (ticks, race details, emergency contact) is stored only
  in your browser's localStorage on this device. Nothing is sent to a server.
  "Reset for a new race" in settings clears the race-specific parts.
- Nothing is sent anywhere unless you tap a map button, which opens the address
  in a maps app (Apple Maps or Google Maps on iPhone, the default app on Android).
- No analytics, tracking, cookies or third-party scripts.

## Security

The site is hosted on GitHub Pages, which serves HTTPS, redirects HTTP to HTTPS
and sends `Strict-Transport-Security`. GitHub Pages does not allow custom
response headers, so:

- **Content Security Policy** is set with a `<meta>` tag in `index.html`. Scripts,
  styles and everything else are limited to this site; images also allow
  `data:` (used by the nav's glass effect); network requests are limited to this
  site. If you add an external service, add it to `connect-src`.
- A meta-tag CSP cannot set `frame-ancestors` and cannot run in report-only
  mode. The referrer policy is also set with a `<meta>` tag.

If the site moves to a host that allows headers (Netlify, Cloudflare Pages and
so on), set these there and remove the meta CSP:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Third-party code

`js/liquid-glass-nav.js` includes the core of
[rizzytoday/liquid-glass](https://github.com/rizzytoday/liquid-glass)
(MIT licence), copied into this repo rather than loaded from a CDN, so there is
no external script to verify with Subresource Integrity. It was reviewed when
added: it builds an SVG filter and a canvas image and makes no network requests.
Nav icons are Google Material Symbols (Apache 2.0), inlined as SVG.
