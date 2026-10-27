(function () {
  "use strict";

  var cfg = window.PFW_CONFIG || {};
  var products = window.PFW_PRODUCTS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function money(n) {
    if (n == null || n === "") return null;
    return (cfg.currency || "Rs.") + " " + Number(n).toLocaleString("en-IN");
  }

  function digits(s) { return String(s || "").replace(/\D/g, ""); }

  // Where an order message goes: WhatsApp if configured, else Instagram DM, else nowhere.
  function orderUrl(text) {
    if (digits(cfg.whatsapp)) return "https://wa.me/" + digits(cfg.whatsapp) + "?text=" + encodeURIComponent(text);
    if (cfg.instagram) return "https://ig.me/m/" + encodeURIComponent(cfg.instagram);
    return null;
  }
  var orderChannel = digits(cfg.whatsapp) ? "WhatsApp" : (cfg.instagram ? "Instagram" : null);

  /* ---------- Reveal on scroll ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;

  function observe(els) {
    els.forEach(function (el) { io ? io.observe(el) : el.classList.add("is-in"); });
  }

  /* ---------- Header ---------- */
  var header = $(".header");
  var menuBtn = $(".menu-btn");
  if (header && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Generic order buttons ---------- */
  $$("[data-order]").forEach(function (el) {
    var url = orderUrl("Hi Praise Fashion World! I'd like to know about your latest collection.");
    if (!url) { el.hidden = true; return; }
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener";
    var label = el.querySelector("[data-order-label]");
    if (label) label.textContent = "Order on " + orderChannel;
    if (orderChannel === "WhatsApp" && el.hasAttribute("data-wa-icon")) el.insertAdjacentHTML("afterbegin", WA_ICON);
  });

  /* ---------- Contact details: hide anything not configured ---------- */
  var socials = {
    instagram: cfg.instagram && "https://instagram.com/" + cfg.instagram,
    facebook: cfg.facebook && "https://facebook.com/" + cfg.facebook,
    tiktok: cfg.tiktok && "https://tiktok.com/@" + cfg.tiktok
  };
  var contactValues = {
    whatsapp: digits(cfg.whatsapp) && { text: "+" + digits(cfg.whatsapp), href: "https://wa.me/" + digits(cfg.whatsapp) },
    phone: cfg.phone && { text: cfg.phone, href: "tel:" + cfg.phone.replace(/[^\d+]/g, "") },
    email: cfg.email && { text: cfg.email, href: "mailto:" + cfg.email },
    address: cfg.address && { text: cfg.address, href: cfg.mapsUrl || null },
    hours: cfg.hours && { text: cfg.hours },
    instagram: socials.instagram && { text: "@" + cfg.instagram, href: socials.instagram },
    facebook: socials.facebook && { text: "Facebook", href: socials.facebook },
    tiktok: socials.tiktok && { text: "@" + cfg.tiktok, href: socials.tiktok }
  };
  $$("[data-contact]").forEach(function (el) {
    var v = contactValues[el.getAttribute("data-contact")];
    if (!v) { el.hidden = true; return; }
    var slot = el.querySelector("[data-value]") || el;
    if (v.href) {
      var ext = /^https?:/.test(v.href);
      slot.innerHTML = '<a href="' + esc(v.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(v.text) + "</a>";
    } else {
      slot.textContent = v.text;
    }
  });
  // A wrapper hides itself when every contact item inside it is hidden.
  $$("[data-contact-group]").forEach(function (g) {
    var items = $$("[data-contact]", g);
    if (items.length && items.every(function (i) { return i.hidden; })) g.hidden = true;
  });
  $$("[data-contact-empty]").forEach(function (el) {
    el.hidden = $$("[data-contact]", el.parentNode).some(function (i) { return !i.hidden; });
  });
  $$("[data-delivery-note]").forEach(function (el) {
    if (cfg.deliveryNote) el.textContent = cfg.deliveryNote; else el.hidden = true;
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Product cards ---------- */
  function card(p) {
    var price = money(p.price);
    return (
      '<article class="card reveal">' +
        '<button class="card__media" type="button" data-product="' + esc(p.id) + '" aria-label="View ' + esc(p.name) + '">' +
          '<img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" width="900" height="1125" loading="lazy" decoding="async">' +
          (p.tag ? '<span class="card__tag">' + esc(p.tag) + "</span>" : "") +
          '<span class="card__quick">Quick view</span>' +
        "</button>" +
        '<div class="card__body">' +
          "<div><h3 class=\"card__name\">" + esc(p.name) + '</h3><p class="card__cat">' + esc(p.category) + "</p></div>" +
          (price ? '<span class="card__price">' + price + "</span>" : '<span class="card__price card__price--ask">Ask for price</span>') +
        "</div>" +
      "</article>"
    );
  }

  function renderGrid(el, list) {
    el.innerHTML = list.map(card).join("");
    observe($$(".reveal", el));
  }

  // Home: newest first, capped
  var featured = $("[data-featured]");
  if (featured) {
    var n = parseInt(featured.getAttribute("data-featured"), 10) || 8;
    renderGrid(featured, products.slice(0, n));
  }

  // Category tiles: show live counts
  $$("[data-cat-count]").forEach(function (el) {
    var c = el.getAttribute("data-cat-count");
    var k = products.filter(function (p) { return p.category === c; }).length;
    el.textContent = k ? k + (k === 1 ? " piece" : " pieces") : "";
  });

  // Shop: filters + sort
  var shop = $("[data-shop]");
  if (shop) {
    var chipsEl = $("[data-chips]");
    var sortEl = $("[data-sort]");
    var countEl = $("[data-count]");
    var cats = ["All"].concat(products.reduce(function (a, p) {
      if (a.indexOf(p.category) === -1) a.push(p.category);
      return a;
    }, []));
    var params = new URLSearchParams(location.search);
    var active = cats.indexOf(params.get("c")) > -1 ? params.get("c") : "All";

    chipsEl.innerHTML = cats.map(function (c) {
      return '<button class="chip" type="button" data-cat="' + esc(c) + '" aria-pressed="' + (c === active) + '">' + esc(c) + "</button>";
    }).join("");

    var draw = function () {
      var list = products.filter(function (p) { return active === "All" || p.category === active; });
      var s = sortEl.value;
      if (s === "low") list.sort(function (a, b) { return (a.price || Infinity) - (b.price || Infinity); });
      if (s === "high") list.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
      if (list.length) renderGrid(shop, list);
      else shop.innerHTML = '<p class="empty">Nothing here yet. Check back soon.</p>';
      countEl.textContent = list.length + (list.length === 1 ? " piece" : " pieces");
    };

    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]");
      if (!b) return;
      active = b.getAttribute("data-cat");
      $$(".chip", chipsEl).forEach(function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
      var u = new URL(location.href);
      if (active === "All") u.searchParams.delete("c"); else u.searchParams.set("c", active);
      history.replaceState(null, "", u);
      draw();
    });
    sortEl.addEventListener("change", draw);
    draw();
  }

  /* ---------- Product dialog ---------- */
  var dlg = $("#pd");
  if (dlg) {
    var current = null, qty = 1;

    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-product]");
      if (!t) return;
      var p = products.filter(function (x) { return x.id === t.getAttribute("data-product"); })[0];
      if (p) open(p);
    });

    var open = function (p) {
      current = p; qty = 1;
      var price = money(p.price);
      $("[data-pd-img]", dlg).src = p.image;
      $("[data-pd-img]", dlg).alt = p.alt;
      $("[data-pd-cat]", dlg).textContent = p.category;
      $("[data-pd-name]", dlg).textContent = p.name;
      $("[data-pd-price]", dlg).textContent = price || "Ask for price";
      $("[data-pd-sizes]", dlg).innerHTML = (p.sizes || []).map(function (s) {
        return '<label><input type="radio" name="size" value="' + esc(s) + '"><span>' + esc(s) + "</span></label>";
      }).join("");
      $("[data-pd-qty]", dlg).textContent = qty;
      $("[data-pd-err]", dlg).hidden = true;

      var btn = $("[data-pd-order]", dlg);
      var none = $("[data-pd-none]", dlg);
      btn.hidden = !orderChannel;
      none.hidden = !!orderChannel;
      if (orderChannel) {
        btn.innerHTML = (orderChannel === "WhatsApp" ? WA_ICON : "") + "<span>Order on " + orderChannel + "</span>";
        btn.classList.toggle("btn--wa", orderChannel === "WhatsApp");
      }
      $("[data-pd-hint]", dlg).textContent = orderChannel === "WhatsApp"
        ? "Opens WhatsApp with your order typed out. We'll confirm stock, price and delivery."
        : orderChannel === "Instagram" ? "Opens an Instagram DM. Mention the piece and your size." : "";
      dlg.showModal();
    };

    $("[data-pd-minus]", dlg).addEventListener("click", function () { qty = Math.max(1, qty - 1); $("[data-pd-qty]", dlg).textContent = qty; });
    $("[data-pd-plus]", dlg).addEventListener("click", function () { qty = Math.min(10, qty + 1); $("[data-pd-qty]", dlg).textContent = qty; });
    $("[data-pd-close]", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

    $("[data-pd-order]", dlg).addEventListener("click", function () {
      var sel = $('input[name="size"]:checked', dlg);
      if (!sel && current.sizes && current.sizes.length) {
        $("[data-pd-err]", dlg).hidden = false;
        return;
      }
      var lines = [
        "Hi Praise Fashion World! I'd like to order:",
        "",
        "• " + current.name,
        sel ? "• Size: " + sel.value : null,
        "• Qty: " + qty,
        current.price ? "• Price: " + money(current.price) + " each" : null,
        "",
        "Please confirm availability and delivery."
      ].filter(function (l) { return l !== null; });
      var url = orderUrl(lines.join("\n"));
      if (url) window.open(url, "_blank", "noopener");
    });
    dlg.addEventListener("change", function () { $("[data-pd-err]", dlg).hidden = true; });
  }

  observe($$(".reveal"));
})();
