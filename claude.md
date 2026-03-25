\# TradingView Stock Heatmap Widget — Claude Code Spec



\## 1. Objective



Build a single-file ES Module widget `js/apps/tvHeatmap.js` for the hestia-core

dashboard that embeds the TradingView Stock Heatmap as an iframe. The widget

constructs the TradingView embed URL dynamically from user-configured settings

and renders it inside a `BaseApp` subclass. No API key required. No data

fetching. One line must be added to `js/apps/appIndex.js` to import the new

file.



\---



\## 2. Files to create / modify



| Action | Path |

|--------|------|

| Create | `js/apps/tvHeatmap.js` |

| Modify | `js/apps/appIndex.js` — append `import './tvHeatmap.js';` |



\---



\## 3. Tech constraints



\- Vanilla ES Module only. No npm, no bundler, no external libraries.

\- No data fetching of any kind — TradingView handles all data internally via

&#x20; the iframe.

\- `onMount()` is used only for tab/resize logic if needed — no intervals, no

&#x20; polling, no localStorage usage.

\- All colors must use CSS custom properties with hex fallbacks.

\- No `<script>` tags injected into the DOM. The TradingView widget loads

&#x20; entirely via the iframe src URL.

\- The iframe must fill 100% of the widget container's width and height.



\---



\## 4. Implementation spec



\### 4.1 Class structure



```js

import { BaseApp } from "./baseApp.js";

import { registry } from "../registry.js";



class TvHeatmap extends BaseApp {

&#x20;   async render(app) { ... }   // builds iframe URL from app.data, returns HTML

&#x20;   onMount(el, app) { ... }    // no-op or minimal resize handling only

&#x20;   onDestroy(el, app) { ... }  // no-op — nothing to clean up

}

```



\---



\### 4.2 iframe URL construction



Base URL:

```

https://s.tradingview.com/embed-widget/stock-heatmap/

```



Append a JSON config object as a URL-encoded query parameter named `locale` is

NOT used — instead the full config is passed as a URL fragment (hash). Use the

following exact format:



```

https://s.tradingview.com/embed-widget/stock-heatmap/#{"dataSource":"...","exchange":"...","grouping":"...","blockSize":"...","blockColor":"...","colorTheme":"...","hasTopBar":false,"isDataSetEnabled":false,"isZoomEnabled":true,"hasSymbolTooltip":true,"isMonoSize":false,"width":"100%","height":"100%"}

```



Build the config object in `render()` from `app.data` values, then append as

`encodeURIComponent(JSON.stringify(config))` to the base URL as the hash:



```js

const config = {

&#x20;   dataSource:       app.data.dataSource    || "SPX500",

&#x20;   exchange:         app.data.exchange      || "US",

&#x20;   grouping:         app.data.grouping      || "sector",

&#x20;   blockSize:        app.data.blockSize     || "market\_cap\_basic",

&#x20;   blockColor:       app.data.blockColor    || "change",

&#x20;   colorTheme:       app.data.colorTheme    || "dark",

&#x20;   hasTopBar:        false,

&#x20;   isDataSetEnabled: false,

&#x20;   isZoomEnabled:    true,

&#x20;   hasSymbolTooltip: true,

&#x20;   isMonoSize:       false,

&#x20;   width:            "100%",

&#x20;   height:           "100%"

};

const url = `https://s.tradingview.com/embed-widget/stock-heatmap/#${encodeURIComponent(JSON.stringify(config))}`;

```



\---



\### 4.3 render() output



```js

async render(app) {

&#x20;   // build url as above

&#x20;   return `

&#x20;       <div class="tv-heatmap-root">

&#x20;           <iframe

&#x20;               src="${url}"

&#x20;               style="width:100%;height:100%;border:none;display:block;"

&#x20;               allowtransparency="true"

&#x20;               frameborder="0"

&#x20;               scrolling="no">

&#x20;           </iframe>

&#x20;       </div>

&#x20;   `;

}

```



\---



\### 4.4 Settings schema values



Valid values for each setting — use these exactly as the `options` arrays in

`registry.register()`:



\*\*dataSource\*\*

\- `"SPX500"` → S\&P 500

\- `"SandP500"` → S\&P 500 (alternate)

\- `"AllUSA"` → All US Stocks

\- `"NASDAQ100"` → Nasdaq 100

\- `"DJ30"` → Dow Jones 30



\*\*exchange\*\* (used when dataSource is not an index)

\- `"US"`, `"LSE"`, `"TSX"`, `"ASX"`



\*\*grouping\*\*

\- `"sector"` → By Sector

\- `"no\_group"` → No Grouping



\*\*blockSize\*\* (what determines tile size)

\- `"market\_cap\_basic"` → Market Cap

\- `"volume"` → Volume

\- `"relative\_volume\_10d\_calc"` → Relative Volume



\*\*blockColor\*\* (what determines tile color)

\- `"change"` → Day Change %

\- `"Perf.W"` → Weekly Performance

\- `"Perf.1M"` → Monthly Performance

\- `"Perf.YTD"` → YTD Performance



\*\*colorTheme\*\*

\- `"dark"` → Dark

\- `"light"` → Light



\---



\### 4.5 Registry registration



```js

