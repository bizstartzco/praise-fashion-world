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

  var root = document.documentElement;
  root.classList.add("js");
  // First visit in a session: the PRAISE intro plays, then the curtain lifts and the page animates in.
  if (root.classList.contains("first-visit")) {
    try { sessionStorage.setItem("pfw-seen", "1"); } catch (e) {}
    setTimeout(function () { root.classList.add("loader-done"); }, 1250);
    setTimeout(function () { root.classList.add("is-loaded"); }, 1500);
    setTimeout(function () { root.classList.remove("first-visit"); }, 2400);
  } else {
    requestAnimationFrame(function () { root.classList.add("is-loaded"); });
  }

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
  /* ---------- Split headings into letters (they rise one by one on reveal) ---------- */
  $$(".split").forEach(function (h) {
    var text = h.textContent.trim();
    h.setAttribute("aria-label", text);
    var n = 0;
    h.innerHTML = text.split(" ").map(function (word) {
      return '<span class="w" aria-hidden="true">' + word.split("").map(function (ch) {
        return '<span class="c" style="--ci:' + (n++) + '">' + esc(ch) + "</span>";
      }).join("") + "</span>";
    }).join(" ");
  });

  observe($$(".reveal, .reveal-img, .split"));

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

  /* ---------- Testimonials carousel: autoplay, buttons, drag, progress ---------- */
  var quotes = $("[data-quotes]");
  if (quotes) {
    var slides = $$(".quote", quotes);
    var bar = $("[data-q-bar]");
    var paused = false, timer = null;
    var current = function () {
      var x = quotes.scrollLeft, best = 0, bestD = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft - quotes.offsetLeft - parseFloat(getComputedStyle(quotes).paddingLeft) - x);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    };
    var go = function (i) {
      i = (i + slides.length) % slides.length;
      var pad = parseFloat(getComputedStyle(quotes).paddingLeft);
      quotes.scrollTo({ left: slides[i].offsetLeft - quotes.offsetLeft - pad, behavior: reduceMotion ? "auto" : "smooth" });
    };
    var mark = function () {
      var c = current();
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === c); });
      var max = quotes.scrollWidth - quotes.clientWidth;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.max(0.08, quotes.scrollLeft / max) : 1) + ")";
    };
    $$("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () { go(current() + +b.getAttribute("data-q")); restart(); });
    });
    quotes.addEventListener("scroll", function () { requestAnimationFrame(mark); }, { passive: true });
    ["mouseenter", "focusin", "touchstart"].forEach(function (ev) { quotes.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["mouseleave", "focusout"].forEach(function (ev) { quotes.addEventListener(ev, function () { paused = false; }); });
    var restart = function () {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { if (!paused && !document.hidden) go(current() + 1); }, 5200);
    };

    // Drag to scroll with a mouse (touch already scrolls natively)
    var down = false, startX = 0, startL = 0, moved = false;
    quotes.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.target.closest("a, button")) return;
      down = true; moved = false; startX = e.clientX; startL = quotes.scrollLeft;
      quotes.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      quotes.scrollLeft = startL - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false; quotes.classList.remove("is-dragging");
      if (moved) go(current());
    });

    mark();
    restart();
  }

  /* ---------- Fine-pointer extras: custom cursor, magnetic buttons, card tilt ---------- */
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    var cursor = $(".cursor");
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    root.classList.add("has-cursor");
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("is-on");
      var t = e.target;
      cursor.classList.toggle("is-view", !!t.closest(".card__link, .cat, .hero__tag"));
      cursor.classList.toggle("is-link", !t.closest(".card__link, .cat, .hero__tag") && !!t.closest("a, button, summary, label, select, [data-quotes]"));
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cursor.classList.remove("is-on"); });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();

    $$(".btn, .rail-btn, .to-top").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) * 0.22, my = (e.clientY - r.top - r.height / 2) * 0.32;
        b.style.translate = mx.toFixed(1) + "px " + my.toFixed(1) + "px";
      });
      b.addEventListener("mouseleave", function () { b.style.translate = ""; });
    });

    $$(".card__media, .cat").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", (-py * 7).toFixed(2) + "deg");
        el.style.setProperty("--ry", (px * 9).toFixed(2) + "deg");
        el.style.setProperty("--gx", (px * 100 + 50).toFixed(0) + "%");
        el.style.setProperty("--gy", (py * 100 + 50).toFixed(0) + "%");
        el.classList.add("is-tilting");
      });
      el.addEventListener("mouseleave", function () {
        el.classList.remove("is-tilting");
        el.style.removeProperty("--rx"); el.style.removeProperty("--ry");
      });
    });
  }

  /* ---------- Scroll-linked effects: progress bar, back-to-top ring, parallax, scrub text, velocity marquee ---------- */
  var progress = $(".progress");
  var toTop = $(".to-top");
  var ring = toTop && $(".to-top__ring", toTop);
  var plx = reduceMotion ? [] : $$(".plx");
  var vel = reduceMotion ? null : $("[data-velocity]");
  var scrub = $("[data-scrub]");
  var scrubWords = [];
  if (scrub) {
    scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map(function (w) { return '<span class="sw">' + esc(w) + "</span>"; }).join(" ");
    scrubWords = $$(".sw", scrub);
    if (reduceMotion) scrubWords.forEach(function (w) { w.classList.add("on"); });
  }
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  var prevY = window.scrollY, velX = 0, speed = 0;
  function scrollFx() {
    var y = window.scrollY, docH = document.documentElement.scrollHeight - innerHeight;
    var p = docH > 0 ? y / docH : 0;
    if (progress) progress.style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (toTop) {
      toTop.classList.toggle("is-on", y > innerHeight * 0.8);
      if (ring) ring.style.strokeDashoffset = (100 - p * 100).toFixed(2);
    }
    plx.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.setProperty("--plx", (c * -40).toFixed(1) + "px");
    });
    if (scrub && !reduceMotion) {
      var sr = scrub.getBoundingClientRect();
      var t = Math.min(1, Math.max(0, (innerHeight * 0.85 - sr.top) / (sr.height + innerHeight * 0.35)));
      var lit = Math.round(t * scrubWords.length);
      scrubWords.forEach(function (w, i) { w.classList.toggle("on", i < lit); });
    }
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(scrollFx); }, { passive: true });
  window.addEventListener("resize", scrollFx);
  scrollFx();

  if (vel) {
    var half = 0;
    var measure = function () { half = vel.scrollWidth / 2; };
    measure(); window.addEventListener("resize", measure);
    (function tick() {
      var y = window.scrollY, dy = y - prevY; prevY = y;
      speed += (Math.max(-60, Math.min(60, dy)) * 0.6 - speed) * 0.1;
      velX -= 1.2 + Math.abs(speed);
      if (half && -velX >= half) velX += half;
      vel.style.transform = "translate3d(" + velX.toFixed(1) + "px,0,0) skewX(" + (-speed * 0.25).toFixed(2) + "deg)";
      requestAnimationFrame(tick);
    })();
  }
})();
