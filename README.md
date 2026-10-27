# Praise Fashion World website

A static site, plain HTML/CSS/JS with no build step. Upload the whole folder to any host
(Hostinger, Netlify, GitHub Pages, cPanel) and it runs.

- `index.html` is the home page
- `shop.html` is the full catalogue, with category filters, sorting and a product popup
- Orders go through WhatsApp. The popup opens WhatsApp with the piece, size, quantity and
  price already typed out.

## Before going live

1. **Contact details:** open `assets/js/config.js` and fill in the WhatsApp number (`977` plus
   the mobile number, digits only), Instagram, address and the other fields. Any field you
   leave empty is hidden. Until a WhatsApp number or Instagram handle is set, the order
   buttons stay hidden and the contact section reads "coming soon".
2. **Products:** open `assets/js/products.js`. The 10 items there are a **starter catalogue
   built on stock photos**, not your stock. Replace each photo with a photo of the piece you
   actually sell, and set the real names, prices and sizes. Put new photos in `assets/img/`.
   Portrait 4:5 photos about 900 px wide look best.
3. **Domain:** once you have one, add `<link rel="canonical">` and `og:image` with the full
   `https://` address to both pages, plus a `robots.txt` and a `sitemap.xml`.
4. **Photo credit:** the footer credits Freepik because the free licence requires it. Once
   every stock photo has been replaced with your own, you can remove that credit.

## Stock photo sources (Freepik, free licence, attribution required)

| File | Freepik item |
|---|---|
| hero-leather.webp | 15520411 |
| jacket-black.webp | 25192128 |
| blazer-check.webp | 23987019 |
| denim-jacket.webp | 25840329 |
| overcoat.webp | 7121381 |
| navy-jacket.webp | 15558984 |
| oxford-blue.webp | 1123007 |
| check-shirt.webp | 1135454 |
| denim-shirt.webp | 1096763 |
| navy-shirt.webp | 1095730 |

The full-resolution originals are in `../praise-fashion-world-originals/`. Do not upload that folder.

## Preview on GitHub

Repo: https://github.com/bizstartzco/praise-fashion-world. The preview is served by GitHub
Pages. To push changes, run `python tools/publish-github.py`. It uploads only the files that
changed and marks the preview `noindex`, so Google ignores it while it holds placeholder products.
