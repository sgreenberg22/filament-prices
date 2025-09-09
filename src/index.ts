// src/index.ts
export interface Env {
  PRICES: KVNamespace;
  UPDATE_TOKEN?: string;
}

type Row = {
  brand: string;
  material: string;
  product: string;
  url: string;
  weightKg: number;
  price?: number; // USD
  currency?: string; // e.g., USD
  scrapedAt?: string; // ISO
  abrasive?: boolean;
};

type Snapshot = {
  updatedAt: string; // ISO
  rows: Row[];
};

import { PRODUCTS } from "./products";

const UA =
  "Mozilla/5.0 (compatible; P1SPriceTracker/1.0; +https://example.invalid)";

async function extractPriceFromHTML(html: string): Promise<{ price?: number; currency?: string }> {
  // Prefer JSON-LD Product / Offer blocks
  const ldjsonMatches = [...html.matchAll(/<script[^>]*type=\"application\/ld\+json\"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldjsonMatches) {
    try {
      const raw = m[1].trim();
      // Handle multiple concatenated JSON objects/arrays
      const parsed = JSON.parse(raw);
      const items: any[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const it of items) {
        const candidates = collectOfferCandidates(it);
        for (const c of candidates) {
          const p = normalizePrice(c);
          if (p.price) return p;
        }
      }
    } catch {}
  }
  // Meta tags commonly used by Shopify/etc.
  const meta = (name: string) => {
    const re = new RegExp(`<meta[^>]+(?:property|name)=\"${name}\"[^>]+content=\"([^\"]+)\"[^>]*>`, "i");
    const mm = html.match(re);
    return mm?.[1];
  };
  const metaPrice = meta("product:price:amount") || meta("og:price:amount") || meta("twitter:data1");
  const metaCurrency = meta("product:price:currency") || meta("og:price:currency");
  if (metaPrice) {
    const price = Number(metaPrice.replace(/[^0-9.]/g, ""));
    return { price: isFinite(price) ? price : undefined, currency: metaCurrency || "USD" };
  }
  // Heuristic fallback: find $xx.xx near the word price
  const near = html.match(/price[^\n\r]{0,100}?\$\s*([0-9]+(?:\.[0-9]{2})?)/i);
  if (near) return { price: Number(near[1]), currency: "USD" };
  return {};
}

function collectOfferCandidates(node: any): any[] {
  const out: any[] = [];
  const visit = (n: any) => {
    if (!n || typeof n !== "object") return;
    if (n["@type"] && String(n["@type"]).toLowerCase().includes("product")) {
      if (n.offers) out.push(n.offers);
    }
    if (n.price || n.priceCurrency) out.push(n);
    for (const k of Object.keys(n)) visit(n[k]);
  };
  visit(node);
  return out.flat();
}

function normalizePrice(x: any): { price?: number; currency?: string } {
  if (!x) return {};
  const price = Number(x.price || x["priceSpecification"]?.price || x["priceAmount"]);
  const currency = x.priceCurrency || x.currency || x["priceSpecification"]?.priceCurrency || "USD";
  if (isFinite(price)) return { price, currency };
  return {};
}

async function fetchOne(p: Row): Promise<Row> {
  try {
    const res = await fetch(p.url, { headers: { "User-Agent": UA } });
    const html = await res.text();
    const { price, currency } = await extractPriceFromHTML(html);
    return { ...p, price, currency, scrapedAt: new Date().toISOString() };
  } catch (e) {
    return { ...p, scrapedAt: new Date().toISOString() };
  }
}

async function scrapeAll(): Promise<Snapshot> {
  const rows = await Promise.all(PRODUCTS.map((prod) => fetchOne(prod)));
  return { updatedAt: new Date().toISOString(), rows };
}

async function getSnapshot(env: Env): Promise<Snapshot | null> {
  const json = await env.PRICES.get("latest");
  return json ? (JSON.parse(json) as Snapshot) : null;
}

async function putSnapshot(env: Env, snap: Snapshot) {
  await env.PRICES.put("latest", JSON.stringify(snap), { expirationTtl: 60 * 60 * 24 * 7 }); // 7d ttl
}

function htmlPage(): string {
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>P1S Filament Price Tracker</title>
<style>
  :root { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
  body { margin: 24px; }
  header { display:flex; gap:16px; align-items: baseline; flex-wrap: wrap; }
  h1 { font-size: 1.4rem; margin: 0 12px 0 0; }
  .meta { color:#555; }
  .controls { display:flex; gap:8px; flex-wrap: wrap; margin: 12px 0; }
  input, select, button { padding: 8px 10px; border: 1px solid #ccc; border-radius: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
  th { position: sticky; top:0; background:#fff; }
  .tag { padding: 2px 8px; border-radius: 999px; background: #f4f4f5; font-size: 12px; }
  .warn { color: #b45309; }
</style>
<header>
  <h1>P1S Filament Price Tracker</h1>
  <span class="meta" id="updated"></span>
</header>
<div class="controls">
  <label>Filter material:
    <select id="mat">
      <option value="">All</option>
      <option>PLA</option><option>PETG</option><option>ABS</option><option>ASA</option>
      <option>TPU</option><option>PC</option><option>PA</option><option>PVA</option>
      <option>PETG-CF</option><option>PLA-CF</option><option>PA-CF</option><option>ASA-CF</option>
    </select>
  </label>
  <input id="q" placeholder="Search brand/product..."/>
  <button id="refresh">Refresh</button>
</div>
<table>
  <thead>
    <tr>
      <th>Brand</th><th>Material</th><th>Product</th><th>Price</th><th>$ / kg</th><th>Source</th>
    </tr>
  </thead>
  <tbody id="rows"></tbody>
</table>
<p class="warn">Abrasive filaments (CF/GF/metal/glow) can wear stainless nozzles/extruders on a P1S. Use hardened components and appropriate profiles.</p>
<script>
async function load(run=false){
  const url = run ? '/api/run' : '/api/prices';
  const res = await fetch(url);
  const data = await res.json();
  document.getElementById('updated').textContent = 'Updated ' + new Date(data.updatedAt).toLocaleString();
  const mat = document.getElementById('mat').value.toLowerCase();
  const q = document.getElementById('q').value.toLowerCase();
  const tbody = document.getElementById('rows');
  tbody.innerHTML='';
  [...data.rows]
    .filter(r => (!mat || r.material.toLowerCase() === mat))
    .filter(r => !q || (r.brand + ' ' + r.product).toLowerCase().includes(q))
    .sort((a,b)=> (a.material.localeCompare(b.material) || (a.price??1e9) - (b.price??1e9)))
    .forEach(r => {
      const tr = document.createElement('tr');
      const price = r.price != null ? ('$' + r.price.toFixed(2) + (r.currency && r.currency!=='USD' ? ' ' + r.currency : '')) : '—';
      const perkg = (r.price != null && r.weightKg) ? ('$' + (r.price / r.weightKg).toFixed(2)) : '—';
      tr.innerHTML = `<td>${r.brand}</td><td>${r.material}${r.abrasive? ' <span class="tag">abrasive</span>':''}</td>`+
                     `<td><a href="${r.url}" target="_blank" rel="noopener">${r.product}</a></td>`+
                     `<td>${price}</td><td>${perkg}</td><td>${new URL(r.url).hostname}</td>`;
      tbody.appendChild(tr);
    });
}

load();

document.getElementById('mat').addEventListener('change', ()=>load());
document.getElementById('q').addEventListener('input', ()=>load());
document.getElementById('refresh').addEventListener('click', ()=>load(true));
</script>
</html>`;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/api/prices") {
      let snap = await getSnapshot(env);
      if (!snap) { snap = await scrapeAll(); await putSnapshot(env, snap); }
      return new Response(JSON.stringify(snap, null, 2), { headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
    }
    if (url.pathname === "/api/run") {
      // Optional manual refresh; protect with token if set
      const token = env.UPDATE_TOKEN;
      if (token && url.searchParams.get("token") !== token) {
        return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "content-type": "application/json" } });
      }
      const snap = await scrapeAll();
      await putSnapshot(env, snap);
      return new Response(JSON.stringify(snap, null, 2), { headers: { "content-type": "application/json" } });
    }
    // UI
    return new Response(htmlPage(), { headers: { "content-type": "text/html; charset=utf-8" } });
  },

  // Cron trigger: refresh snapshot
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const snap = await scrapeAll();
    await putSnapshot(env, snap);
  },
};
