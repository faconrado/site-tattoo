const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
    return;
  }

  callback();
};

function initAOS() {
  if (!window.AOS) return;

  window.AOS.init({
    duration: 800,
    once: true,
    offset: 100,
  });
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  if (!menuToggle || !siteNav) return;

  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("is-active", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
  };

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });
}

function initGalleryLightbox() {
  const galleries = document.querySelectorAll(".gallery");
  const lightbox = document.querySelector("#lightbox");
  const imgEl = document.querySelector(".lightbox__img");
  const capEl = document.querySelector(".lightbox__caption");
  const btnPrev = document.querySelector(".lightbox__prev");
  const btnNext = document.querySelector(".lightbox__next");

  if (!galleries.length || !lightbox || !imgEl) return;

  let activeGallery = null;
  let currentIndex = -1;
  let lastFocus = null;

  const getItems = () => {
    if (!activeGallery) return [];
    return Array.from(activeGallery.querySelectorAll(".tile"));
  };

  const updateNavigation = () => {
    const hasMultipleItems = getItems().length > 1;
    btnPrev?.toggleAttribute("disabled", !hasMultipleItems);
    btnNext?.toggleAttribute("disabled", !hasMultipleItems);
  };

  const setImage = (index) => {
    const items = getItems();
    const tile = items[index];
    if (!tile) return;

    const full = tile.getAttribute("data-full") || tile.getAttribute("href");
    const alt = tile.getAttribute("data-alt") || tile.querySelector("img")?.alt || "";

    imgEl.src = full;
    imgEl.alt = alt;
    if (capEl) capEl.textContent = alt;

    currentIndex = index;
    updateNavigation();
  };

  const openLightbox = (gallery, index, focusFrom) => {
    activeGallery = gallery;
    lastFocus = focusFrom || document.activeElement;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");

    setImage(index);
    lightbox.querySelector("[data-close]")?.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");

    imgEl.removeAttribute("src");
    imgEl.alt = "";
    if (capEl) capEl.textContent = "";

    currentIndex = -1;
    activeGallery = null;

    if (lastFocus instanceof HTMLElement) lastFocus.focus();
    lastFocus = null;
  };

  const showNext = () => {
    const items = getItems();
    if (!items.length || currentIndex < 0) return;
    setImage((currentIndex + 1) % items.length);
  };

  const showPrevious = () => {
    const items = getItems();
    if (!items.length || currentIndex < 0) return;
    setImage((currentIndex - 1 + items.length) % items.length);
  };

  galleries.forEach((gallery) => {
    gallery.addEventListener("click", (event) => {
      const tile = event.target.closest(".tile");
      if (!tile || !gallery.contains(tile)) return;

      event.preventDefault();

      activeGallery = gallery;
      const index = getItems().indexOf(tile);
      if (index >= 0) openLightbox(gallery, index, tile);
    });
  });

  btnNext?.addEventListener("click", showNext);
  btnPrev?.addEventListener("click", showPrevious);

  lightbox.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]") || event.target.classList.contains("lightbox__backdrop")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showNext();
    if (event.key === "ArrowLeft") showPrevious();
  });
}

onReady(() => {
  initAOS();
  initHeaderScroll();
  initMobileMenu();
  initGalleryLightbox();
});
