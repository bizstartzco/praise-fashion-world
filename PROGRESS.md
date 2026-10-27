# Progress

## 2026-10-27: First build

**Done**
- Static site with two pages. `index.html` has the hero, collection tiles, new arrivals, the brand
  story, how to order, and contact. `shop.html` is the catalogue with category filters, price sort
  and a product popup.
- WhatsApp ordering. The popup sends a pre-typed order with the piece, size, quantity and price.
  If only Instagram is set, buttons fall back to an Instagram DM. If neither is set, they hide.
- Contact details are read from `assets/js/config.js`, and empty fields hide themselves.
- Mobile layout, keyboard-accessible product popup, and images compressed to WebP (about 0.8 MB
  for the whole site).
- Checked in headless Chrome at desktop and phone widths, with and without contact details.

**Open (needed before launch)**
- [ ] WhatsApp number, Instagram, address and hours in `config.js`
- [ ] Real product photos, names, prices and sizes in `products.js`. The current 10 are Freepik
      stock placeholders.
- [ ] A logo (currently a text wordmark)
- [ ] Domain, then canonical/OG tags, `robots.txt` and `sitemap.xml`

**Preview:** the GitHub Pages copy is marked `noindex` while it holds placeholder products.
