// js/apps/upsStatus.js
import { BaseApp } from "./baseApp.js";
import { registry } from "../registry.js";

class UpsStatus extends BaseApp {
    async render(app) {
        return `
            <div class="ups-root">
                <span class="ups-status" id="ups-status">--</span>
                <span class="ups-divider">|</span>
                <span class="ups-field">
                    <span class="ups-label">BATT</span>
                    <span class="ups-value" id="ups-batt">--</span>
                </span>
                <span class="ups-divider">|</span>
                <span class="ups-field">
                    <span class="ups-label">LOAD</span>
                    <span class="ups-value" id="ups-load">--</span>
                </span>
                <span class="ups-divider">|</span>
                <span class="ups-field">
                    <span class="ups-label">VAC</span>
                    <span class="ups-value" id="ups-vac">--</span>
                </span>
            </div>
        `;
    }

    onMount(el, app) {
        const host = app.data.host;
        const apiKey = app.data.apiKey;

        if (!host) {
            el.querySelector('.ups-root').innerHTML = '<span class="ups-error">Host required</span>';
            return;
        }
        if (!apiKey) {
            el.querySelector('.ups-root').innerHTML = '<span class="ups-error">API key required</span>';
            return;
        }

        const statusMap = {
            'OL':      { text: 'ONLINE',   color: 'var(--status-success, #00c853)' },
            'OB':      { text: 'ON BATT',  color: 'var(--status-warning, #ffd600)' },
            'LB':      { text: 'LOW BATT', color: 'var(--status-error, #d50000)' },
            'OL CHRG': { text: 'CHARGING', color: 'var(--status-success, #00c853)' },
            'FSD':     { text: 'SHUTDOWN', color: 'var(--status-error, #d50000)' },
        };

        const update = async () => {
            const statusEl = el.querySelector('#ups-status');
            const battEl   = el.querySelector('#ups-batt');
            const loadEl   = el.querySelector('#ups-load');
            const vacEl    = el.querySelector('#ups-vac');

            if (!statusEl) return;

            let res, data;
            try {
                res = await fetch(`http://${host}/api/v2.0/ups/ups_status`, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
            } catch (_) {
                statusEl.textContent = 'OFFLINE';
                statusEl.style.color = 'var(--status-error, #d50000)';
                return;
            }

            if (!res.ok) {
                statusEl.textContent = `ERR ${res.status}`;
                statusEl.style.color = 'var(--status-error, #d50000)';
                return;
            }

            data = await res.json();

            // STATUS
            const rawStatus = data['ups.status'] ?? '--';
            const mapped = statusMap[rawStatus];
            if (mapped) {
                statusEl.textContent = mapped.text;
                statusEl.style.color = mapped.color;
            } else {
                statusEl.textContent = rawStatus;
                statusEl.style.color = 'var(--text-primary, #fff)';
            }

            // BATT
            const rawBatt = data['battery.charge'] ?? null;
            if (rawBatt !== null) {
                const batt = parseFloat(rawBatt);
                battEl.textContent = isNaN(batt) ? '--' : batt.toFixed(0) + '%';
                if (!isNaN(batt)) {
                    battEl.style.color = batt >= 80
                        ? 'var(--status-success, #00c853)'
                        : batt >= 40
                            ? 'var(--status-warning, #ffd600)'
                            : 'var(--status-error, #d50000)';
                }
            } else {
                battEl.textContent = '--';
            }

            // LOAD
            const rawLoad = data['ups.load'] ?? null;
            if (rawLoad !== null) {
                const load = parseFloat(rawLoad);
                loadEl.textContent = isNaN(load) ? '--' : load.toFixed(0) + '%';
            } else {
                loadEl.textContent = '--';
            }

            // VAC
            const rawVac = data['input.voltage'] ?? null;
            if (rawVac !== null) {
                const vac = parseFloat(rawVac);
                vacEl.textContent = isNaN(vac) ? '--' : vac.toFixed(1) + 'V';
            } else {
                vacEl.textContent = '--';
            }
        };

        update();
        this._interval = setInterval(update, 60000);
    }

    onDestroy(el, app) {
        clearInterval(this._interval);
    }
}

registry.register('ups-status', UpsStatus, {
    label: 'UPS Status',
    category: 'homelab',
    defaultSize: { cols: 2, rows: 1 },
    settings: [
        { name: 'host',   label: 'TrueNAS Host (IP or hostname)', type: 'text' },
        { name: 'apiKey', label: 'TrueNAS API Key',               type: 'text' }
    ],
    css: `
        .ups-root {
            display: flex;
            align-items: center;
            justify-content: space-around;
            height: 100%;
            padding: 0 8px;
            font-family: monospace;
            font-size: 0.8rem;
            gap: 6px;
            box-sizing: border-box;
        }
        .ups-status {
            font-weight: bold;
            font-size: 0.75rem;
            letter-spacing: 0.04em;
        }
        .ups-divider {
            color: var(--border-color, #444);
        }
        .ups-field {
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1.2;
        }
        .ups-label {
            font-size: 0.6rem;
            color: var(--text-secondary, #888);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .ups-value {
            color: var(--text-primary, #fff);
        }
        .ups-error {
            color: var(--status-error, #d50000);
            font-size: 0.7rem;
            text-align: center;
            width: 100%;
        }
    `
});
