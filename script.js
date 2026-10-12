(function () {
  "use strict";

  var WHATSAPP_PHONE = "573000000000";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Loader ---------- */
  var loader = document.getElementById("loader");
  var loaderTimer;

  function hideLoader() {
    if (!loader || loader.classList.contains("is-hidden")) return;
    window.clearTimeout(loaderTimer);
    loader.classList.add("is-hidden");
    document.body.style.overflow = "";
    loaderTimer = window.setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 900);
  }

  if (loader) {
    document.body.style.overflow = "hidden";
    loaderTimer = window.setTimeout(hideLoader, 2600);
    window.addEventListener("load", hideLoader);
  }

  /* ---------- Año ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar ---------- */
  var navbar = document.getElementById("navbar");
  var navToggle = document.getElementById("nav-toggle");
  var navMenu = document.getElementById("nav-menu");

  function onScroll() {
    navbar.classList.toggle("is-scrolled", window.scrollY > 30);
    requestParallax();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("click", function (e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) closeMenu();
    });
  }

  /* ---------- WhatsApp flotante ---------- */
  var waFloat = document.getElementById("waFloat");
  if (waFloat && WHATSAPP_PHONE) {
    waFloat.setAttribute(
      "href",
      "https://wa.me/" +
        WHATSAPP_PHONE +
        "?text=" +
        encodeURIComponent("Hola Fogón Artesano, me gustaría reservar una mesa.")
    );
  }

  /* ---------- Tema Día / Noche ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var themeLabel = document.getElementById("themeLabel");
  var heroEyebrow = document.getElementById("heroEyebrow");
  var heroSub = document.getElementById("heroSub");

  var HERO_COPY = {
    night: {
      eyebrow: "Fogón Artesano · Restaurante de autor",
      sub: "Sabores de autor, ingredientes de temporada y una experiencia pensada para los sentidos, en pleno corazón de la ciudad."
    },
    day: {
      eyebrow: "Fogón Artesano · Brunch y almuerzos",
      sub: "Platos ligeros, pan recién horneado y luminosos veranos en cada mesa, bajo la luz del mediodía."
    }
  };

  function activateTab(category) {
    var tab = document.querySelector('.tab[data-category="' + category + '"]');
    if (!tab) return;
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
      t.tabIndex = -1;
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    tab.tabIndex = 0;

    document.querySelectorAll(".menu-panel").forEach(function (panel) {
      panel.classList.remove("is-active");
    });
    var target = document.getElementById("panel-" + category);
    if (target) {
      target.classList.add("is-active");
      target.querySelectorAll(".dish.reveal").forEach(function (dish, i) {
        dish.style.transitionDelay = i * 70 + "ms";
        dish.classList.add("is-visible");
      });
    }
  }

  function activeCategoryVisibleIn(theme) {
    var active = document.querySelector(".tab.is-active");
    if (!active) return true;
    var cat = active.getAttribute("data-category");
    if (cat === "brunch") return theme === "day";
    if (cat === "cocteleria") return theme === "night";
    return true;
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeLabel.textContent = theme === "night" ? "Día" : "Noche";
    themeToggle.setAttribute("aria-pressed", theme === "day" ? "true" : "false");

    var copy = HERO_COPY[theme];
    heroEyebrow.textContent = copy.eyebrow;
    heroSub.textContent = copy.sub;

    if (!activeCategoryVisibleIn(theme)) {
      activateTab("entradas");
    }
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem("fa-theme"); } catch (e) { savedTheme = null; }
  applyTheme(savedTheme === "day" ? "day" : "night");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "night" ? "day" : "night";
      var commit = function () {
        applyTheme(next);
        try { localStorage.setItem("fa-theme", next); } catch (e) { /* sin almacenamiento */ }
      };
      if (document.startViewTransition && !reduceMotion) {
        document.startViewTransition(commit);
      } else {
        commit();
      }
    });
  }

  /* ---------- Ocupación en tiempo real (simulada) ---------- */
  var occHero = document.getElementById("occHero");
  var occHeroText = document.getElementById("occHeroText");
  var occBooking = document.querySelector(".occ--big");
  var occBookingText = document.getElementById("occBookingText");

  function occupancyNow() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes() / 60;
    var inDay = h >= 13 && h < 16;
    var inNight = h >= 20 && h < 24;
    var open = inDay || inNight;
    var base;
    if (inDay) base = 0.5 + (h - 13 + m) * 0.09;
    else if (inNight) base = 0.62 + (h - 20 + m) * 0.1;
    else base = 0.5;
    var drift = ((now.getDate() * 7 + now.getMonth() * 3) % 17) / 100;
    var occ = open ? base + drift - 0.06 : 0.5 + drift / 3;
    return Math.round(Math.min(0.97, Math.max(0.5, occ)) * 100);
  }

  function renderOccupancy() {
    var pct = occupancyNow();
    var msg, level;
    if (pct >= 85) { msg = "¡Últimas mesas disponibles!"; level = "high"; }
    else if (pct >= 70) { msg = "Quedan pocas mesas"; level = "mid"; }
    else { msg = "Buena disponibilidad"; level = "low"; }

    var text = "Ocupación de hoy: " + pct + "% · " + msg;
    if (occHeroText) occHeroText.textContent = text;
    if (occBookingText) occBookingText.textContent = text;

    [occHero, occBooking].forEach(function (el) {
      if (!el) return;
      el.classList.remove("occ--low", "occ--mid", "occ--high");
      el.classList.add("occ--" + level);
    });
  }

  renderOccupancy();
  window.setInterval(renderOccupancy, 60000);

  /* ---------- Cursor personalizado ---------- */
  var cursor = document.getElementById("cursor");
  var cursorLabel = document.getElementById("cursorLabel");
  var cursorPos = { x: -100, y: -100 };
  var cursorTarget = { x: -100, y: -100 };
  var cursorRaf = null;

  if (cursor && hasFinePointer && !reduceMotion) {
    document.addEventListener("mousemove", function (e) {
      cursorTarget.x = e.clientX;
      cursorTarget.y = e.clientY;
      cursor.classList.add("is-visible");
      if (cursorRaf === null) cursorLoop();
    });
    document.addEventListener("mouseleave", function () {
      cursor.classList.remove("is-visible");
    });
    document.addEventListener(
      "mouseover",
      function (e) {
        var explore = e.target.closest(".gallery__item");
        var interactive = e.target.closest(
          "a, button, .tab, .chip, .seat, input, select, .occasion-chip, .read-toggle, .pay-option"
        );
        cursor.classList.toggle("is-explore", !!explore);
        cursor.classList.toggle("is-link", !!interactive && !explore);
        if (explore && cursorLabel) {
          cursorLabel.textContent = "Explorar";
        }
      },
      { passive: true }
    );

    function cursorLoop() {
      cursorPos.x += (cursorTarget.x - cursorPos.x) * 0.22;
      cursorPos.y += (cursorTarget.y - cursorPos.y) * 0.22;
      cursor.style.transform =
        "translate3d(" + cursorPos.x + "px, " + cursorPos.y + "px, 0) translate(-50%, -50%)";
      cursorRaf = window.requestAnimationFrame(cursorLoop);
    }
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealIn(el) {
    el.classList.add("is-visible");
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealIn(entry.target);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -50px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Reveal por recorte (clip-path) + parallax cinematográfico ---------- */
  var clipEls = Array.prototype.slice.call(document.querySelectorAll("[data-clip]"));
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  if (clipEls.length) {
    if (reduceMotion) {
      clipEls.forEach(function (el) { el.classList.add("is-revealed"); });
    } else if (hasGsap) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      clipEls.forEach(function (el) {
        window.gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0 0 0)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true }
          }
        );
      });
      var heroVideo = document.querySelector(".hero__video");
      if (heroVideo) {
        window.gsap.fromTo(
          heroVideo,
          { y: 42 },
          {
            y: -42,
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
          }
        );
      }
    } else {
      if (!("IntersectionObserver" in window)) {
        clipEls.forEach(function (el) { el.classList.add("is-revealed"); });
      } else {
        var clipObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                clipObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
        );
        clipEls.forEach(function (el) { clipObserver.observe(el); });
      }
    }
  }

  /* ---------- Parallax ---------- */
  var parallaxEl = document.querySelector(".parallax");
  var parallaxTickPending = false;

  function requestParallax() {
    if (!parallaxEl || reduceMotion) return;
    if (!parallaxTickPending) {
      parallaxTickPending = true;
      window.requestAnimationFrame(parallaxTick);
    }
  }

  function parallaxTick() {
    parallaxTickPending = false;
    var rect = parallaxEl.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var speed = parseFloat(parallaxEl.getAttribute("data-speed")) || 0.08;
    var offset = rect.top + rect.height / 2 - window.innerHeight / 2;
    parallaxEl.style.transform = "translateY(" + offset * speed + "px)";
  }

  if (parallaxEl) {
    requestParallax();
    window.addEventListener("resize", requestParallax, { passive: true });
  }

  /* ---------- Menú: pestañas ---------- */
  var tabEls = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  tabEls.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (!tab.classList.contains("is-active")) activateTab(tab.dataset.category);
    });
    tab.addEventListener("keydown", function (e) {
      var list = tabEls.filter(function (t) { return t.offsetParent !== null; });
      var pos = list.indexOf(tab);
      if (pos < 0) return;
      var target = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") target = list[(pos + 1) % list.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") target = list[(pos - 1 + list.length) % list.length];
      else if (e.key === "Home") target = list[0];
      else if (e.key === "End") target = list[list.length - 1];
      if (target) {
        e.preventDefault();
        activateTab(target.dataset.category);
        target.focus();
      }
    });
  });

  /* ---------- Filtro nutricional / alérgenos ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".diet__chips .chip"));
  var allDishes = Array.prototype.slice.call(document.querySelectorAll(".dish"));
  var dietReset = document.getElementById("dietReset");

  var FILTER_KEYS = { vegan: "vegan", gluten: "gluten", lactose: "lactose", keto: "keto" };

  function activeFilters() {
    return chips
      .filter(function (chip) { return chip.classList.contains("is-active"); })
      .map(function (chip) { return FILTER_KEYS[chip.dataset.filter]; });
  }

  function applyDietFilter() {
    var filters = activeFilters();
    allDishes.forEach(function (dish) {
      var ok = filters.every(function (key) {
        return dish.getAttribute("data-" + key) === "1";
      });
      dish.classList.toggle("is-filtered", filters.length > 0 && !ok);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chip.classList.toggle("is-active");
      chip.setAttribute("aria-pressed", chip.classList.contains("is-active") ? "true" : "false");
      applyDietFilter();
    });
  });

  if (dietReset) {
    dietReset.addEventListener("click", function () {
      chips.forEach(function (chip) {
        chip.classList.remove("is-active");
        chip.setAttribute("aria-pressed", "false");
      });
      applyDietFilter();
    });
  }

  /* ---------- Modo lectura de alérgenos (ilumina aptos) ---------- */
  var readToggle = document.getElementById("readToggle");
  var menuSection = document.getElementById("menu");
  var READ_KEYS = ["gluten", "vegan"];

  function applyReadMode() {
    if (!readToggle || !menuSection) return;
    var on = readToggle.classList.contains("is-active");
    menuSection.classList.toggle("is-reading", on);
    readToggle.setAttribute("aria-pressed", on ? "true" : "false");
    allDishes.forEach(function (dish) {
      var apt = READ_KEYS.some(function (k) { return dish.getAttribute("data-" + k) === "1"; });
      dish.classList.toggle("is-apt", on && apt);
    });
  }

  if (readToggle) {
    readToggle.addEventListener("click", function () {
      readToggle.classList.toggle("is-active");
      applyReadMode();
    });
  }

  /* ---------- Nota del chef (rota cada día) ---------- */
  var chefNoteEl = document.getElementById("chefNote");
  var chefNoteDate = document.getElementById("chefNoteDate");
  var CHEF_NOTES = [
    "Hoy el mercado nos trajo trucha fresca del páramo, disponible solo por hoy.",
    "Llegó queso de cabra de un productor de Santander; lo servimos templado con miel de caña.",
    "El fuego arrancó temprano: nuestro cordero a baja temperatura suele agotarse antes de las nueve.",
    "Pan de masa madre recién salido del horno, con mantequilla ahumada de la casa.",
    "Llegaron tomates heirloom de la huerta y la burrata se sirve con ellos solo esta noche.",
    "Recomendación del chef: guarden un hueco para la tarta de chocolate amargo, la horneamos cada mañana.",
    "Sorbo de temporada: sorbete de mango del Alto Magdalena, fresquísimo para cerrar la mesa."
  ];

  function renderChefNote() {
    if (!chefNoteEl) return;
    var now = new Date();
    var idx = now.getDay() % CHEF_NOTES.length;
    chefNoteEl.classList.add("is-swapping");
    window.setTimeout(function () {
      chefNoteEl.textContent = CHEF_NOTES[idx];
      chefNoteEl.classList.remove("is-swapping");
    }, reduceMotion ? 0 : 260);

    if (chefNoteDate) {
      var s = now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
      chefNoteDate.textContent = s.charAt(0).toUpperCase() + s.slice(1);
    }
  }
  renderChefNote();

  /* ---------- Galería + lightbox ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var lightboxIndex = 0;
  var lightboxReturnFocus = null;

  if (lightbox && galleryItems.length) {
    function renderLightbox() {
      var item = galleryItems[lightboxIndex];
      var img = item.querySelector("img");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = item.getAttribute("data-caption") || "";
    }

    function openLightbox(index) {
      lightboxIndex = index;
      lightboxReturnFocus = galleryItems[index];
      renderLightbox();
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      window.requestAnimationFrame(function () {
        lightbox.classList.add("is-open");
        if (lightboxClose) lightboxClose.focus();
      });
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      window.setTimeout(function () {
        if (!lightbox.classList.contains("is-open")) lightbox.hidden = true;
      }, 380);
      if (lightboxReturnFocus && lightboxReturnFocus.focus) {
        lightboxReturnFocus.focus();
        lightboxReturnFocus = null;
      }
    }

    function step(delta) {
      lightboxIndex = (lightboxIndex + delta + galleryItems.length) % galleryItems.length;
      renderLightbox();
    }

    galleryItems.forEach(function (item, index) {
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      var caption = item.getAttribute("data-caption");
      if (caption) item.setAttribute("aria-label", "Ampliar imagen: " + caption);
      item.addEventListener("click", function () { openLightbox(index); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", function () { step(-1); });
    if (lightboxNext) lightboxNext.addEventListener("click", function () { step(1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Tab") {
        var focusables = [lightboxClose, lightboxPrev, lightboxNext].filter(function (el) {
          return el && el.offsetParent !== null;
        });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- Mapa de mesas → reserva ---------- */
  var seats = Array.prototype.slice.call(document.querySelectorAll(".seat"));
  var zoneRadios = document.querySelectorAll('input[name="zona"]');
  var payRadios = document.querySelectorAll('input[name="pago"]');
  var pickZone = document.getElementById("pickZone");
  var pickTable = document.getElementById("pickTable");
  var bkGuests = document.getElementById("bkGuests");
  var selectedSeat = null;

  function zoneLabelFor(value) {
    var map = { "Terraza": "Terraza", "Salón principal": "Salón Principal", "Zona VIP": "Zona VIP", "Barra": "Barra" };
    return map[value] || value;
  }

  function checkZone(value) {
    var radio = Array.prototype.slice.call(zoneRadios).filter(function (r) { return r.value === value; })[0];
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function selectSeat(seat) {
    seats.forEach(function (s) { s.classList.remove("is-selected"); });
    seat.classList.add("is-selected");
    selectedSeat = seat;
    checkZone(seat.getAttribute("data-zone"));
    pickZone.textContent = "Zona: " + zoneLabelFor(seat.getAttribute("data-zone"));
    pickTable.textContent = "Mesa: " + seat.getAttribute("data-label");
    bkGuests.value = seat.getAttribute("data-guests");
  }

  function clearSeat() {
    if (selectedSeat) selectedSeat.classList.remove("is-selected");
    selectedSeat = null;
    pickTable.textContent = "Mesa: —";
  }

  seats.forEach(function (seat) {
    var zoneGroup = seat.parentNode;
    var label = zoneGroup.querySelector(".floor__zone-label");
    var zoneName = label ? label.textContent.trim() : "";
    var within =
      Array.prototype.indexOf.call(zoneGroup.querySelectorAll(".seat"), seat) + 1;
    seat.setAttribute("data-label", zoneFromName(zoneName) + " " + within);
    seat.addEventListener("click", function (e) {
      e.stopPropagation();
      selectSeat(seat);
    });
  });

  function zoneFromName(name) {
    var names = { "TERRAZA": "Mesa", "SALÓN PRINCIPAL": "Mesa", "ZONA VIP": "Mesa VIP", "BARRA": "Taburete" };
    return names[name] || "Mesa";
  }

  document.querySelectorAll(".floor__zone").forEach(function (zone) {
    zone.addEventListener("click", function () {
      var label = zone.querySelector(".floor__zone-label");
      var name = label ? label.textContent.trim() : "";
      var value = { "TERRAZA": "Terraza", "SALÓN PRINCIPAL": "Salón principal", "ZONA VIP": "Zona VIP", "BARRA": "Barra" }[name];
      if (!value) return;
      clearSeat();
      checkZone(value);
      pickZone.textContent = "Zona: " + zoneLabelFor(value);
    });
  });

  if (bkGuests) {
    bkGuests.addEventListener("change", function () {
      if (selectedSeat) clearSeat();
    });
  }

  /* ---------- Reservas: validación ---------- */
  var bookingForm = document.getElementById("bookingForm");
  var bookingSuccess = document.getElementById("bookingSuccess");
  var resCodeEl = document.getElementById("resCode");
  var resPayEl = document.getElementById("resPay");
  var resOccEl = document.getElementById("resOcc");
  var bkOccasion = document.getElementById("bkOccasion");
  var occChips = Array.prototype.slice.call(document.querySelectorAll(".occasion-chip"));

  occChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var wasActive = chip.classList.contains("is-active");
      occChips.forEach(function (c) { c.classList.remove("is-active"); });
      if (wasActive) {
        if (bkOccasion) bkOccasion.value = "";
      } else {
        chip.classList.add("is-active");
        if (bkOccasion) bkOccasion.value = chip.getAttribute("data-occasion") || "";
      }
    });
  });

  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  var inputs = {
    bkDate: document.getElementById("bkDate"),
    bkTime: document.getElementById("bkTime"),
    bkGuests: document.getElementById("bkGuests"),
    bkName: document.getElementById("bkName"),
    bkPhone: document.getElementById("bkPhone")
  };

  function fieldError(el, elId, message) {
    var small = document.querySelector('.field__error[data-for="' + elId + '"]');
    if (small) small.textContent = message;
    if (el) el.classList.toggle("has-error", !!message);
  }

  function validateField(key) {
    var elId = key === "zona" ? "zona" : key;
    var el = inputs[key];
    var message = "";
    if (key === "bkDate") {
      if (!inputs.bkDate.value) message = "Selecciona una fecha.";
      else if (inputs.bkDate.value < todayISO()) message = "La fecha no puede estar en el pasado.";
    } else if (key === "bkTime") {
      if (!inputs.bkTime.value) message = "Elige una hora.";
    } else if (key === "bkGuests") {
      if (!inputs.bkGuests.value) message = "Elige una mesa o los comensales.";
    } else if (key === "bkName") {
      if (inputs.bkName.value.trim().length < 2) message = "Escribe tu nombre.";
    } else if (key === "bkPhone") {
      var v = inputs.bkPhone.value.trim();
      if (v && !/^[+0-9 ()-]{6,18}$/.test(v)) message = "Teléfono no válido.";
    } else if (key === "zona") {
      var checked = Array.prototype.some.call(zoneRadios, function (r) { return r.checked; });
      if (!checked) message = "Elige una zona o mesa en el plano.";
    } else if (key === "pago") {
      var payChecked = Array.prototype.some.call(payRadios, function (r) { return r.checked; });
      if (!payChecked) message = "Elige un método de pago.";
    }
    fieldError(el, elId, message);
    return !message;
  }

  if (bookingForm) {
    Object.keys(inputs).forEach(function (key) {
      var el = inputs[key];
      ["input", "change", "blur"].forEach(function (eventName) {
        el.addEventListener(eventName, function () { validateField(key); });
      });
    });
    zoneRadios.forEach(function (radio) {
      radio.addEventListener("change", function () { validateField("zona"); });
    });

    payRadios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        document.querySelectorAll(".pay-option").forEach(function (label) {
          label.classList.remove("is-selected");
        });
        if (radio.checked) {
          var label = radio.closest(".pay-option");
          if (label) label.classList.add("is-selected");
        }
        validateField("pago");
      });
    });

    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var keys = ["bkDate", "bkTime", "bkGuests", "zona", "pago", "bkName", "bkPhone"];
      var firstInvalid = null;
      keys.forEach(function (key) {
        if (!validateField(key) && !firstInvalid) firstInvalid = key;
      });
      if (firstInvalid) {
        var focusEl = inputs[firstInvalid];
        if (focusEl && focusEl.focus) focusEl.focus();
        return;
      }

      var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      var code = "FA-";
      for (var i = 0; i < 4; i++) {
        code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      resCodeEl.textContent = code;
      var payChosen = "";
      payRadios.forEach(function (r) { if (r.checked) payChosen = r.value; });
      if (resPayEl) resPayEl.textContent = payChosen;
      if (resOccEl) resOccEl.textContent = (bkOccasion && bkOccasion.value) ? bkOccasion.value : "Sin ocasión especial";
      bookingForm.hidden = true;
      bookingSuccess.hidden = false;
      bookingSuccess.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  }

  /* ---------- Progreso de scroll ---------- */
  var progressBar = document.getElementById("scrollProgress");
  var sectionIds = ["inicio", "historia", "cosecha", "menu", "galeria", "reservas", "contacto"];
  var spySections = sectionIds.map(function (id) {
    return document.getElementById(id);
  });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));

  function onScrollUI() {
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      progressBar.style.transform = "scaleX(" + pct + ")";
    }
    var pos = window.scrollY + window.innerHeight * 0.32;
    var current = sectionIds[0];
    spySections.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= pos) current = sectionIds[i];
    });
    navLinks.forEach(function (link) {
      var on = link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-current", on);
    });
  }

  if (progressBar || navLinks.length) {
    window.addEventListener("scroll", onScrollUI, { passive: true });
    window.addEventListener("resize", onScrollUI, { passive: true });
    onScrollUI();
  }

  /* ---------- Contadores animados ---------- */
  function animateStat(el) {
    var text = el.textContent;
    var match = text.match(/^([0-9.,]+)(.*)$/);
    if (!match) return;
    var target = parseFloat(match[1].replace(/\./g, "").replace(/,/g, "."));
    var suffix = match[2];
    var decimals = (match[1].split(/[.,]/)[1] || "").length;
    var duration = reduceMotion ? 0 : 1200;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var t = duration ? Math.min(1, (ts - start) / duration) : 1;
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      var out = decimals ? val.toFixed(decimals) : Math.round(val).toString();
      var int = out.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      var dec = decimals ? "," + out.split(".")[1] : "";
      el.textContent = int + dec + suffix;
      if (t < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll(".stat strong").forEach(function (s) {
      statObserver.observe(s);
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (hasFinePointer && !reduceMotion) {
    document.querySelectorAll(".btn--lg, .btn--sm").forEach(function (btn) {
      btn.classList.add("is-magnetic");
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = "translate(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Ambiente sonoro (Web Audio) ---------- */
  var audioToggle = document.getElementById("audioToggle");
  var audioPlayer = null;

  var CHORDS = [
    [110, 196, 261.63, 329.63],
    [130.81, 196, 261.63, 349.23],
    [164.81, 246.94, 329.63, 392],
    [146.83, 220, 293.66, 349.23]
  ];

  function startAmbient() {
    if (!audioPlayer) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioPlayer = {
        ctx: new AudioCtx(),
        activeOscs: [],
        chordTimer: null,
        noise: null
      };
      audioPlayer.master = audioPlayer.ctx.createGain();
      audioPlayer.master.gain.value = 0;
      audioPlayer.master.connect(audioPlayer.ctx.destination);

      var len = audioPlayer.ctx.sampleRate * 2;
      var buffer = audioPlayer.ctx.createBuffer(1, len, audioPlayer.ctx.sampleRate);
      var channel = buffer.getChannelData(0);
      for (var i = 0; i < len; i++) channel[i] = Math.random() * 2 - 1;
      var noiseSrc = audioPlayer.ctx.createBufferSource();
      noiseSrc.buffer = buffer;
      noiseSrc.loop = true;
      var noiseFilter = audioPlayer.ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 700;
      var noiseGain = audioPlayer.ctx.createGain();
      noiseGain.gain.value = 0.006;
      noiseSrc.connect(noiseFilter).connect(noiseGain).connect(audioPlayer.master);
      noiseSrc.start();
      audioPlayer.noise = noiseSrc;
    }

    var ctx = audioPlayer.ctx;
    if (ctx.state === "suspended") ctx.resume();

    var chordIdx = 0;

    function playChord() {
      var freqs = CHORDS[chordIdx % CHORDS.length];
      chordIdx++;
      freqs.forEach(function (freq) {
        var osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        var gain = ctx.createGain();
        var now = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.014, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);
        osc.connect(gain).connect(audioPlayer.master);
        osc.start(now);
        osc.stop(now + 5.4);
        audioPlayer.activeOscs.push(osc);
      });
    }

    playChord();
    audioPlayer.chordTimer = window.setInterval(playChord, 5200);
    audioPlayer.master.gain.setTargetAtTime(0.06, ctx.currentTime, 0.6);
  }

  function stopAmbient() {
    if (!audioPlayer) return;
    audioPlayer.activeOscs.forEach(function (osc) {
      try { osc.stop(); } catch (e) { /* ya detenido */ }
    });
    audioPlayer.activeOscs = [];
    window.clearInterval(audioPlayer.chordTimer);
    if (audioPlayer.noise) {
      try { audioPlayer.noise.stop(); } catch (e) { /* ya detenido */ }
    }
    audioPlayer.master.gain.setTargetAtTime(0.0001, audioPlayer.ctx.currentTime, 0.4);
    var ctx = audioPlayer.ctx;
    window.setTimeout(function () {
      if (ctx.state === "running") ctx.suspend();
    }, 700);
    audioPlayer = null;
  }

  if (audioToggle) {
    audioToggle.addEventListener("click", function () {
      var isPlaying = audioToggle.getAttribute("aria-pressed") === "true";
      if (isPlaying) {
        stopAmbient();
        audioToggle.setAttribute("aria-pressed", "false");
        audioToggle.setAttribute("aria-label", "Reproducir ambiente sonoro");
      } else {
        startAmbient();
        audioToggle.setAttribute("aria-pressed", "true");
        audioToggle.setAttribute("aria-label", "Silenciar ambiente sonoro");
      }
    });
  }
})();
