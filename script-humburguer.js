  // --- CONTROLE DO MENU HAMBÚRGUER MOBILE ---
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que o clique feche o menu imediatamente
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      
      // Altera o estado do atributo de acessibilidade e a classe do menu
      menuToggle.setAttribute("aria-expanded", !isExpanded);
      siteNav.classList.toggle("is-active");
    });

    // Fecha o menu automaticamente se o usuário clicar em qualquer lugar fora dele
    document.addEventListener("click", (e) => {
      if (!siteNav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.setAttribute("aria-expanded", "false");
        siteNav.classList.remove("is-active");
      }
    });
  }
