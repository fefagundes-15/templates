(function () {
  "use strict";

  // ============================================
  // LOADING SCREEN
  // ============================================
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
    }, 1000);
  }

  // ============================================
  // ANO ATUAL
  // ============================================
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // ============================================
  // MENU MOBILE ACESSÍVEL
  // ============================================
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-menu a");

  if (menuToggle && navMenu) {
    menuToggle.setAttribute("aria-expanded", "false");

    const toggleMenu = () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", !isExpanded);
      navMenu.classList.toggle("active");
      menuToggle.classList.toggle("active");

      if (!isExpanded && navLinks.length) {
        setTimeout(() => navLinks[0].focus(), 100);
      }
    };

    menuToggle.addEventListener("click", toggleMenu);

    menuToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Space") {
        e.preventDefault();
        toggleMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("active")) {
        toggleMenu();
        menuToggle.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("active") &&
        !navMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        toggleMenu();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("active")) {
          toggleMenu();
        }
      });
    });
  }

  // ============================================
  // ACTIVE MENU LINK ON SCROLL (APENAS UNDERLINE)
  // ============================================
  const sections = document.querySelectorAll("section[id]");
  const menuItems = document.querySelectorAll(".nav-menu a");

  function updateActiveMenu() {
    let current = "";
    const scrollPos = window.scrollY + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        current = section.getAttribute("id");
      }
    });

    menuItems.forEach((link) => {
      const href = link.getAttribute("href").substring(1);
      link.classList.remove("active");
      if (href === current) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveMenu);
  window.addEventListener("resize", updateActiveMenu);
  updateActiveMenu();

  // ============================================
  // SCROLL REVEAL ANIMATION
  // ============================================
  const revealElements = document.querySelectorAll(
    ".service-card, .differential-card, .about-image, .about-content, .testimonial-card",
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ============================================
  // STATS COUNTER ANIMATION
  // ============================================
  const stats = document.querySelectorAll(".hero-stat");
  let counted = false;

  function startCounters() {
    if (counted) return;

    stats.forEach((stat) => {
      const numberElement = stat.querySelector(".stat-number");
      const targetText = numberElement.textContent;
      const target = parseInt(targetText.replace(/[^0-9]/g, ""));

      if (isNaN(target)) return;

      let current = 0;
      const increment = target / 50;
      const duration = 1500;
      const stepTime = duration / 50;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          numberElement.textContent =
            "+" + Math.floor(current).toLocaleString();
          setTimeout(updateCounter, stepTime);
        } else {
          numberElement.textContent = "+" + target.toLocaleString();
        }
      };

      updateCounter();
    });

    counted = true;
  }

  const heroSection = document.querySelector(".hero-section");
  const heroObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !counted) {
        startCounters();
        heroObserver.disconnect();
      }
    },
    { threshold: 0.5 },
  );

  if (heroSection) heroObserver.observe(heroSection);

  // ============================================
  // TESTIMONIALS CARROSSEL (SEM CRIAÇÃO DE ELEMENTO DINÂMICO)
  // ============================================
  const carouselContainer = document.getElementById("carouselContainer");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");
  const dots = document.querySelectorAll(".dot");

  if (carouselContainer && prevBtn && nextBtn && dots.length) {
    const slides = document.querySelectorAll(".testimonial-card");
    const slideWidth = 100;
    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
      carouselContainer.style.transform = `translateX(-${currentIndex * slideWidth}%)`;

      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
        dot.setAttribute("aria-selected", index === currentIndex);
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateCarousel();
    }

    let autoPlayInterval;
    let isPlaying = true;

    function startAutoPlay() {
      if (autoPlayInterval) clearInterval(autoPlayInterval);
      autoPlayInterval = setInterval(() => {
        if (isPlaying) nextSlide();
      }, 5000);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    nextBtn.addEventListener("click", () => {
      stopAutoPlay();
      nextSlide();
      startAutoPlay();
    });

    prevBtn.addEventListener("click", () => {
      stopAutoPlay();
      prevSlide();
      startAutoPlay();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        stopAutoPlay();
        currentIndex = index;
        updateCarousel();
        startAutoPlay();
      });

      dot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Space") {
          e.preventDefault();
          stopAutoPlay();
          currentIndex = index;
          updateCarousel();
          startAutoPlay();
        }
      });
    });

    startAutoPlay();

    carouselContainer.addEventListener("mouseenter", () => {
      isPlaying = false;
    });
    carouselContainer.addEventListener("mouseleave", () => {
      isPlaying = true;
    });

    updateCarousel();
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", targetId);
      }
    });
  });

  // ============================================
  // SKIP TO CONTENT
  // ============================================
  const skipLink = document.querySelector(".skip-to-content");
  const mainContent = document.getElementById("main-content");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.removeAttribute("tabindex");
    });
  }

  // ============================================
  // TECLADO PARA BOTÕES
  // ============================================
  const allButtons = document.querySelectorAll(
    "button, .service-card, .differential-card",
  );

  allButtons.forEach((btn) => {
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Space") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ==========================================================================
  // ===== NOVAS FUNCIONALIDADES: CTA SUTIL + MODAL FLUTUANTE =====
  // ==========================================================================
  // (Adicionado sem conflito com o código original)

  // ---------- FORMULÁRIO DO CTA (com seletor de país e máscara) ----------
  const ctaForm = document.getElementById("contact-form");
  const ctaStatus = document.getElementById("form-status");
  const ctaCountrySelect = document.getElementById("country-code");
  const ctaPhoneInput = document.getElementById("phone");

  let currentCountryCode = "BR";
  let currentMaxLength = 15;

  function getMaxLengthForCountry(iso2) {
    const limits = {
      BR: 11,
      US: 10,
      PT: 9,
      GB: 10,
      DE: 11,
      FR: 9,
      IT: 10,
      ES: 9,
      AR: 10,
      MX: 10,
    };
    return limits[iso2] || 15;
  }

  function formatPhoneBR(digits) {
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  function formatPhoneInternational(digits) {
    if (typeof AsYouType === "undefined") return digits;
    const formatter = new AsYouType(currentCountryCode);
    return formatter.input(digits);
  }

  if (ctaPhoneInput) {
    ctaPhoneInput.addEventListener("input", function (e) {
      let digits = e.target.value.replace(/\D/g, "");
      if (digits.length > currentMaxLength)
        digits = digits.slice(0, currentMaxLength);
      let formatted =
        currentCountryCode === "BR"
          ? formatPhoneBR(digits)
          : formatPhoneInternational(digits);
      e.target.value = formatted;
    });

    ctaPhoneInput.addEventListener("keydown", function (e) {
      const allowed = [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ];
      if (allowed.includes(e.key)) return;
      if (e.ctrlKey || e.metaKey) return;
      if (!/^[0-9]$/.test(e.key)) e.preventDefault();
    });
  }

  async function loadCtaCountries() {
    try {
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,idd,cca2",
      );
      const countries = await res.json();
      const list = countries
        .filter((c) => c.idd?.root && c.idd?.suffixes?.length)
        .map((c) => {
          let dialCode;
          const iso = c.cca2;
          const usarApenasRoot = ["US", "CA", "RU", "KZ"];
          if (usarApenasRoot.includes(iso)) {
            dialCode = c.idd.root.replace("+", "");
          } else if (c.idd.suffixes.length === 1) {
            dialCode = (c.idd.root + c.idd.suffixes[0]).replace("+", "");
          } else {
            dialCode = c.idd.root.replace("+", "");
          }
          return { name: c.name.common, iso2: iso, dialCode };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      if (ctaCountrySelect) {
        ctaCountrySelect.innerHTML = "";
        list.forEach((c) => {
          const option = document.createElement("option");
          option.value = c.dialCode;
          option.textContent = `${c.name} (+${c.dialCode})`;
          option.dataset.iso2 = c.iso2;
          ctaCountrySelect.appendChild(option);
        });

        [...ctaCountrySelect.options].forEach((opt, i) => {
          if (opt.dataset.iso2 === "BR") ctaCountrySelect.selectedIndex = i;
        });

        currentMaxLength = getMaxLengthForCountry("BR");

        function updateSelectedText() {
          const selectedIndex = ctaCountrySelect.selectedIndex;
          const dialCode = ctaCountrySelect.options[selectedIndex]?.value;
          if (dialCode)
            ctaCountrySelect.options[selectedIndex].text = `+${dialCode}`;
        }

        ctaCountrySelect.addEventListener("change", function () {
          updateSelectedText();
          const iso =
            ctaCountrySelect.options[ctaCountrySelect.selectedIndex]?.dataset
              .iso2 || "BR";
          currentCountryCode = iso;
          currentMaxLength = getMaxLengthForCountry(iso);
          if (ctaPhoneInput) ctaPhoneInput.value = "";
        });
        ctaCountrySelect.addEventListener("blur", updateSelectedText);
        updateSelectedText();
      }
    } catch (err) {
      console.error("Erro ao carregar países do CTA:", err);
    }
  }

  if (ctaCountrySelect) loadCtaCountries();

  function validateForm(name, email, phone) {
    if (!/^[A-Za-zÀ-ÿ\s\-']+$/.test(name)) return "Nome inválido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido.";
    if (phone.replace(/\D/g, "").length < 8)
      return "Celular inválido (mínimo 8 dígitos).";
    return null;
  }

  if (ctaForm) {
    ctaForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phoneRaw = ctaPhoneInput ? ctaPhoneInput.value.trim() : "";
      const dialCode = ctaCountrySelect ? ctaCountrySelect.value : "55";
      const error = validateForm(name, email, phoneRaw);
      if (error) {
        if (ctaStatus) {
          ctaStatus.style.display = "block";
          ctaStatus.innerHTML = `❌ ${error}`;
          ctaStatus.style.color = "#e74c3c";
        }
        return;
      }
      const fullPhone = `+${dialCode}${phoneRaw.replace(/\D/g, "")}`;
      if (ctaStatus) {
        ctaStatus.style.display = "block";
        ctaStatus.innerHTML = "📧 Enviando...";
        ctaStatus.style.color = "#c8a87c";
      }

      // ===== EMAILJS - DESCOMENTAR EM PRODUÇÃO =====
      /*
      emailjs
        .send('service_7oqli5m', 'template_y7zwk4a', { name, email, phone: fullPhone })
        .then(() => {
          if (ctaStatus) {
            ctaStatus.innerHTML = '✅ Enviado com sucesso!';
            ctaStatus.style.color = '#2ecc71';
          }
          ctaForm.reset();
          if (ctaPhoneInput) ctaPhoneInput.value = '';
          setTimeout(() => { ctaStatus.style.display = 'none'; }, 3000);
        })
        .catch((err) => {
          if (ctaStatus) {
            ctaStatus.innerHTML = `❌ Erro ao enviar: ${err.text || err.message || 'verifique o console'}`;
            ctaStatus.style.color = '#e74c3c';
          }
        });
      */

      // ===== MODO DEMONSTRAÇÃO (REMOVER QUANDO EMAILJS FOR ATIVADO) =====
      console.log("Envio Dados:", {
        name,
        email,
        phone: fullPhone,
      });
      if (ctaStatus) {
        ctaStatus.innerHTML = "⚠️ Modo de demonstração – e-mail não enviado.";
        ctaStatus.style.color = "#f39c12";
        setTimeout(() => {
          ctaStatus.style.display = "none";
        }, 2000);
      }
      ctaForm.reset();
      if (ctaPhoneInput) ctaPhoneInput.value = "";
    });
  }

  // ---------- MODAL FLUTUANTE (com seletor de país e máscara) ----------
  const modalEl = document.getElementById("floatingModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalFormEl = document.getElementById("modal-contact-form");
  const modalStatusEl = document.getElementById("modal-form-status");
  const modalCountrySelect = document.getElementById("modal-country-code");
  const modalPhoneInput = document.getElementById("modal-phone");

  if (modalEl && modalFormEl && modalCountrySelect && modalPhoneInput) {
    let modalCurrentCountry = "BR";
    let modalMaxLength = 15;

    function getModalMaxLength(iso2) {
      const limits = {
        BR: 11,
        US: 10,
        PT: 9,
        GB: 10,
        DE: 11,
        FR: 9,
        IT: 10,
        ES: 9,
        AR: 10,
        MX: 10,
      };
      return limits[iso2] || 15;
    }

    function formatModalPhoneBR(digits) {
      if (!digits) return "";
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 6)
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 10)
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }

    function formatModalPhoneInternational(digits, countryCode) {
      if (typeof AsYouType === "undefined") return digits;
      const formatter = new AsYouType(countryCode);
      return formatter.input(digits);
    }

    function setupModalPhoneMask() {
      modalPhoneInput.addEventListener("input", function (e) {
        let digits = e.target.value.replace(/\D/g, "");
        if (digits.length > modalMaxLength)
          digits = digits.slice(0, modalMaxLength);
        let formatted =
          modalCurrentCountry === "BR"
            ? formatModalPhoneBR(digits)
            : formatModalPhoneInternational(digits, modalCurrentCountry);
        e.target.value = formatted;
      });
      modalPhoneInput.addEventListener("keydown", function (e) {
        const allowed = [
          "Backspace",
          "Delete",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ];
        if (allowed.includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/^[0-9]$/.test(e.key)) e.preventDefault();
      });
    }

    function setupModalSelectDisplay() {
      const originalTexts = [];
      for (let i = 0; i < modalCountrySelect.options.length; i++) {
        originalTexts[i] = modalCountrySelect.options[i].text;
      }
      function updateSelectedText() {
        const selectedIndex = modalCountrySelect.selectedIndex;
        const dialCode = modalCountrySelect.options[selectedIndex]?.value;
        if (dialCode)
          modalCountrySelect.options[selectedIndex].text = `+${dialCode}`;
      }
      function restoreOriginalTexts() {
        for (let i = 0; i < modalCountrySelect.options.length; i++) {
          modalCountrySelect.options[i].text = originalTexts[i];
        }
      }
      modalCountrySelect.addEventListener("mousedown", restoreOriginalTexts);
      modalCountrySelect.addEventListener("change", function () {
        updateSelectedText();
        const iso =
          modalCountrySelect.options[modalCountrySelect.selectedIndex]?.dataset
            .iso2 || "BR";
        modalCurrentCountry = iso;
        modalMaxLength = getModalMaxLength(iso);
        modalPhoneInput.value = "";
      });
      modalCountrySelect.addEventListener("blur", updateSelectedText);
      updateSelectedText();
    }

    async function loadModalCountries() {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd,cca2",
        );
        const countries = await res.json();
        const list = countries
          .filter((c) => c.idd?.root && c.idd?.suffixes?.length)
          .map((c) => {
            let dialCode;
            const iso = c.cca2;
            const usarApenasRoot = ["US", "CA", "RU", "KZ"];
            if (usarApenasRoot.includes(iso)) {
              dialCode = c.idd.root.replace("+", "");
            } else if (c.idd.suffixes.length === 1) {
              dialCode = (c.idd.root + c.idd.suffixes[0]).replace("+", "");
            } else {
              dialCode = c.idd.root.replace("+", "");
            }
            return { name: c.name.common, iso2: iso, dialCode };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        modalCountrySelect.innerHTML = "";
        list.forEach((c) => {
          const option = document.createElement("option");
          option.value = c.dialCode;
          option.textContent = `${c.name} (+${c.dialCode})`;
          option.dataset.iso2 = c.iso2;
          modalCountrySelect.appendChild(option);
        });

        for (let i = 0; i < modalCountrySelect.options.length; i++) {
          if (modalCountrySelect.options[i].dataset.iso2 === "BR") {
            modalCountrySelect.selectedIndex = i;
            break;
          }
        }
        modalCurrentCountry = "BR";
        modalMaxLength = getModalMaxLength("BR");
        setupModalSelectDisplay();
        setupModalPhoneMask();
      } catch (err) {
        console.error("Erro ao carregar países do modal:", err);
        const fallback = [
          { name: "Brasil", iso2: "BR", dialCode: "55" },
          { name: "Estados Unidos", iso2: "US", dialCode: "1" },
          { name: "Portugal", iso2: "PT", dialCode: "351" },
          { name: "Reino Unido", iso2: "GB", dialCode: "44" },
          { name: "Alemanha", iso2: "DE", dialCode: "49" },
        ];
        modalCountrySelect.innerHTML = "";
        fallback.forEach((c) => {
          const option = document.createElement("option");
          option.value = c.dialCode;
          option.textContent = `${c.name} (+${c.dialCode})`;
          option.dataset.iso2 = c.iso2;
          modalCountrySelect.appendChild(option);
        });
        modalCountrySelect.selectedIndex = 0;
        modalCurrentCountry = "BR";
        modalMaxLength = getModalMaxLength("BR");
        setupModalSelectDisplay();
        setupModalPhoneMask();
      }
    }

    loadModalCountries();

    modalFormEl.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("modal-name").value.trim();
      const email = document.getElementById("modal-email").value.trim();
      const phoneRaw = modalPhoneInput.value.trim();
      const dialCode = modalCountrySelect.value;

      if (!/^[A-Za-zÀ-ÿ\s\-']+$/.test(name)) {
        if (modalStatusEl) {
          modalStatusEl.innerHTML = "❌ Nome inválido.";
          modalStatusEl.style.color = "#e74c3c";
        }
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (modalStatusEl) {
          modalStatusEl.innerHTML = "❌ E-mail inválido.";
          modalStatusEl.style.color = "#e74c3c";
        }
        return;
      }
      if (phoneRaw.replace(/\D/g, "").length < 8) {
        if (modalStatusEl) {
          modalStatusEl.innerHTML = "❌ Celular inválido (mínimo 8 dígitos).";
          modalStatusEl.style.color = "#e74c3c";
        }
        return;
      }

      const fullPhone = `+${dialCode}${phoneRaw.replace(/\D/g, "")}`;
      if (modalStatusEl) {
        modalStatusEl.innerHTML = "📧 Enviando...";
        modalStatusEl.style.color = "#c8a87c";
      }

      // ===== EMAILJS - DESCOMENTAR EM PRODUÇÃO =====
      /*
      emailjs
        .send('service_7oqli5m', 'template_y7zwk4a', { name, email, phone: fullPhone })
        .then(() => {
          if (modalStatusEl) {
            modalStatusEl.innerHTML = '✅ Oferta enviada para seu e-mail!';
            modalStatusEl.style.color = '#2ecc71';
          }
          modalFormEl.reset();
          if (modalPhoneInput) modalPhoneInput.value = '';
          setTimeout(() => {
            modalStatusEl.style.display = 'none';
            modalEl.classList.remove('show');
          }, 2000);
        })
        .catch((err) => {
          if (modalStatusEl) {
            modalStatusEl.innerHTML = `❌ Erro: ${err.text || err.message || 'verifique o console'}`;
            modalStatusEl.style.color = '#e74c3c';
          }
        });
      */

      // ===== MODO DEMONSTRAÇÃO (REMOVER QUANDO EMAILJS FOR ATIVADO) =====
      console.log("Modal - Envio Dados:", {
        name,
        email,
        phone: fullPhone,
      });
      if (modalStatusEl) {
        modalStatusEl.innerHTML =
          "⚠️ Modo de demonstração – e-mail não enviado.";
        modalStatusEl.style.color = "#f39c12";
        setTimeout(() => {
          modalStatusEl.style.display = "none";
          modalEl.classList.remove("show");
        }, 2000);
      }
      modalFormEl.reset();
      if (modalPhoneInput) modalPhoneInput.value = "";
    });

    // Exibir modal após 7 segundos
    let modalShown = false;
    setTimeout(() => {
      if (!modalShown && modalEl) {
        modalShown = true;
        modalEl.classList.add("show");
        modalEl.setAttribute("aria-hidden", "false");
      }
    }, 7000);

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        modalEl.classList.remove("show");
        modalEl.setAttribute("aria-hidden", "true");
      });
    }
  }

  function updateActiveNavItem() {
    const navItems = document.querySelectorAll(".nav-item");
    const hubBtn = document.querySelector(".nav-hub-btn");
    const activeLink = Array.from(navItems).find(link => link.getAttribute("href") === "#");

    if (activeLink) {
      navItems.forEach(link => {
        if (link === activeLink) link.classList.add("active");
        else link.classList.remove("active");
      });
      if (hubBtn) hubBtn.classList.remove("active");
    } else {
      navItems.forEach(link => link.classList.remove("active"));
      if (hubBtn) hubBtn.classList.add("active");
    }
  }
  setTimeout(updateActiveNavItem, 100);
  window.addEventListener("popstate", updateActiveNavItem);
})();
