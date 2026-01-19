// script.js
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.querySelector(".dropdown");
  const toggle = document.querySelector(".dropdown__toggle");
  const menu = document.querySelector(".dropdown__menu");

  if (!dropdown || !toggle || !menu) return;

  // Acessibilidade mínima
  toggle.setAttribute("aria-expanded", "false");

  function openMenu() {
    dropdown.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    dropdown.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function isOpen() {
    return dropdown.classList.contains("is-open");
  }

  // Toggle no clique
  toggle.addEventListener("click", (e) => {
    e.preventDefault(); // evita o href="#"
    isOpen() ? closeMenu() : openMenu();
  });

  // Fecha ao clicar fora
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) closeMenu();
  });

  // Fecha no ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Fecha ao clicar em um item (opcional, mas bom)
  menu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) closeMenu();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  function onScroll() {
    // 20px é um ponto bom, pode ajustar
    if (window.scrollY > 20) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

/* ===============================Cicatrizadas============================================== */

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector("#featured-gallery");
  const lightbox = document.querySelector("#lightbox");
  const imgEl = document.querySelector(".lightbox__img");
  const capEl = document.querySelector(".lightbox__caption");
  const btnPrev = document.querySelector(".lightbox__prev");
  const btnNext = document.querySelector(".lightbox__next");

  if (!gallery || !lightbox || !imgEl) return;

  // 1) lista “linear” de itens clicáveis (ordem do DOM)
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

    // move foco para o modal (acessibilidade)
    const closeBtn = lightbox.querySelector("[data-close]");
    closeBtn?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");

    // volta foco para quem abriu
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }

    // limpa src pra não manter download/decodificação ativa
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

  // 2) Clique nos tiles abre o modal
  gallery.addEventListener("click", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;

    e.preventDefault(); // evita abrir a imagem como página
    const index = items.indexOf(tile);
    if (index >= 0) openLightbox(index, tile);
  });

  // 3) Botões
  btnNext?.addEventListener("click", next);
  btnPrev?.addEventListener("click", prev);

  // 4) Fechar: clique no backdrop ou no X
  lightbox.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (close) closeLightbox();
  });

  // 5) Teclado: ESC / setas
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
});


/* ============================================================================= */
