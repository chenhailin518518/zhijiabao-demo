# ZhiJiaBao (智价宝)

A front-end prototype for a marketplace where idle scenic-spot cultural merchandise changes hands. It covers 8 scenic spots and 8 categories of merchandise, and offers four pages: AI valuation, cross-platform price comparison, a second-hand marketplace, and a personal center.

This site is a competition demo prototype. All product data, price ranges and valuation results on the pages are mock data. There is no backend service or database.

- Gitee: <https://gitee.com/loopes_yxqz/zhijiabao>
- GitHub: <https://github.com/chenhailin518518/zhijiabao-demo>

## Run Locally

A pure static site — no build step, no third-party dependencies, nothing to install. Serve the project root with any static server:

```bash
python -m http.server 8080
```

Then open <http://localhost:8080/>. With Node installed, `npx serve .` works too.

Opening `index.html` directly over the `file://` protocol renders the home page, but nested pages (`estimate/`, etc.) may fail to load styles or scripts in some browsers. Use a local server instead.

## Pages

| Page | File | Contents |
| --- | --- | --- |
| Home | `index.html` | Project intro, four feature entries, capability matrix, featured merchandise, safeguard mechanisms |
| AI Valuation | `estimate.html` | Upload an image, pick scenic spot and condition, add notes, generate a valuation |
| Price Comparison | `compare.html` | Official price / merchant clearance price / second-hand price side by side, with search and sorting |
| Marketplace | `market.html` | Personal idle items and merchant overstock, product detail, favorites, listing form, live scenic-spot weather |
| Personal Center | `profile.html` | Valuation history, my listings, favorites, sign-in state |

Every page also ships as `index.html` inside a directory of the same name (e.g. `estimate/index.html`) so URLs work without the `.html` suffix. The two copies must stay identical apart from their relative path prefix; `node tests/smoke.mjs` checks this.

## Directory Layout

```
.
├── index.html              Home
├── estimate.html           Valuation page (outer copy)
├── estimate/index.html     Valuation page (directory entry)
├── compare.html            Price comparison
├── compare/index.html
├── market.html             Marketplace
├── market/index.html
├── profile.html            Personal center
├── profile/index.html
├── styles.css              Site-wide styles, 5943 lines
├── script.js               Page interactions and valuation algorithm, 2526 lines
├── api-services.js         External API wrappers, 302 lines
├── assets/img/             favicon, hero background, 8 product images
├── tests/smoke.mjs         Smoke tests
└── .nojekyll               Disables Jekyll processing on GitHub Pages
```

## Valuation Algorithm

The core implementation is `aiValuationEngine()` in `script.js`.

Suggested price = original price × condition factor × scenic-spot factor × season factor × keyword bonus × supply-demand index

| Dimension | Values | Notes |
| --- | --- | --- |
| Condition factor | New 0.82 / Like new 0.72 / Good 0.62 / Fair 0.48 | Chosen from a dropdown |
| Scenic-spot factor | 1.12 – 0.92 | Per-spot retention and popularity weight |
| Season factor | Apr–Jun 1.08, Jul–Aug 1.12, Sep–Nov 1.05, otherwise 0.92 | Derived from the current month |
| Keyword bonus | Limited/limited edition/collaboration/out of print +0.08; new/unopened/intact packaging +0.03; defect/wear/signs of use −0.05 | Regex match against the user's notes |
| Supply-demand index | (0.85 + spot popularity ÷ 100 × 0.3) × weather factor | Spot popularity is a built-in constant |
| Weather factor | 0.84 – 1.03 | Weather-code factor × temperature factor, from live weather at the spot |

Alongside the price the engine outputs a price range (−12% to +15%), a listing price, a quick-sale price, a retention rate, a one-year projected value, a confidence level and a market trend. The floor price is 18 CNY.

The valuation is presented as a six-step animation: image recognition, feature extraction, weather fetch, sample matching, price prediction, confidence scoring.

## External APIs

`api-services.js` wraps three APIs. All are free and require no API key.

| API | Purpose | Cache |
| --- | --- | --- |
| Open-Meteo Forecast API | Live temperature, apparent temperature, humidity, wind, weather code and precipitation probability for 8 spots | 15 min |
| Open-Meteo Geocoding API | Place name to coordinates | 24 h |
| api.qrserver.com | Shareable QR code for a valuation result | none |

All requests go through `safeFetch()`, which applies an 8-second timeout and an `AbortController`. When the weather API fails, degraded data is returned (factors set to 1.0) so valuation is never blocked. Cache entries live in `localStorage` under the `zhijiabao-api-cache-` prefix, each with its own expiry.

Coordinates for the 8 spots are built into `SCENIC_COORDINATES`: the Palace Museum, West Lake, Mogao Caves, Mount Huangshan, Pingyao Ancient City, Wuyi Mountains, Giant Wild Goose Pagoda, Lijiang Old Town.

## Local Data Storage

All user data lives in browser `localStorage`; nothing is sent to a server.

| Key | Contents | Limit |
| --- | --- | --- |
| `zhijiabao-estimate-records` | Valuation history | 50 |
| `zhijiabao-search-history` | Comparison search history | 10 |
| `zhijiabao-user-products` | Listings created by the user | 30 |
| `zhijiabao-favorites` | Favorites | — |
| `zhijiabao-logged-in` | Sign-in state | — |

Reads and writes go through `safeStorage`, which degrades silently — no errors, no blank page — when `localStorage` is unavailable, such as in private browsing mode.

## Environment and Responsive Support

| Item | Notes |
| --- | --- |
| Language | Vanilla JavaScript (ES2018+), no framework, no bundler |
| Browsers | Any modern browser with `fetch`, `AbortController`, CSS custom properties and `IntersectionObserver` |
| Breakpoints | 720px / 480px / 360px |
| Mobile handling | Below 720px the home headline drops its per-character animation and shine layer to avoid horizontal overflow; tap targets are enlarged |
| Theme | Dark Chinese-style theme toggle, persisted to `localStorage` |
| Accessibility | Modals close on ESC with focus management; decorative elements are marked `aria-hidden` |

## Tests

```bash
node tests/smoke.mjs
```

`tests/smoke.mjs` covers the following:

| Check | What it verifies |
| --- | --- |
| Favicon | Every page links the shared SVG icon |
| Asset references | Every page references `styles.css`, `api-services.js` and `script.js`, each with a `?v=` cache-busting version |
| Version consistency | A shared asset may appear with only one version across the site |
| Mirror sync | Each outer page and its directory counterpart are identical apart from the relative path prefix |
| Image paths | Product and detail images resolve through `assetPath()` rather than hardcoded relative paths |
| Mobile styles | At the 720px breakpoint the headline is not clipped and produces no horizontal overflow |

The version-consistency and mirror-sync checks guard against a problem that actually occurred: the directory pages are copies of the outer pages, and 8 consecutive commits only touched the outer pages, so the weather module and QR sharing never took effect on the directory pages — which is precisely where the navigation links point.

## Note

The page footer states that this site is a competition demo prototype and that platform data, product information and valuation results are mock data, not a basis for real transactions.
