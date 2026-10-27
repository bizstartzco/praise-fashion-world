(function () {
  "use strict";

  var cfg = window.PFW_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  document.documentElement.classList.add("js");
  requestAnimationFrame(function () { document.documentElement.classList.add("is-loaded"); });

  /* ---------- Reveal on scroll (staggered within a row) ---------- */
  var io = "IntersectionObserver" in window && !reduceMotion ? new IntersectionObserver(function (entries) {
    var batch = entries.filter(function (en) { return en.isIntersecting; });
    batch.forEach(function (en, i) {
      en.target.style.setProperty("--stagger", (i * 0.07) + "s");
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -6% 0px" }) : null;

  function observe(els) {
    els.forEach(function (el) { io ? io.observe(el) : el.classList.add("is-in"); });
  }
  observe($$(".reveal, .reveal-img"));

  /* ---------- Header: menu, scrolled state, hide on scroll down ---------- */
  var header = $(".header");
  var menuBtn = $(".menu-btn");
  if (header && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("no-scroll", open);
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      });
    });
  }

  var lastY = window.scrollY, ticking = false;
  var parallax = reduceMotion ? null : $("[data-parallax]");
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 8);
      if (!header.classList.contains("is-open")) header.classList.toggle("is-hidden", y > 400 && y > lastY);
    }
    if (parallax && y < window.innerHeight * 1.2) {
      parallax.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

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
  var contactValues = {
    whatsapp: digits(cfg.whatsapp) && { text: "+" + digits(cfg.whatsapp), href: "https://wa.me/" + digits(cfg.whatsapp) },
    phone: cfg.phone && { text: cfg.phone, href: "tel:" + cfg.phone.replace(/[^\d+]/g, "") },
    email: cfg.email && { text: cfg.email, href: "mailto:" + cfg.email },
    address: cfg.address && { text: cfg.address, href: cfg.mapsUrl || null },
    hours: cfg.hours && { text: cfg.hours },
    instagram: cfg.instagram && { text: "@" + cfg.instagram, href: "https://instagram.com/" + cfg.instagram },
    facebook: cfg.facebook && { text: "Facebook", href: "https://facebook.com/" + cfg.facebook },
    tiktok: cfg.tiktok && { text: "@" + cfg.tiktok, href: "https://tiktok.com/@" + cfg.tiktok }
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

  /* ---------- Shop: filter + sort the static cards ---------- */
  var shop = $("[data-shop]");
  if (shop) {
    var chipsEl = $("[data-chips]");
    var sortEl = $("[data-sort]");
    var countEl = $("[data-count]");
    var titleEl = $("[data-shop-title]");
    var cardsAll = $$(".card", shop);
    cardsAll.forEach(function (c, i) { c.dataset.order = i; });
    var cats = $$("[data-cat]", chipsEl).map(function (b) { return b.getAttribute("data-cat"); });
    var param = new URLSearchParams(location.search).get("c");
    var active = cats.indexOf(param) > -1 ? param : "All";

    var draw = function (animate) {
      var s = sortEl.value;
      var list = cardsAll.slice().sort(function (a, b) {
        var pa = a.dataset.price === "" ? null : +a.dataset.price;
        var pb = b.dataset.price === "" ? null : +b.dataset.price;
        if (s === "low") return (pa == null ? Infinity : pa) - (pb == null ? Infinity : pb);
        if (s === "high") return (pb || 0) - (pa || 0);
        return a.dataset.order - b.dataset.order;
      });
      var shown = 0;
      list.forEach(function (c) {
        var on = active === "All" || c.dataset.category === active;
        c.hidden = !on;
        shop.appendChild(c);
        if (on) {
          if (animate && !reduceMotion) {
            c.classList.remove("is-in", "pop");
            c.style.setProperty("--stagger", Math.min(shown, 8) * 0.05 + "s");
            void c.offsetWidth;
            c.classList.add("pop", "is-in");
          }
          shown++;
        }
      });
      countEl.textContent = shown + (shown === 1 ? " piece" : " pieces");
      if (titleEl) titleEl.textContent = active === "All" ? "Shop" : active;
      $$(".nav a:not(.btn)").forEach(function (a) {
        var href = a.getAttribute("href");
        var on = active === "Shoes" ? /\?c=Shoes$/.test(href) : /shop\.html$/.test(href);
        if (on) a.setAttribute("aria-current", "page"); else if (/shop\.html/.test(href)) a.removeAttribute("aria-current");
      });
      $$(".chip", chipsEl).forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-cat") === active ? "true" : "false"); });
    };

    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]");
      if (!b) return;
      active = b.getAttribute("data-cat");
      var u = new URL(location.href);
      if (active === "All") u.searchParams.delete("c"); else u.searchParams.set("c", active);
      history.replaceState(null, "", u);
      draw(true);
    });
    sortEl.addEventListener("change", function () { draw(true); });
    draw(false);
  }

  /* ---------- Shoes rail ---------- */
  var rail = $("[data-rail-track]");
  if (rail) {
    $$("[data-rail]").forEach(function (b) {
      b.addEventListener("click", function () {
        var step = rail.clientWidth * 0.8 * +b.getAttribute("data-rail");
        rail.scrollBy({ left: step, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
    var syncRail = function () {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      $("[data-rail='-1']").disabled = rail.scrollLeft <= 2;
      $("[data-rail='1']").disabled = rail.scrollLeft >= max;
    };
    rail.addEventListener("scroll", syncRail, { passive: true });
    window.addEventListener("resize", syncRail);
    syncRail();
  }

  /* ---------- Product page ---------- */
  var product = $("[data-product]");
  var form = $("[data-order-form]");
  if (product && form) {
    var qty = 1;
    var qtyOut = $("[data-qty-out]", form);
    var submit = $("[data-order-submit]", form);
    var sizeErr = $("[data-size-err]", form);
    var hint = $("[data-order-hint]", form);

    $$("[data-qty]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        qty = Math.min(10, Math.max(1, qty + +b.getAttribute("data-qty")));
        qtyOut.textContent = qty;
        qtyOut.classList.remove("bump"); void qtyOut.offsetWidth; qtyOut.classList.add("bump");
      });
    });

    if (orderChannel) {
      submit.hidden = false;
      $("[data-order-label]", submit).textContent = "Order on " + orderChannel;
      if (orderChannel !== "WhatsApp") {
        submit.classList.remove("btn--wa");
        var svg = submit.querySelector("svg");
        if (svg) svg.remove();
      }
      hint.textContent = orderChannel === "WhatsApp"
        ? "Opens WhatsApp with your order typed out. We'll confirm stock, price and delivery."
        : "Opens an Instagram DM. Mention the piece and your size.";
    } else {
      hint.hidden = true;
      $("[data-order-none]", form).hidden = false;
    }

    form.addEventListener("change", function () { if (sizeErr) sizeErr.hidden = true; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var sel = $('input[name="size"]:checked', form);
      if (sizeErr && !sel) {
        sizeErr.hidden = false;
        var sizes = $(".sizes", form);
        sizes.classList.remove("shake"); void sizes.offsetWidth; sizes.classList.add("shake");
        return;
      }
      var price = product.getAttribute("data-price");
      var lines = [
        "Hi Praise Fashion World! I'd like to order:",
        "",
        "• " + product.getAttribute("data-name"),
        sel ? "• Size: " + sel.value : null,
        "• Qty: " + qty,
        price ? "• Price: " + money(price) + " each" : null,
        "• Link: " + location.href.split("?")[0].split("#")[0],
        "",
        "Please confirm availability and delivery."
      ].filter(function (l) { return l !== null; });
      var url = orderUrl(lines.join("\n"));
      if (url) window.open(url, "_blank", "noopener");
    });

    // Hover zoom that follows the pointer
    var zoom = $("[data-zoom]");
    if (zoom && !reduceMotion && matchMedia("(hover: hover)").matches) {
      var zimg = $("img", zoom);
      zoom.addEventListener("mousemove", function (e) {
        var r = zoom.getBoundingClientRect();
        zimg.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + "% " + ((e.clientY - r.top) / r.height * 100) + "%";
        zoom.classList.add("is-zoomed");
      });
      zoom.addEventListener("mouseleave", function () { zoom.classList.remove("is-zoomed"); });
    }
  }
})();
