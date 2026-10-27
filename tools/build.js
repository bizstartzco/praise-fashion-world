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
const testimonials = require(path.join(SRC, "testimonials.js"));
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
  <script>try{if(!sessionStorage.getItem("pfw-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("first-visit")}catch(e){}</script>
${extra}</head>`;
}

function header(base, active) {
  const links = NAV.map(([key, href, label]) =>
    `        <a href="${base}${href}"${key === active ? ' aria-current="page"' : ""}>${label}</a>`).join("\n");
  return `<body>
  <div class="loader" aria-hidden="true">
    <div class="loader__word">${"PRAISE".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>
    <div class="loader__sub">Fashion World</div>
    <div class="loader__bar"><span></span></div>
  </div>
  <div class="progress" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><span class="cursor__label">View</span></div>
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
  const shopLinks = categories.map((c) => {
    const n = products.filter((p) => p.category === c).length;
    return `              <li><a href="${base}shop.html?c=${encodeURIComponent(c)}">${esc(c)}<sup>${n}</sup></a></li>`;
  }).join("\n");
  return `  <footer class="footer">
    <div class="wrap">
      <div class="footer__cta">
        <div>
          <p class="eyebrow">Ready when you are</p>
          <h2 class="display split">Find your fit.</h2>
        </div>
        <div class="footer__cta-side">
          <p>Not sure about a size, or looking for something you don't see here? Message us. A real person replies.</p>
          <div class="footer__cta-actions">
            <a class="btn btn--accent" href="${base}shop.html">Shop the collection <span class="btn__arrow" aria-hidden="true">→</span></a>
            <a class="btn btn--line" href="${base}contact.html" data-order data-wa-icon><span data-order-label>Message us</span></a>
          </div>
        </div>
      </div>

      <div class="footer__grid">
        <div class="footer__brand">
          <a class="logo logo--light" href="${base}index.html" aria-label="${BRAND}, home">
            <span class="logo__main">PRAISE</span>
            <span class="logo__sub">Fashion World</span>
          </a>
          <p>Modern menswear and shoes for everyday life in Nepal. Jackets, shirts, blazers, outerwear and shoes, ordered in one message.</p>
          <div class="socials">
            <a data-social="whatsapp" aria-label="WhatsApp" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg></a>
            <a data-social="instagram" aria-label="Instagram" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.9 8c-.1-1.6-.4-3-1.6-4.2C19.1 2.6 17.6 2.2 16 2.1c-1.6-.1-6.4-.1-8 0-1.6.1-3 .4-4.2 1.6C2.6 4.9 2.2 6.4 2.1 8c-.1 1.6-.1 6.4 0 8 .1 1.6.4 3 1.6 4.2 1.2 1.2 2.6 1.5 4.2 1.6 1.6.1 6.4.1 8 0 1.6-.1 3-.4 4.2-1.6 1.2-1.2 1.5-2.6 1.6-4.2.1-1.6.1-6.4 0-8Zm-2.1 9.7a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.4.4-5.9.4s-4.6.1-5.9-.4a3.3 3.3 0 0 1-1.9-1.9c-.5-1.3-.4-4.4-.4-5.9s-.1-4.6.4-5.9a3.3 3.3 0 0 1 1.9-1.9c1.3-.5 4.4-.4 5.9-.4s4.6-.1 5.9.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.4.4 5.9s.1 4.6-.4 5.9Z"/></svg></a>
            <a data-social="facebook" aria-label="Facebook" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21.9v-7.4H16l.4-2.9h-2.9V9.8c0-.8.2-1.4 1.4-1.4h1.5V5.8c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.9h2.5v7.4A10 10 0 1 1 13.5 21.9Z"/></svg></a>
            <a data-social="tiktok" aria-label="TikTok" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 2h-3.3v13.3a2.9 2.9 0 1 1-2-2.8V9.1a6.2 6.2 0 1 0 5.3 6.2V8.6a7.9 7.9 0 0 0 4.6 1.5V6.8a4.6 4.6 0 0 1-4.6-4.8Z"/></svg></a>
          </div>
        </div>

        <nav class="footer__col" aria-label="Shop">
          <h3>Shop</h3>
          <ul>
              <li><a href="${base}shop.html">Everything<sup>${products.length}</sup></a></li>
${shopLinks}
          </ul>
        </nav>

        <nav class="footer__col" aria-label="Company">
          <h3>Company</h3>
          <ul>
            <li><a href="${base}about.html">About us</a></li>
            <li><a href="${base}contact.html#how-to-order">How to order</a></li>
            <li><a href="${base}contact.html">Contact</a></li>
          </ul>
        </nav>

        <div class="footer__col footer__contact">
          <h3>Get in touch</h3>
          <ul>
            <li data-contact="whatsapp"><span>WhatsApp</span><span data-value></span></li>
            <li data-contact="phone"><span>Phone</span><span data-value></span></li>
            <li data-contact="email"><span>Email</span><span data-value></span></li>
            <li data-contact="address"><span>Visit</span><span data-value></span></li>
            <li data-contact="hours"><span>Hours</span><span data-value></span></li>
          </ul>
          <p data-contact-empty hidden>Contact details are coming soon. Meanwhile, browse the <a href="${base}shop.html">collection</a>.</p>
        </div>
      </div>
    </div>

    <div class="footer__mark" aria-hidden="true">${"PRAISE".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>

    <div class="wrap footer__bottom">
      <span>© <span data-year>2026</span> ${BRAND} · Nepal</span>
      <span>Photography: <a href="https://www.freepik.com" rel="noopener" target="_blank">Freepik</a></span>
      <button class="footer__top-link" type="button" data-to-top>Back to top <span aria-hidden="true">↑</span></button>
    </div>
  </footer>

  <button class="to-top" type="button" aria-label="Back to top">
    <svg viewBox="0 0 48 48" aria-hidden="true"><circle class="to-top__track" cx="24" cy="24" r="22"/><circle class="to-top__ring" cx="24" cy="24" r="22" pathLength="100"/></svg>
    <span aria-hidden="true">↑</span>
  </button>

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

/* ---------- testimonials ---------- */

const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7z"/></svg>';

function testimonialSection(base) {
  if (!testimonials.length) return "";
  const slides = testimonials.map((t, i) => {
    const p = t.product && products.find((x) => x.id === t.product);
    const stars = t.rating ? `<div class="quote__stars" role="img" aria-label="${t.rating} out of 5 stars">${STAR.repeat(t.rating)}</div>` : "";
    const initials = esc(t.name).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return `<figure class="quote${t.sample ? " quote--sample" : ""}" data-slide="${i}">
  ${t.sample ? '<span class="quote__sample">Sample, replace with a real review</span>' : ""}
  ${stars}
  <blockquote><p>${esc(t.quote)}</p></blockquote>
  <figcaption>
    <span class="quote__avatar" aria-hidden="true">${initials}</span>
    <span><b>${esc(t.name)}</b>${t.place ? `<span>${esc(t.place)}</span>` : ""}</span>
    ${p ? `<a class="quote__product" href="${base}products/${p.id}.html"><img src="${base}assets/img/${p.image}" alt="" width="48" height="60" loading="lazy">${esc(p.name)}</a>` : ""}
  </figcaption>
</figure>`;
  }).join("\n");

  return `    <section class="section testimonials" aria-labelledby="t-title">
      <div class="wrap">
        <div class="section__head">
          <div>
            <p class="eyebrow">Reviews</p>
            <h2 class="display split" id="t-title">What customers say</h2>
          </div>
          <div class="rail-ctrl">
            <button class="rail-btn" type="button" data-q="-1" aria-label="Previous review">←</button>
            <button class="rail-btn" type="button" data-q="1" aria-label="Next review">→</button>
          </div>
        </div>
      </div>
      <div class="quotes" data-quotes tabindex="0" aria-roledescription="carousel" aria-label="Customer reviews">
${slides}
        <figure class="quote quote--ask">
          <span class="quote__mark" aria-hidden="true">“</span>
          <p class="quote__ask-title">Bought from us?</p>
          <p>Tell us how it went. Send a message with a photo of your fit and we may feature you here.</p>
          <a class="btn btn--accent" href="${base}contact.html" data-order data-wa-icon><span data-order-label>Send a review</span></a>
        </figure>
      </div>
      <div class="wrap">
        <div class="quotes__progress" aria-hidden="true"><span data-q-bar></span></div>
      </div>
    </section>
`;
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
    .replace(/\{\{testimonials\}\}/g, testimonialSection(base))
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
const samples = testimonials.filter((t) => t.sample).length;
if (samples) console.warn(`WARNING: ${samples} sample review(s) in src/testimonials.js; replace with real reviews before launch`);
for (const t of testimonials) if (t.product && !products.some((p) => p.id === t.product)) console.warn(`WARNING: review by ${t.name} links to unknown product "${t.product}"`);
