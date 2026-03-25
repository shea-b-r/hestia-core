import { BaseApp } from "./baseApp.js";
import { registry } from "../registry.js";

const delay = ms => new Promise(res => setTimeout(res, ms));

class StockTracker extends BaseApp {
    async render(app) {
        return `
        <div class="st-root">
          <div class="st-header">
            <span class="st-header-label">Portfolio</span>
            <span class="st-header-time"></span>
          </div>
          <div class="st-panel">
            <div class="st-loading">Loading...</div>
          </div>
        </div>`;
    }

    onMount(el, app) {
        this._intervals = [];

        const apiKey = app.data.apiKey?.trim();
        const panel = el.querySelector('.st-panel');

        if (!apiKey) {
            panel.innerHTML = '<div class="st-error">API key required. Configure in widget settings.</div>';
            return;
        }

        const fetchPortfolio = async () => {
            await this._fetchPortfolio(el, app, apiKey);
        };

        fetchPortfolio();
        this._intervals.push(setInterval(fetchPortfolio, 5 * 60 * 1000));
    }

    onDestroy(el, app) {
        if (this._intervals) {
            this._intervals.forEach(id => clearInterval(id));
            this._intervals = [];
        }
    }

    async _fetchPortfolio(el, app, apiKey) {
        const panel = el.querySelector('.st-panel');
        const mode = app.data.mode || 'list';

        if (mode === 'focus') {
            const sym = app.data.focusSymbol?.trim().toUpperCase();
            if (!sym) {
                panel.innerHTML = '<div class="st-error">No focus symbol configured.</div>';
                return;
            }
            await this._renderFocus(el, panel, sym, apiKey);
        } else {
            const rawSymbols = app.data.symbols?.trim();
            if (!rawSymbols) {
                panel.innerHTML = '<div class="st-error">No symbols configured.</div>';
                return;
            }
            const symbols = rawSymbols.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
            if (symbols.length === 0) {
                panel.innerHTML = '<div class="st-error">No symbols configured.</div>';
                return;
            }
            await this._renderList(el, panel, symbols, apiKey);
        }
    }

    async _renderList(el, panel, symbols, apiKey) {
        const results = [];

        for (let i = 0; i < symbols.length; i++) {
            if (i > 0) await delay(1200);
            const sym = symbols[i];
            try {
                const quote = await this._fetchQuote(sym, apiKey);
                if (!quote) { results.push({ sym, error: true }); continue; }
                const closes = await this._fetchDailySeries(sym, apiKey);
                results.push({ sym, quote, closes });
            } catch (e) {
                results.push({ sym, error: true });
            }
        }

        let html = '';
        for (const r of results) {
            if (r.error) {
                html += `
                <div class="st-row">
                    <span class="st-ticker">${r.sym}</span>
                    <span class="st-error st-err-inline">unavailable</span>
                </div>`;
                continue;
            }
            const { price, changePct } = r.quote;
            const dir = changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat';
            const arrow = changePct > 0 ? '▲' : changePct < 0 ? '▼' : '–';
            const sign = changePct > 0 ? '+' : '';
            const color = `var(--st-${dir})`;
            const sparkline = buildSparkline(r.closes, 72, 28, color);
            html += `
            <div class="st-row">
                <span class="st-ticker">${r.sym}</span>
                <span class="st-price">$${price.toFixed(2)}</span>
                <span class="st-badge st-badge-${dir}">${arrow} ${sign}${changePct.toFixed(2)}%</span>
                <span class="st-spark">${sparkline}</span>
            </div>`;
        }

        panel.innerHTML = html
            ? `<div class="st-list-grid">${html}</div>`
            : '<div class="st-error">No data available.</div>';

        const timeEl = el.querySelector('.st-header-time');
        if (timeEl) timeEl.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    async _renderFocus(el, panel, sym, apiKey) {
        try {
            const quote = await this._fetchQuote(sym, apiKey);
            if (!quote) {
                panel.innerHTML = '<div class="st-error">Fetch failed. Retrying in 5 min.</div>';
                return;
            }
            const closes = await this._fetchDailySeries(sym, apiKey);
            const { price, changePct } = quote;
            const dir = changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat';
            const arrow = changePct > 0 ? '▲' : changePct < 0 ? '▼' : '–';
            const sign = changePct > 0 ? '+' : '';
            const color = `var(--st-${dir})`;
            const sparkline = buildSparkline(closes, 160, 56, color);
            panel.innerHTML = `
            <div class="st-focus">
                <div class="st-focus-ticker">${sym}</div>
                <div class="st-focus-price">$${price.toFixed(2)}</div>
                <div class="st-focus-change" style="color:${color}">${arrow} ${sign}${changePct.toFixed(2)}%</div>
                <div class="st-focus-spark">${sparkline}</div>
            </div>`;

            const timeEl = el.querySelector('.st-header-time');
            if (timeEl) timeEl.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            panel.innerHTML = '<div class="st-error">Fetch failed. Retrying in 5 min.</div>';
        }
    }

    async _fetchQuote(sym, apiKey) {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data['Note'] || data['Information']) return null;
        const q = data['Global Quote'];
        if (!q || !q['05. price']) return null;
        const price = parseFloat(q['05. price']);
        const changePct = parseFloat(q['10. change percent']?.replace('%', '') || '0');
        return { price, changePct };
    }

