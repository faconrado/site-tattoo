document.addEventListener("DOMContentLoaded", () => {
  // --- CONTROLE DO MENU HAMBÚRGUER MOBILE ---
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", !isExpanded);
      siteNav.classList.toggle("is-active");
    });

    document.addEventListener("click", (e) => {
      if (!siteNav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.setAttribute("aria-expanded", "false");
        siteNav.classList.remove("is-active");
      }
    });
  }

  
  // --- CONTROLE DO DROPDOWN ---
  const dropdown = document.querySelector(".dropdown");
  const toggle = document.querySelector(".dropdown__toggle");
  const menu = document.querySelector(".dropdown__menu");

  if (dropdown && toggle && menu) {
    toggle.setAttribute("aria-expanded", "false");

    function openMenu() {
      dropdown.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      dropdown.classList.contains("is-open") ? closeMenu() : openMenu();
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });
  }
});

// --- EFEITO SCROLL NO HEADER ---
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 20) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

// --- LIGHTBOX DA GALERIA ---
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector("#featured-gallery");
  const lightbox = document.querySelector("#lightbox");
  const imgEl = document.querySelector(".lightbox__img");
  const capEl = document.querySelector(".lightbox__caption");
  const btnPrev = document.querySelector(".lightbox__prev");
  const btnNext = document.querySelector(".lightbox__next");

  if (!gallery || !lightbox || !imgEl) return;

  const items = Array.from(gallery.querySelectorAll(".tile"));
  let currentIndex = -1;
  let lastFocus = null;

  function setImage(index) {
    const tile = items[index];
    if (!tile) return;

    const full = tile.getAttribute("data-full") || tile.getAttribute("href");
    const alt = tile.getAttribute("data-alt") || tile.querySelector("img")?.alt || "";

    imgEl.src = full;
    imgEl.alt = alt;
    if (capEl) capEl.textContent = alt;

    currentIndex = index;
  }

  function openLightbox(index, focusFrom) {
    lastFocus = focusFrom || document.activeElement;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");
    setImage(index);

    const closeBtn = lightbox.querySelector("[data-close]");
    closeBtn?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");
    imgEl.src = "";
    imgEl.alt = "";
    if (capEl) capEl.textContent = "";
    currentIndex = -1;
  }

  function next() {
    if (currentIndex < 0) return;
    setImage((currentIndex + 1) % items.length);
  }

  function prev() {
    if (currentIndex < 0) return;
    setImage((currentIndex - 1 + items.length) % items.length);
  }

  gallery.addEventListener("click", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;

    e.preventDefault();
    const index = items.indexOf(tile);
    if (index >= 0) openLightbox(index, tile);
  });

  btnNext?.addEventListener("click", next);
  btnPrev?.addEventListener("click", prev);

  lightbox.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || e.target.classList.contains("lightbox__backdrop")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
});
