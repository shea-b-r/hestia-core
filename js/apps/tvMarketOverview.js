import { BaseApp } from "./baseApp.js";
import { registry } from "../registry.js";

class TvMarketOverview extends BaseApp {
    async render(app) {
        const config = {
            colorTheme:          app.data.colorTheme         || "dark",
            dateRange:           app.data.dateRange          || "12M",
            showChart:           app.data.showChart          !== "false",
            showSymbolLogo:      app.data.showSymbolLogo     !== "false",
            showFloatingTooltip: app.data.showFloatingTooltip === "true",
            isTransparent:       app.data.isTransparent      === "true",
            locale:              "en",
            largeChartUrl:       "",
            width:               "100%",
            height:              "100%",
            plotLineColorGrowing:          "rgba(41, 98, 255, 1)",
            plotLineColorFalling:          "rgba(41, 98, 255, 1)",
            gridLineColor:                 "rgba(240, 243, 250, 0)",
            scaleFontColor:                "rgba(120, 123, 134, 1)",
            belowLineFillColorGrowing:     "rgba(41, 98, 255, 0.12)",
            belowLineFillColorFalling:     "rgba(41, 98, 255, 0.12)",
            belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
            belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
            symbolActiveColor:             "rgba(41, 98, 255, 0.12)",
            tabs: [
                {
                    title: "Indices",
                    symbols: [
                        { s: "FOREXCOM:SPXUSD", d: "S&P 500 Index" },
                        { s: "FOREXCOM:NSXUSD", d: "US 100 Cash CFD" },
                        { s: "FOREXCOM:DJI",    d: "Dow Jones Index" },
                        { s: "INDEX:NKY",       d: "Nikkei 225" },
                        { s: "INDEX:DEU40",     d: "DAX Index" },
                        { s: "FOREXCOM:UKXGBP", d: "UK 100 Index" }
                    ]
                },
                {
                    title: "Futures",
                    symbols: [
                        { s: "CME_MINI:ES1!", d: "S&P 500" },
                        { s: "CME:6E1!",      d: "Euro" },
                        { s: "COMEX:GC1!",    d: "Gold" },
                        { s: "NYMEX:CL1!",    d: "WTI Crude Oil" },
                        { s: "NYMEX:NG1!",    d: "Gas" },
                        { s: "CBOT:ZC1!",     d: "Corn" }
                    ]
                },
                {
                    title: "Bonds",
                    symbols: [
                        { s: "CBOT:ZB1!",    d: "T-Bond" },
                        { s: "CBOT:UB1!",    d: "Ultra T-Bond" },
                        { s: "EUREX:FGBL1!", d: "Euro Bund" },
                        { s: "EUREX:FBTP1!", d: "Euro BTP" },
                        { s: "EUREX:FGBM1!", d: "Euro BOBL" }
                    ]
                },
                {
                    title: "Forex",
                    symbols: [
                        { s: "FX:EURUSD", d: "EUR/USD" },
                        { s: "FX:GBPUSD", d: "GBP/USD" },
                        { s: "FX:USDJPY", d: "USD/JPY" },
                        { s: "FX:USDCHF", d: "USD/CHF" },
                        { s: "FX:AUDUSD", d: "AUD/USD" },
                        { s: "FX:USDCAD", d: "USD/CAD" }
                    ]
                }
            ]
        };

        const url = `https://s.tradingview.com/embed-widget/market-overview/#${encodeURIComponent(JSON.stringify(config))}`;

        return `
        <div class="tv-market-overview-root">
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

registry.register('tv-market-overview', TvMarketOverview, {
    label: 'Market Overview',
    category: 'data',
    defaultSize: { cols: 3, rows: 4 },
    settings: [
        {
            name: 'dateRange',
            label: 'Date Range',
            type: 'select',
            options: [
                { value: '1D',  label: '1 Day' },
                { value: '5D',  label: '5 Days' },
                { value: '1M',  label: '1 Month' },
                { value: '3M',  label: '3 Months' },
                { value: '12M', label: '12 Months' },
                { value: '60M', label: '5 Years' }
            ]
        },
        {
            name: 'showChart',
            label: 'Sparklines',
            type: 'select',
            options: [
                { value: 'true',  label: 'Show' },
                { value: 'false', label: 'Hide' }
            ]
        },
        {
            name: 'showSymbolLogo',
            label: 'Symbol Logos',
            type: 'select',
            options: [
                { value: 'true',  label: 'Show' },
                { value: 'false', label: 'Hide' }
            ]
        },
        {
            name: 'showFloatingTooltip',
            label: 'Floating Tooltip',
            type: 'select',
            options: [
                { value: 'false', label: 'Off' },
                { value: 'true',  label: 'On' }
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
        .tv-market-overview-root {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
    `
});
