#!/usr/bin/env node
/*
 * build.js: generates every HTML page of the site. Plain Node, no dependencies.
 *
 *   node tools/build.js
 *
 * Inputs:  src/products.js     the catalogue
 *          src/pages/*.html    page bodies (first line is a JSON comment with title etc.)
 * Outputs: index.html, shop.html, about.html, contact.html  (site root)
 *          products/<id>.html  one page per product
 *
 * Never edit the generated .html files directly; edit src/ and rebuild.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const products = require(path.join(SRC, "products.js"));
const BRAND = "Praise Fashion World";

/* ---------- helpers ---------- */

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => (n == null ? null : "Rs. " + Number(n).toLocaleString("en-IN"));
const slugCat = (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const categories = [...new Set(products.map((p) => p.category))];

function check() {
  const ids = new Set();
  for (const p of products) {
    for (const k of ["id", "name", "category", "image", "alt"]) if (!p[k]) throw new Error(`product ${p.id || p.name}: missing ${k}`);
    if (!/^[a-z0-9-]+$/.test(p.id)) throw new Error(`product id "${p.id}" must be lowercase letters, numbers and hyphens`);
    if (ids.has(p.id)) throw new Error(`duplicate product id "${p.id}"`);
    ids.add(p.id);
    if (!fs.existsSync(path.join(ROOT, "assets/img", p.image))) throw new Error(`product ${p.id}: image assets/img/${p.image} not found`);
  }
}

/* ---------- shared pieces ---------- */

const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';

const NAV = [
  ["shop", "shop.html", "Shop"],
  ["shoes", "shop.html?c=Shoes", "Shoes"],
  ["about", "about.html", "About"],
  ["contact", "contact.html", "Contact"]
];

function head({ title, description, base, image, extra = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta name="theme-color" content="#161412">
  <link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
${image ? `  <link rel="preload" as="image" href="${base}assets/img/${image}" fetchpriority="high">\n` : ""}  <link rel="stylesheet" href="${base}assets/css/style.css">
${extra}</head>`;
}

function header(base, active) {
  const links = NAV.map(([key, href, label]) =>
    `        <a href="${base}${href}"${key === active ? ' aria-current="page"' : ""}>${label}</a>`).join("\n");
  return `<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="header">
    <div class="wrap header__in">
      <a class="logo" href="${base}index.html" aria-label="${BRAND}, home">
        <span class="logo__main">PRAISE</span>
        <span class="logo__sub">Fashion World</span>
      </a>
      <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
      <nav class="nav" id="nav" aria-label="Main">
${links}
        <a class="btn btn--wa" href="${base}contact.html" data-order data-wa-icon><span data-order-label>Order now</span></a>
      </nav>
    </div>
  </header>`;
}

function footer(base) {
  const shopLinks = categories.map((c) => `              <li><a href="${base}shop.html?c=${encodeURIComponent(c)}">${esc(c)}</a></li>`).join("\n");
  return `  <footer class="footer">
    <div class="wrap">
      <div class="footer__top">
        <div class="footer__brand">
          <a class="logo" href="${base}index.html" aria-label="${BRAND}, home">
            <span class="logo__main">PRAISE</span>
            <span class="logo__sub">Fashion World</span>
          </a>
          <p>Modern menswear and shoes, Nepal.</p>
        </div>
        <div class="footer__links">
          <div>
            <h4>Shop</h4>
            <ul>
${shopLinks}
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="${base}about.html">About</a></li>
              <li><a href="${base}contact.html#how-to-order">How to order</a></li>
              <li><a href="${base}contact.html">Contact</a></li>
            </ul>
          </div>
          <div data-contact-group>
            <h4>Follow</h4>
            <ul>
              <li data-contact="instagram"></li>
              <li data-contact="facebook"></li>
              <li data-contact="tiktok"></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© <span data-year>2026</span> ${BRAND}. Nepal.</span>
        <span>Photography: <a href="https://www.freepik.com" rel="noopener" target="_blank">Freepik</a></span>
      </div>
    </div>
  </footer>

  <script src="${base}assets/js/config.js"></script>
  <script src="${base}assets/js/main.js"></script>
</body>
</html>
`;
}

/* ---------- product card ---------- */

function card(p, base) {
  const price = money(p.price);
  return `<article class="card reveal" data-category="${esc(p.category)}" data-price="${p.price == null ? "" : p.price}">
  <a class="card__link" href="${base}products/${p.id}.html">
    <span class="card__media">
      <img src="${base}assets/img/${p.image}" alt="${esc(p.alt)}" width="900" height="1125" loading="lazy" decoding="async" style="view-transition-name:p-${p.id}">
      ${p.tag ? `<span class="card__tag">${esc(p.tag)}</span>` : ""}
      <span class="card__quick">View piece <span aria-hidden="true">→</span></span>
    </span>
    <span class="card__body">
      <span><span class="card__name">${esc(p.name)}</span><span class="card__cat">${esc(p.category)}</span></span>
      ${price ? `<span class="card__price">${price}</span>` : '<span class="card__price card__price--ask">Ask for price</span>'}
    </span>
  </a>
</article>`;
}

const cards = (list, base) => list.map((p) => card(p, base)).join("\n");

function catTiles(base) {
  const covers = { Jackets: "jacket-black.webp", Shirts: "denim-shirt.webp", Blazers: "blazer-check.webp", Outerwear: "overcoat.webp", Shoes: "shoe-brogue.webp" };
  return categories.map((c) => {
    const n = products.filter((p) => p.category === c).length;
    const img = covers[c] || products.find((p) => p.category === c).image;
    return `<a class="cat reveal" href="${base}shop.html?c=${encodeURIComponent(c)}">
  <img src="${base}assets/img/${img}" alt="" width="900" height="1125" loading="lazy">
  <span class="cat__label"><b>${esc(c)}</b><span>${n} ${n === 1 ? "piece" : "pieces"}</span></span>
</a>`;
  }).join("\n");
}

/* ---------- pages ---------- */

function readPage(file) {
  const raw = fs.readFileSync(path.join(SRC, "pages", file), "utf8");
  const m = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!m) throw new Error(`${file}: first line must be a <!-- {json} --> comment`);
  return { meta: JSON.parse(m[1]), body: raw.slice(m[0].length) };
}

function fill(body, base) {
  const clothes = products.filter((p) => p.category !== "Shoes");
  const shoes = products.filter((p) => p.category === "Shoes");
  return body
    .replace(/\{\{base\}\}/g, base)
    .replace(/\{\{cats\}\}/g, catTiles(base))
    .replace(/\{\{cards:featured\}\}/g, cards(clothes.slice(0, 8), base))
    .replace(/\{\{cards:shoes\}\}/g, cards(shoes, base))
    .replace(/\{\{cards:all\}\}/g, cards(products, base))
    .replace(/\{\{count:all\}\}/g, products.length + " pieces")
    .replace(/\{\{chips\}\}/g, ["All", ...categories].map((c) =>
      `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${c === "All"}">${esc(c)}</button>`).join(""))
    .replace(/\{\{wa\}\}/g, WA_ICON);
}

function buildPages() {
  const out = [];
  for (const file of fs.readdirSync(path.join(SRC, "pages")).filter((f) => f.endsWith(".html"))) {
    const { meta, body } = readPage(file);
    const base = "";
    const html = head({ ...meta, base, extra: meta.schema ? `  <script type="application/ld+json">${JSON.stringify(meta.schema)}</script>\n` : "" }) +
      "\n" + header(base, meta.nav) + "\n\n  <main id=\"main\">\n" + fill(body, base) + "  </main>\n\n" + footer(base);
    fs.writeFileSync(path.join(ROOT, file), html);
    out.push(file);
  }
  return out;
}

function productPage(p) {
  const base = "../";
  const price = money(p.price);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const fill4 = related.length < 4 ? related.concat(products.filter((x) => x.category !== p.category).slice(0, 4 - related.length)) : related;
  const sizeName = p.category === "Shoes" ? "Size (EU)" : "Size";
  const title = `${p.name} | ${BRAND}`;
  const description = `${p.name}${price ? ` for ${price}` : ""}. ${p.description}`.slice(0, 158);

  const body = `    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="${base}shop.html">Shop</a><span aria-hidden="true">/</span>
        <a href="${base}shop.html?c=${encodeURIComponent(p.category)}">${esc(p.category)}</a><span aria-hidden="true">/</span>
        <span aria-current="page">${esc(p.name)}</span>
      </nav>

      <article class="product" data-product="${esc(p.id)}" data-name="${esc(p.name)}" data-price="${p.price == null ? "" : p.price}">
        <div class="product__media" data-zoom>
          <img src="${base}assets/img/${p.image}" alt="${esc(p.alt)}" width="900" height="1125" fetchpriority="high" style="view-transition-name:p-${p.id}">
          ${p.tag ? `<span class="card__tag">${esc(p.tag)}</span>` : ""}
        </div>

        <div class="product__info">
          <p class="eyebrow intro" style="--d:.05s">${esc(p.category)}</p>
          <h1 class="display intro" style="--d:.1s">${esc(p.name)}</h1>
          <p class="product__price intro" style="--d:.15s">${price || "Ask for price"}</p>
          <p class="product__desc intro" style="--d:.2s">${esc(p.description)}</p>

          <form class="product__form intro" style="--d:.25s" data-order-form novalidate>
            ${p.sizes && p.sizes.length ? `<fieldset>
              <legend>${sizeName}</legend>
              <div class="sizes">
                ${p.sizes.map((s) => `<label><input type="radio" name="size" value="${esc(s)}"><span>${esc(s)}</span></label>`).join("\n                ")}
              </div>
            </fieldset>
            <p class="form-err" data-size-err hidden role="alert">Please choose a size first.</p>` : ""}
            <fieldset>
              <legend>Quantity</legend>
              <div class="qty">
                <button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
                <output data-qty-out>1</output>
                <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
              </div>
            </fieldset>
            <button class="btn btn--wa btn--block" type="submit" data-order-submit hidden>${WA_ICON}<span data-order-label>Order on WhatsApp</span></button>
            <p class="hint" data-order-hint></p>
            <p class="hint" data-order-none hidden>Online ordering opens soon. Contact details are coming to the <a href="${base}contact.html">contact page</a>.</p>
          </form>

          <div class="accordion intro" style="--d:.3s">
            <details open>
              <summary>Details</summary>
              <ul>${(p.details || []).map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
            </details>
            <details>
              <summary>Sizing help</summary>
              <p>Between sizes, or not sure? Message us your usual size and height and we'll suggest the right one before you order.</p>
            </details>
            <details>
              <summary>How ordering works</summary>
              <p>Your order opens in WhatsApp with everything typed out. We reply to confirm stock, the final price and delivery to your address.</p>
              <p data-delivery-note></p>
            </details>
          </div>
        </div>
      </article>
    </div>

    <section class="section section--paper">
      <div class="wrap">
        <div class="section__head">
          <div>
            <p class="eyebrow">Complete the look</p>
            <h2 class="display">You may also like</h2>
          </div>
          <a class="link-arrow" href="${base}shop.html">Shop all →</a>
        </div>
        <div class="grid">
${cards(fill4, base)}
        </div>
      </div>
    </section>
`;

  // No Product/Breadcrumb schema yet: prices are placeholders and schema needs absolute URLs (no domain yet).
  return head({ title, description, base, image: p.image }) +
    "\n" + header(base, p.category === "Shoes" ? "shoes" : "shop") + "\n\n  <main id=\"main\" class=\"page-product\">\n" + body + "  </main>\n\n" + footer(base);
}

function buildProducts() {
  const dir = path.join(ROOT, "products");
  fs.mkdirSync(dir, { recursive: true });
  const keep = new Set(products.map((p) => p.id + ".html"));
  for (const f of fs.readdirSync(dir)) if (f.endsWith(".html") && !keep.has(f)) fs.unlinkSync(path.join(dir, f));
  for (const p of products) fs.writeFileSync(path.join(dir, p.id + ".html"), productPage(p));
  return products.length;
}

check();
const pages = buildPages();
const n = buildProducts();
console.log(`built ${pages.join(", ")} and ${n} product pages`);