registry.register('tv-heatmap', TvHeatmap, {

&#x20;   label: 'Stock Heatmap',

&#x20;   category: 'data',

&#x20;   defaultSize: { cols: 6, rows: 4 },

&#x20;   settings: \[

&#x20;       {

&#x20;           name: 'dataSource',

&#x20;           label: 'Data Source',

&#x20;           type: 'select',

&#x20;           options: \[

&#x20;               { value: 'SPX500',    label: 'S\&P 500' },

&#x20;               { value: 'NASDAQ100', label: 'Nasdaq 100' },

&#x20;               { value: 'DJ30',      label: 'Dow Jones 30' },

&#x20;               { value: 'AllUSA',    label: 'All US Stocks' }

&#x20;           ]

&#x20;       },

&#x20;       {

&#x20;           name: 'grouping',

&#x20;           label: 'Grouping',

&#x20;           type: 'select',

&#x20;           options: \[

&#x20;               { value: 'sector',   label: 'By Sector' },

&#x20;               { value: 'no\_group', label: 'No Grouping' }

&#x20;           ]

&#x20;       },

&#x20;       {

&#x20;           name: 'blockSize',

&#x20;           label: 'Tile Size By',

&#x20;           type: 'select',

&#x20;           options: \[

&#x20;               { value: 'market\_cap\_basic',        label: 'Market Cap' },

&#x20;               { value: 'volume',                  label: 'Volume' },

&#x20;               { value: 'relative\_volume\_10d\_calc', label: 'Relative Volume' }

&#x20;           ]

&#x20;       },

&#x20;       {

&#x20;           name: 'blockColor',

&#x20;           label: 'Tile Color By',

&#x20;           type: 'select',

&#x20;           options: \[

&#x20;               { value: 'change',   label: 'Day Change %' },

&#x20;               { value: 'Perf.W',   label: 'Weekly' },

&#x20;               { value: 'Perf.1M',  label: 'Monthly' },

&#x20;               { value: 'Perf.YTD', label: 'YTD' }

&#x20;           ]

&#x20;       },

&#x20;       {

&#x20;           name: 'colorTheme',

&#x20;           label: 'Theme',

&#x20;           type: 'select',

&#x20;           options: \[

&#x20;               { value: 'dark',  label: 'Dark' },

&#x20;               { value: 'light', label: 'Light' }

&#x20;           ]

&#x20;       }

&#x20;   ],

&#x20;   css: `

&#x20;       .tv-heatmap-root {

&#x20;           width: 100%;

&#x20;           height: 100%;

&#x20;           overflow: hidden;

&#x20;       }

&#x20;   `

});

```



\---



\## 5. Edge cases



| Condition | Behavior |

|-----------|----------|

| Any `app.data` setting is missing or undefined | Fall back to the default values defined in the config object in §4.2. Never pass `undefined` into the URL. |

| iframe fails to load (network offline, TV outage) | Browser renders iframe's native fallback — no custom handling required. Do not attempt to detect or handle iframe load failure in JS. |

| Widget resized by user | iframe fills 100% of container via CSS — no JS resize handling needed. |

| `colorTheme` not matching Hestia's current theme | Acceptable — user controls this explicitly via the setting. Do not attempt to auto-detect Hestia's active theme. |



\---



\## 6. Acceptance criteria



\- \[ ] Widget appears in the Hestia widget picker under category "data" with label "Stock Heatmap"

\- \[ ] Default size is `cols: 6, rows: 4`

\- \[ ] On add, widget immediately renders the TradingView heatmap iframe with default settings (SPX500, sector grouping, market cap size, day change color, dark theme)

\- \[ ] iframe fills 100% of the widget container width and height with no scrollbars or border

\- \[ ] Changing any setting in the widget config panel causes the iframe to re-render with the updated URL

\- \[ ] No console errors on load

\- \[ ] No fetch/XHR calls originate from `tvHeatmap.js` — verified via DevTools Network tab

\- \[ ] `import './tvHeatmap.js';` is present in `js/apps/appIndex.js`

\- \[ ] `onDestroy()` executes without errors (even as a no-op)

