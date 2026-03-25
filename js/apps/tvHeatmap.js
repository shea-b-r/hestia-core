import { BaseApp } from "./baseApp.js";
import { registry } from "../registry.js";

class TvHeatmap extends BaseApp {
    async render(app) {
        const config = {
            dataSource:       app.data.dataSource  || "SPX500",
            exchange:         app.data.exchange    || "US",
            grouping:         app.data.grouping    || "sector",
            blockSize:        app.data.blockSize   || "market_cap_basic",
            blockColor:       app.data.blockColor  || "change",
            colorTheme:       app.data.colorTheme  || "dark",
            hasTopBar:        false,
            isDataSetEnabled: false,
            isZoomEnabled:    true,
            hasSymbolTooltip: true,
            isMonoSize:       false,
            width:            "100%",
            height:           "100%"
        };

        const url = `https://s.tradingview.com/embed-widget/stock-heatmap/#${encodeURIComponent(JSON.stringify(config))}`;

        return `
        <div class="tv-heatmap-root">
            <iframe
                src="${url}"
                style="width:100%;height:100%;border:none;display:block;"
                allowtransparency="true"
                frameborder="0"
                scrolling="no">
            </iframe>
        </div>`;
    }

    onMount(el, app) {}

    onDestroy(el, app) {}
}

registry.register('tv-heatmap', TvHeatmap, {
    label: 'Stock Heatmap',
    category: 'data',
    defaultSize: { cols: 6, rows: 4 },
    settings: [
        {
            name: 'dataSource',
            label: 'Data Source',
            type: 'select',
            options: [
                { value: 'SPX500',    label: 'S&P 500' },
                { value: 'NASDAQ100', label: 'Nasdaq 100' },
                { value: 'DJ30',      label: 'Dow Jones 30' },
                { value: 'AllUSA',    label: 'All US Stocks' }
            ]
        },
        {
            name: 'grouping',
            label: 'Grouping',
            type: 'select',
            options: [
                { value: 'sector',   label: 'By Sector' },
                { value: 'no_group', label: 'No Grouping' }
            ]
        },
        {
            name: 'blockSize',
            label: 'Tile Size By',
            type: 'select',
            options: [
                { value: 'market_cap_basic',        label: 'Market Cap' },
                { value: 'volume',                  label: 'Volume' },
                { value: 'relative_volume_10d_calc', label: 'Relative Volume' }
            ]
        },
        {
            name: 'blockColor',
            label: 'Tile Color By',
            type: 'select',
            options: [
                { value: 'change',   label: 'Day Change %' },
                { value: 'Perf.W',   label: 'Weekly' },
                { value: 'Perf.1M',  label: 'Monthly' },
                { value: 'Perf.YTD', label: 'YTD' }
            ]
        },
        {
            name: 'colorTheme',
            label: 'Theme',
            type: 'select',
            options: [
                { value: 'dark',  label: 'Dark' },
                { value: 'light', label: 'Light' }
            ]
        }
    ],
    css: `
        .tv-heatmap-root {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    `
});