    async _fetchDailySeries(sym, apiKey) {
        const today = new Date().toISOString().slice(0, 10);
        const cacheKey = `hestia_stock_daily_${sym.toUpperCase()}`;
        try {
            const cached = JSON.parse(localStorage.getItem(cacheKey));
            if (cached && cached.date === today) return cached.closes;
        } catch (e) { /* ignore */ }

        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${sym}&outputsize=compact&apikey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        if (data['Note'] || data['Information']) return [];
        const series = data['Time Series (Daily)'];
        if (!series) return [];

        const keys = Object.keys(series).sort((a, b) => b.localeCompare(a)).slice(0, 7);
        const closes = keys.map(k => parseFloat(series[k]['4. close'])).reverse();

        try {
            localStorage.setItem(cacheKey, JSON.stringify({ date: today, closes }));
        } catch (e) { /* ignore */ }

        return closes;
    }
}

function buildSparkline(closes, width, height, color) {
    if (!closes || closes.length === 0) {
        return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><polyline points="0,${height/2} ${width},${height/2}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    }
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const count = closes.length;
    const pad = 2;
    let points;
    if (min === max) {
        points = `0,${height/2} ${width},${height/2}`;
    } else {
        points = closes.map((v, i) => {
            const x = i * ((width - pad) / Math.max(count - 1, 1));
            const y = (height - pad) - ((v - min) / (max - min)) * (height - pad * 2) + pad;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    }
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

registry.register('stock-tracker', StockTracker, {
    label: 'Stock Tracker',
    category: 'data',
    defaultSize: { cols: 4, rows: 2 },
    settings: [
        { name: 'apiKey',      label: 'Alpha Vantage API Key', type: 'text' },
        { name: 'symbols',     label: 'Symbols (comma-separated)', type: 'text' },
        { name: 'mode',        label: 'Mode', type: 'select',
          options: [{ value: 'list', label: 'List' }, { value: 'focus', label: 'Focus' }] },
        { name: 'focusSymbol', label: 'Focus Symbol (focus mode only)', type: 'text' }
    ],
    css: `
        .st-root {
            display: flex; flex-direction: column; height: 100%;
            box-sizing: border-box; overflow: hidden;
            --st-up:   var(--status-success, #00c853);
            --st-down: var(--status-error,   #d50000);
            --st-flat: var(--text-secondary,  #888);
        }
        .st-header {
            display: flex; justify-content: space-between; align-items: baseline;
            padding: 7px 10px 5px;
            border-bottom: 1px solid var(--border-dim, rgba(255,255,255,0.07));
            flex-shrink: 0;
        }
        .st-header-label {
            font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em;
            text-transform: uppercase; color: var(--text-secondary, #888);
        }
        .st-header-time {
            font-size: 0.65rem; color: var(--text-secondary, #888); opacity: 0.6;
        }
        .st-panel { flex: 1; overflow-y: auto; padding: 4px 6px; }
        .st-loading { color: var(--text-secondary, #888); font-size: 0.8rem; padding: 6px 4px; }
        .st-error   { color: var(--st-down); font-size: 0.78rem; padding: 6px 4px; }
        .st-err-inline { font-size: 0.72rem; opacity: 0.7; }

        .st-list-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 0 12px;
            align-content: start;
        }
        .st-row {
            display: flex; align-items: center; gap: 8px;
            padding: 5px 4px;
            border-bottom: 1px solid var(--border-dim, rgba(255,255,255,0.05));
            font-size: 0.82rem; min-width: 0;
        }
        .st-row:last-child { border-bottom: none; }
        .st-ticker {
            font-family: monospace; font-weight: 600; font-size: 0.8rem;
            color: var(--brand-primary, #fff);
            min-width: 48px; letter-spacing: 0.03em;
        }
        .st-price {
            font-variant-numeric: tabular-nums;
            color: var(--text-main, #ddd);
            min-width: 60px;
        }
        .st-badge {
            font-size: 0.72rem; font-weight: 500;
            padding: 1px 6px; border-radius: 3px;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
        }
        .st-badge-up   { color: var(--st-up);   background: rgba(0,200,83,0.12);  }
        .st-badge-down { color: var(--st-down); background: rgba(213,0,0,0.12);   }
        .st-badge-flat { color: var(--st-flat); background: rgba(136,136,136,0.1); }
        .st-spark { margin-left: auto; flex-shrink: 0; display: flex; align-items: center; }

        .st-focus {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            height: 100%; gap: 6px; padding: 8px;
        }
        .st-focus-ticker {
            font-size: 1.1rem; font-family: monospace; font-weight: 700;
            letter-spacing: 0.1em; color: var(--brand-primary, #fff);
        }
        .st-focus-price {
            font-size: 2rem; font-weight: 300;
            font-variant-numeric: tabular-nums;
            color: var(--text-main, #ddd);
            line-height: 1;
        }
        .st-focus-change { font-size: 0.95rem; font-weight: 500; }
        .st-focus-spark  { margin-top: 4px; opacity: 0.9; }
    `
});
