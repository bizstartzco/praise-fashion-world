# Praise Fashion World website

A static, multi-page site for a men's clothing and shoe brand in Nepal: plain HTML/CSS/JS, with
no framework and no npm. Upload the folder to any host (Hostinger, Netlify, GitHub Pages, cPanel)
and it runs.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Home: hero, collections, new arrivals, shoes rail, brand story, how to order |
| `shop.html` | Full catalogue with category filters (`shop.html?c=Shoes` links straight to one) and price sort |
| `products/<id>.html` | One page per product: size picker, quantity, WhatsApp order, details, related pieces |
| `about.html` | Brand story |
| `contact.html` | Contact details and how ordering works |

Orders go through WhatsApp. On a product page, the order button opens WhatsApp with the piece,
size, quantity, price and page link already typed out.

## How it's built

The HTML pages are **generated**, so don't edit them directly. Edit these instead, then run
`node tools/build.js`:

- `src/products.js` is the catalogue (name, category, price, sizes, image, description, details)
- `src/pages/*.html` holds the page bodies. Header, footer and product pages come from `tools/build.js`.

`assets/js/config.js` holds contact details and is read live in the browser, so it needs no rebuild.

## Before going live

1. **Contact details:** fill in `assets/js/config.js` (WhatsApp as `977` plus the mobile number,
   digits only). Empty fields are hidden. Until a WhatsApp number or Instagram handle is set,
   order buttons stay hidden and pages say ordering "opens soon".
2. **Products:** the 17 items in `src/products.js` are a **starter catalogue built on stock
   photos**, not your stock. Replace each with your real photo, name, price and sizes, then rebuild.
   Photos go in `assets/img/`; portrait 4:5, about 900 px wide, works best.
3. **About page copy:** `src/pages/about.html` is written in the brand's voice but describes no
   real facts (no founding date, no founder). Adjust it to your actual story.
4. **Domain:** once you have one, add canonical and `og:image` tags with full `https://` URLs,
   plus `robots.txt` and `sitemap.xml`. Product structured data (price, availability) should be
   added only once prices are real.
5. **Photo credit:** the footer credits Freepik because the free licence requires it. Remove it
   once every stock photo has been replaced.

## Animations

Page load: headline lines rise out of a mask, the hero image wipes in, and buttons fade up.
On scroll: sections fade up with a stagger and images wipe in. The header hides when you scroll
down and returns when you scroll up, and the hero image has a gentle parallax. Hover effects:
buttons fill, cards zoom and a "View piece" bar slides up, the product image zooms to follow the
pointer, and the size picker shakes if no size is chosen. Moving between pages, the browser
cross-fades and the product photo morphs from card to product page, using View Transitions in
Chrome, Edge and Safari 18+. All motion turns off for visitors who set "reduce motion" on their
device.

## Stock photo sources (Freepik, free licence, attribution required)

| File | Freepik item | | File | Freepik item |
|---|---|---|---|---|
| hero-leather.webp | 15520411 | | shoe-brogue.webp | 13298879 |
| jacket-black.webp | 25192128 | | shoe-loafer.webp | 1123639 |
| blazer-check.webp | 23987019 | | shoe-derby.webp | 9500261 |
| denim-jacket.webp | 25840329 | | shoe-hightop.webp | 16261122 |
| overcoat.webp | 7121381 | | shoe-sneaker.webp | 16017807 |
| navy-jacket.webp | 15558984 | | shoe-boot.webp | 1135366 |
| oxford-blue.webp | 1123007 | | shoe-workboot.webp | 3738068 |
| check-shirt.webp | 1135454 | | | |
| denim-shirt.webp | 1096763 | | | |
| navy-shirt.webp | 1095730 | | | |

The shoe images are Freepik's 626 px preview size because full-size downloads were rate-limited
when they were added. They're fine for the cards, but slightly soft on large product pages.
Full-resolution originals of the clothing photos are in `../praise-fashion-world-originals/`.
Do not upload that folder.

## Preview on GitHub

Repo: https://github.com/bizstartzco/praise-fashion-world. The preview is served by GitHub
Pages. After `node tools/build.js`, run `python tools/publish-github.py`. It uploads changed
files in one commit and marks the preview `noindex`, so Google ignores it while it holds
placeholder products.
