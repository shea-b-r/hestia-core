import { BaseApp } from "./baseApp.js";
import { registry } from "../registry.js";

class TvMiniChart extends BaseApp {
    async render(app) {
        const config = {
            symbol:          app.data.symbol       || "NASDAQ:AAPL",
            dateRange:       app.data.dateRange    || "12M",
            colorTheme:      app.data.colorTheme   || "dark",
            isTransparent:   app.data.isTransparent === "true",
            chartOnly:       app.data.chartOnly    === "true",
            noTimeScale:     app.data.noTimeScale  === "true",
            scalePosition:   app.data.scalePosition || "right",
            locale:          "en",
            autosize:        true,
            largeChartUrl:   "",
            width:           "100%",
            height:          "100%"
        };

        const url = `https://s.tradingview.com/embed-widget/mini-symbol-overview/#${encodeURIComponent(JSON.stringify(config))}`;

        return `
        <div class="tv-mini-chart-root">
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

registry.register('tv-mini-chart', TvMiniChart, {
    label: 'Mini Chart',
    category: 'data',
    defaultSize: { cols: 3, rows: 2 },
    settings: [
        {
            name: 'symbol',
            label: 'Symbol (e.g. NASDAQ:AAPL)',
            type: 'text'
        },
        {
            name: 'dateRange',
            label: 'Date Range',
            type: 'select',
            options: [
                { value: '1D',  label: '1 Day' },
                { value: '1M',  label: '1 Month' },
                { value: '3M',  label: '3 Months' },
                { value: '12M', label: '12 Months' },
                { value: '60M', label: '5 Years' },
                { value: 'ALL', label: 'All Time' }
            ]
        },
        {
            name: 'scalePosition',
            label: 'Price Scale',
            type: 'select',
            options: [
                { value: 'right', label: 'Right' },
                { value: 'left',  label: 'Left' },
                { value: 'no',    label: 'Hidden' }
            ]
        },
        {
            name: 'chartOnly',
            label: 'Chart Only (hide price/change)',
            type: 'select',
            options: [
                { value: 'false', label: 'No' },
                { value: 'true',  label: 'Yes' }
            ]
        },
        {
            name: 'noTimeScale',
            label: 'Time Axis',
            type: 'select',
            options: [
                { value: 'false', label: 'Show' },
                { value: 'true',  label: 'Hide' }
            ]
        },
        {
            name: 'isTransparent',
            label: 'Background',
            type: 'select',
            options: [
                { value: 'false', label: 'Filled' },
                { value: 'true',  label: 'Transparent' }
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
        .tv-mini-chart-root {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    `
});
