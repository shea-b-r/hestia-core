import { BaseApp } from "./baseApp.js";
import { registry } from "../registry.js";

const parseSymbols = str => str.split(',').map(s => s.trim()).filter(s => s);

class TvMarketSummary extends BaseApp {
    async render(app) {
        const mode        = app.data.mode       || "market-movers";
        const layoutMode  = app.data.layoutMode || "flow";
        const direction   = app.data.direction  || "horizontal";
        const itemSize    = app.data.itemSize    || "normal";
        const timeFrame   = app.data.timeFrame   || "1D";
        const theme       = app.data.theme       || "dark";
        const assetsType  = app.data.assetsType  || "stocks";
        const exchange    = app.data.exchange    || "US";

        const boolAttr = (key, def = false) =>
            (app.data[key] === undefined ? def : app.data[key] === "true") ? `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}` : '';

        // Build symbol-sectors JSON for custom mode
        let symbolSectorsAttr = '';
        if (mode === 'custom') {
            const stocks  = parseSymbols(app.data.stockSymbols  || "NASDAQ:AAPL,NASDAQ:ADBE,NASDAQ:NVDA,NASDAQ:TSLA");
            const crypto  = parseSymbols(app.data.cryptoSymbols || "BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CRYPTO:XRPUSD");
            const indices = parseSymbols(app.data.indexSymbols  || "FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FOREXCOM:UKXGBP");

            const sectors = [];
            if (stocks.length)  sectors.push({ sectionName: "Stocks",  symbols: stocks });
            if (crypto.length)  sectors.push({ sectionName: "Crypto",  symbols: crypto });
            if (indices.length) sectors.push({ sectionName: "Indices", symbols: indices });

            symbolSectorsAttr = `symbol-sectors='${JSON.stringify(sectors)}'`;
        }

        const showTimeRange     = app.data.showTimeRange    === "true"  ? 'show-time-range'    : '';
        const hideMarketStatus  = app.data.hideMarketStatus === "true"  ? 'hide-market-status' : '';
        const transparent       = app.data.transparent      === "true"  ? 'transparent'        : '';

        return `
        <div class="tv-market-summary-root">
            <tv-market-summary
                mode="${mode}"
                layout-mode="${layoutMode}"
                direction="${direction}"
                item-size="${itemSize}"
                time-frame="${timeFrame}"
                theme="${theme}"
                assets-type="${assetsType}"
                exchange="${exchange}"
                ${symbolSectorsAttr}
                ${showTimeRange}
                ${hideMarketStatus}
                ${transparent}>
            </tv-market-summary>
        </div>`;
    }

    onMount(el, app) {
        const scriptId = 'tv-market-summary-script';
        if (!document.getElementById(scriptId)) {
            const script  = document.createElement('script');
            script.id     = scriptId;
            script.type   = 'module';
            script.src    = 'https://widgets.tradingview-widget.com/w/en/tv-market-summary.js';
            document.head.appendChild(script);
        }
    }

    onDestroy(el, app) {}
}

registry.register('tv-market-summary', TvMarketSummary, {
    label: 'Market Summary',
    category: 'data',
    defaultSize: { cols: 6, rows: 2 },
    settings: [
        {
            name: 'mode',
            label: 'Mode',
            type: 'select',
            options: [
                { value: 'market-movers', label: 'Market Movers (auto)' },
                { value: 'custom',        label: 'Custom Symbols' }
            ]
        },
        {
            name: 'assetsType',
            label: 'Asset Type (Market Movers only)',
            type: 'select',
            options: [
                { value: 'stocks', label: 'Stocks' },
                { value: 'crypto', label: 'Crypto' }
            ]
        },
        {
            name: 'exchange',
            label: 'Exchange (Market Movers + Stocks only)',
            type: 'text'
        },
        {
            name: 'stockSymbols',
            label: 'Stocks (Custom mode, comma-separated)',
            type: 'text'
        },
        {
            name: 'cryptoSymbols',
            label: 'Crypto (Custom mode, comma-separated)',
            type: 'text'
        },
        {
            name: 'indexSymbols',
            label: 'Indices (Custom mode, comma-separated)',
            type: 'text'
        },
        {
            name: 'layoutMode',
            label: 'Layout Mode',
            type: 'select',
            options: [
                { value: 'flow', label: 'Flow' },
                { value: 'grid', label: 'Grid' }
            ]
        },
        {
            name: 'direction',
            label: 'Direction (Flow layout only)',
            type: 'select',
            options: [
                { value: 'horizontal', label: 'Horizontal' },
                { value: 'vertical',   label: 'Vertical' }
            ]
        },
        {
            name: 'itemSize',
            label: 'Item Size',
            type: 'select',
            options: [
                { value: 'normal',  label: 'Normal' },
                { value: 'compact', label: 'Compact' }
            ]
        },
        {
            name: 'timeFrame',
            label: 'Time Frame',
            type: 'select',
            options: [
                { value: '1D',  label: '1 Day' },
                { value: '1W',  label: '1 Week' },
                { value: '1M',  label: '1 Month' },
                { value: '3M',  label: '3 Months' },
                { value: '12M', label: '12 Months' }
            ]
        },
        {
            name: 'showTimeRange',
            label: 'Show Time Range Selector',
            type: 'select',
            options: [
                { value: 'false', label: 'No' },
                { value: 'true',  label: 'Yes' }
            ]
        },
        {
            name: 'hideMarketStatus',
            label: 'Market Status',
            type: 'select',
            options: [
                { value: 'false', label: 'Show' },
                { value: 'true',  label: 'Hide' }
            ]
        },
        {
            name: 'transparent',
            label: 'Background',
            type: 'select',
            options: [
                { value: 'false', label: 'Filled' },
                { value: 'true',  label: 'Transparent' }
            ]
        },
        {
            name: 'theme',
            label: 'Theme',
            type: 'select',
            options: [
                { value: 'dark',  label: 'Dark' },
                { value: 'light', label: 'Light' }
            ]
        }
    ],
    css: `
        .tv-market-summary-root {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .tv-market-summary-root tv-market-summary {
            display: block;
            width: 100%;
            height: 100%;
        }
    `
});
