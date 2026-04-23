(function () {
  "use strict";

  // ==================== ANO DINÂMICO ====================
  const yearSpan = document.querySelectorAll(".year");
  const currentYear = new Date().getFullYear();
  yearSpan.forEach(el => {
    el.textContent = currentYear;
  });

  // ==================== ELEMENTOS ====================
  const floatingPreview = document.querySelector(".floating-preview");
  const previewImg = floatingPreview?.querySelector("img");
  const projectCards = document.querySelectorAll(".project-item");

  // ==================== PREVIEW FLUTUANTE (DESKTOP APENAS) ====================
  let activeCard = null;
  let previewTimeout = null;
  let currentMouseY = window.innerHeight / 2;

  function updatePreviewPosition(clientY) {
    if (!floatingPreview || !floatingPreview.classList.contains("is-visible"))
      return;
    const previewHeight = floatingPreview.offsetHeight;
    const viewportHeight = window.innerHeight;
    let top = clientY - previewHeight / 2;
    top = Math.max(10, Math.min(top, viewportHeight - previewHeight - 10));
    floatingPreview.style.top = `${top}px`;
  }

  function showPreview(card, mouseY) {
    if (window.innerWidth < 1024) return;
    const previewSrc = card.getAttribute("data-preview-img");
    if (!previewSrc) return;
    if (previewImg) previewImg.src = previewSrc;
    if (floatingPreview) {
      floatingPreview.classList.add("is-visible");
      updatePreviewPosition(mouseY);
    }
    if (activeCard && activeCard !== card)
      activeCard.classList.remove("is-active");
    activeCard = card;
    card.classList.add("is-active");
  }

  function hidePreview() {
    if (previewTimeout) clearTimeout(previewTimeout);
    if (floatingPreview) floatingPreview.classList.remove("is-visible");
    if (activeCard) activeCard.classList.remove("is-active");
    activeCard = null;
  }

  document.addEventListener("mousemove", (e) => {
    currentMouseY = e.clientY;
    if (floatingPreview && floatingPreview.classList.contains("is-visible")) {
      updatePreviewPosition(currentMouseY);
    }
  });

  // ==================== PRELOADER (tela de carregamento) ====================
  window.addEventListener('load', function () {
    // Pequeno atraso opcional para garantir animação suave
    setTimeout(function () {
      document.body.classList.add('loaded');
    }, 300);
  });


  // ==================== COMPORTAMENTO DOS CARDS ====================
  const isDesktop = () => window.innerWidth >= 1024;

  if (isDesktop()) {
    // Desktop: hover ativa preview, clique abre o link
    projectCards.forEach((card) => {
      const link =
        card.getAttribute("data-link") ||
        card.querySelector(".project-link")?.getAttribute("href");
      if (!link) return;

      card.addEventListener("mouseenter", (e) => {
        if (previewTimeout) clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => showPreview(card, currentMouseY), 80);
      });
      card.addEventListener("mouseleave", () => {
        if (previewTimeout) clearTimeout(previewTimeout);
        hidePreview();
      });
      card.addEventListener("click", (e) => {
        if (e.target.closest(".project-link")) return;
        if (link) window.open(link, "_blank");
      });
    });
  } else {
    // Mobile/Tablet: clique fora do botão apenas alterna a classe is-active
    projectCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".project-link")) return;
        e.preventDefault();
        projectCards.forEach((c) => c.classList.remove("is-active"));
        card.classList.add("is-active");
      });
    });
  }

  // ==================== INDICADOR DE MENU ATIVO (opcional, apenas para feedback visual no desktop) ====================
  function updateActiveNavItem() {
    if (window.innerWidth < 1024) return;
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-item");
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && currentPath.endsWith(href)) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
    // Hub (índice) fica ativo quando na raiz
    const hubBtn = document.querySelector(".nav-hub-btn");
    if (
      hubBtn &&
      (currentPath === "/" ||
        currentPath.endsWith("index.html") ||
        currentPath === "")
    ) {
      hubBtn.classList.add("active");
    } else if (hubBtn) {
      hubBtn.classList.remove("active");
    }
  }

  // Pequeno atraso para garantir que o DOM está pronto
  setTimeout(updateActiveNavItem, 100);
  window.addEventListener("popstate", updateActiveNavItem);
})();
