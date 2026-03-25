import { BaseApp } from "./baseApp.js";
import { registry } from "../registry.js";

class StockHeatmap extends BaseApp {
    async render(app) {
        return `<div class="shm-root"><div class="shm-container"></div></div>`;
    }

    onMount(el, app) {
        const container = el.querySelector('.shm-container');

        const dataSource  = app.data.dataSource  || 'SPX500';
        const grouping    = app.data.grouping     || 'sector';
        const blockSize   = app.data.blockSize    || 'market_cap_basic';
        const blockColor  = app.data.blockColor   || 'change';
        const colorTheme  = app.data.colorTheme   || 'dark';

        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container__widget';
        widgetDiv.style.cssText = 'width:100%;height:100%;';
        container.appendChild(widgetDiv);

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
        script.async = true;
        script.textContent = JSON.stringify({
            exchanges: [],
            dataSource,
            grouping,
            blockSize,
            blockColor,
            locale: 'en',
            symbolUrl: '',
            colorTheme,
            hasTopBar: false,
            isDataSetEnabled: false,
            isZoomEnabled: true,
            hasSymbolTooltip: true,
            isMonoSize: false,
            width: '100%',
            height: '100%'
        });
        container.appendChild(script);

        this._container = container;
    }

    onDestroy(el, app) {
        if (this._container) {
            this._container.innerHTML = '';
        }
    }
}

registry.register('stock-heatmap', StockHeatmap, {
    label: 'Stock Heatmap',
    category: 'data',
    defaultSize: { cols: 4, rows: 3 },
    settings: [
        {
            name: 'dataSource', label: 'Data Source', type: 'select',
            options: [
                { value: 'SPX500',      label: 'S&P 500' },
                { value: 'DJ30',        label: 'Dow Jones 30' },
                { value: 'NASDAQ100',   label: 'NASDAQ 100' },
                { value: 'AllUSA',      label: 'All US' },
                { value: 'crypto',      label: 'Crypto' }
            ]
        },
        {
            name: 'grouping', label: 'Group By', type: 'select',
            options: [
                { value: 'sector',   label: 'Sector' },
                { value: 'no_group', label: 'None' }
            ]
        },
        {
            name: 'blockSize', label: 'Block Size', type: 'select',
            options: [
                { value: 'market_cap_basic', label: 'Market Cap' },
                { value: 'volume',           label: 'Volume' },
                { value: 'equal',            label: 'Equal' }
            ]
        },
        {
            name: 'blockColor', label: 'Color By', type: 'select',
            options: [
                { value: 'change',            label: 'Change %' },
                { value: 'change_from_open',  label: 'Change from Open' },
                { value: 'gap',               label: 'Gap %' }
            ]
        },
        {
            name: 'colorTheme', label: 'Theme', type: 'select',
            options: [
                { value: 'dark',  label: 'Dark' },
                { value: 'light', label: 'Light' }
            ]
        }
    ],
    css: `
        .shm-root {
            width: 100%; height: 100%;
            overflow: hidden;
        }
        .shm-container {
            width: 100%; height: 100%;
            display: flex; flex-direction: column;
        }
        .shm-container .tradingview-widget-container__widget {
            flex: 1; min-height: 0;
        }
    `
});
