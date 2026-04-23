(function () {
  "use strict";

  // ============================================
  // PRE LOADER
  // ============================================
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        preloader.classList.add("hide");
        setTimeout(function () {
          preloader.style.display = "none";
        }, 500);
      }, 800);
    });
  }

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      const expanded =
        navToggle.getAttribute("aria-expanded") === "true" ? false : true;
      navToggle.setAttribute("aria-expanded", expanded);
      mainNav.classList.toggle("show");
    });
  }

  // ============================================
  // NAVBAR SCROLL EFFECT & ACTIVE MENU
  // ============================================
  const navbar = document.getElementById("navbar");
  const menuLinks = document.querySelectorAll(".menu-link");
  const sections = document.querySelectorAll("section[id]");

  function updateActiveMenu() {
    let current = "";
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        current = section.getAttribute("id");
      }
    });

    menuLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href").substring(1);
      if (href === current) {
        link.classList.add("active");
      }
    });
  }

  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    updateActiveMenu();
  }

  window.addEventListener("scroll", handleNavbarScroll);
  handleNavbarScroll();

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  const smoothLinks = document.querySelectorAll(".smoothScroll, .menu-link");

  smoothLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const offset = 70;
          const targetPosition =
            target.getBoundingClientRect().top + window.pageYOffset - offset;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          if (mainNav && mainNav.classList.contains("show")) {
            mainNav.classList.remove("show");
            if (navToggle) {
              navToggle.setAttribute("aria-expanded", "false");
            }
          }
        }
      }
    });
  });

  // ============================================
  // SLIDER (DRAG/SWIPE)
  // ============================================
  const slidesWrapper = document.getElementById("slides-wrapper");
  const slides = document.querySelectorAll(".slide");
  const sliderDots = document.getElementById("slider-dots");
  let currentIndex = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  let slideInterval;
  let slideWidth = 0;

  if (slides.length > 0 && sliderDots && slidesWrapper) {
    slides.forEach(function (_, index) {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      if (index === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", `Ir para slide ${index + 1}`);
      dot.addEventListener("click", function () {
        goToSlide(index);
        resetInterval();
      });
      sliderDots.appendChild(dot);
    });

    function updateSlideWidth() {
      slideWidth = slides[0].getBoundingClientRect().width;
      slidesWrapper.style.transition = "none";
      goToSlide(currentIndex, true);
      setTimeout(() => {
        slidesWrapper.style.transition =
          "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      }, 50);
    }

    function goToSlide(index, noTransition = false) {
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;

      currentIndex = index;
      const translateX = -currentIndex * slideWidth;

      if (noTransition) {
        slidesWrapper.style.transition = "none";
      }
      slidesWrapper.style.transform = `translateX(${translateX}px)`;

      if (noTransition) {
        setTimeout(() => {
          slidesWrapper.style.transition =
            "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        }, 50);
      }

      const dots = document.querySelectorAll("#slider-dots .dot");
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
      });
    }

    function nextSlide() {
      let next = currentIndex + 1;
      if (next >= slides.length) next = 0;
      goToSlide(next);
    }

    function prevSlide() {
      let prev = currentIndex - 1;
      if (prev < 0) prev = slides.length - 1;
      goToSlide(prev);
    }

    function resetInterval() {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    }

    function onDragStart(e) {
      e.preventDefault();
      isDragging = true;
      startX = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;
      slidesWrapper.style.transition = "none";
    }

    function onDragMove(e) {
      if (!isDragging) return;
      currentX = e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
      const diff = currentX - startX;
      const translateX = -currentIndex * slideWidth + diff;
      slidesWrapper.style.transform = `translateX(${translateX}px)`;
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      slidesWrapper.style.transition =
        "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

      const diff = currentX - startX;
      const threshold = slideWidth * 0.2;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      } else {
        goToSlide(currentIndex);
      }

      resetInterval();
    }

    slidesWrapper.addEventListener("mousedown", onDragStart);
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
    slidesWrapper.addEventListener("touchstart", onDragStart);
    window.addEventListener("touchmove", onDragMove);
    window.addEventListener("touchend", onDragEnd);
    slidesWrapper.addEventListener("dragstart", (e) => e.preventDefault());

    window.addEventListener("resize", () => {
      updateSlideWidth();
    });

    try {
      updateSlideWidth();
      slideInterval = setInterval(nextSlide, 5000);
    } catch (error) {
      console.warn("Erro ao inicializar o slider:", error);
    }
  }

  // ============================================
  // TESTIMONIAL CAROUSEL
  // ============================================
  const testimonialItems = document.querySelectorAll(".testimonial-item");
  const testimonialDots = document.getElementById("testimonial-dots");
  const testimonialPrev = document.getElementById("testimonial-prev");
  const testimonialNext = document.getElementById("testimonial-next");
  let currentTestimonial = 0;
  let testimonialInterval;
  let isTestimonialTransitioning = false;

  if (testimonialItems.length > 0 && testimonialDots) {
    testimonialItems.forEach(function (_, index) {
      const dot = document.createElement("button");
      dot.classList.add("dot");
      if (index === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", `Ir para depoimento ${index + 1}`);
      dot.addEventListener("click", function () {
        if (!isTestimonialTransitioning) {
          goToTestimonial(index);
          resetTestimonialInterval();
        }
      });
      testimonialDots.appendChild(dot);
    });

    function goToTestimonial(index) {
      if (isTestimonialTransitioning) return;
      isTestimonialTransitioning = true;

      testimonialItems.forEach(function (item, i) {
        item.classList.remove("active");
        if (testimonialDots.children[i]) {
          testimonialDots.children[i].classList.remove("active");
        }
      });

      testimonialItems[index].classList.add("active");
      if (testimonialDots.children[index]) {
        testimonialDots.children[index].classList.add("active");
      }
      currentTestimonial = index;

      setTimeout(() => {
        isTestimonialTransitioning = false;
      }, 500);
    }

    function nextTestimonial() {
      if (isTestimonialTransitioning) return;
      let next = currentTestimonial + 1;
      if (next >= testimonialItems.length) next = 0;
      goToTestimonial(next);
    }

    function prevTestimonial() {
      if (isTestimonialTransitioning) return;
      let prev = currentTestimonial - 1;
      if (prev < 0) prev = testimonialItems.length - 1;
      goToTestimonial(prev);
    }

    function resetTestimonialInterval() {
      clearInterval(testimonialInterval);
      testimonialInterval = setInterval(nextTestimonial, 6000);
    }

    if (testimonialPrev) {
      testimonialPrev.addEventListener("click", function () {
        prevTestimonial();
        resetTestimonialInterval();
      });
    }

    if (testimonialNext) {
      testimonialNext.addEventListener("click", function () {
        nextTestimonial();
        resetTestimonialInterval();
      });
    }

    testimonialInterval = setInterval(nextTestimonial, 6000);
  }

  // ============================================
  // IMAGE POPUP (MODAL)
  // ============================================
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const modalCaption = document.getElementById("modal-caption");
  const modalClose = document.querySelector(".modal-close");
  const popupLinks = document.querySelectorAll(".image-popup");

  if (modal && modalImg && modalCaption && modalClose) {
    function openModal(imgSrc, title) {
      modalImg.src = imgSrc;
      modalCaption.textContent = title;
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
      modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
      modal.classList.remove("show");
      document.body.style.overflow = "";
      modal.setAttribute("aria-hidden", "true");
    }

    popupLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const imgSrc = this.getAttribute("href");
        const title = this.getAttribute("data-title") || "Imagem";
        openModal(imgSrc, title);
      });
    });

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("show")) {
        closeModal();
      }
    });
  }

  // ============================================
  // INTERSECTION OBSERVER (SCROLL ANIMATION)
  // ============================================
  const animatedElements = document.querySelectorAll(
    ".about-info, .about-image, .team-card, .menu-thumb",
  );

  if (animatedElements.length > 0) {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach((el) => {
      observer.observe(el);
    });
  }

  // ============================================
  // PARALLAX EFFECT NO TESTIMONIAL
  // ============================================
  const testimonialSection = document.getElementById("testimonial");

  if (testimonialSection) {
    function handleParallax() {
      const scrollPosition = window.scrollY;
      const sectionTop = testimonialSection.offsetTop;
      const windowHeight = window.innerHeight;

      if (scrollPosition + windowHeight > sectionTop) {
        const parallaxValue = (scrollPosition - sectionTop) * 0.3;
        testimonialSection.style.backgroundPositionY = `${parallaxValue}px`;
      }
    }

    window.addEventListener("scroll", handleParallax);
    handleParallax();
  }

  // ============================================
  // FECHAR MENU AO CLICAR FORA (ACESSIBILIDADE)
  // ============================================
  document.addEventListener("click", function (e) {
    if (mainNav && mainNav.classList.contains("show")) {
      const isClickInsideNav = mainNav.contains(e.target);
      const isClickOnToggle = navToggle && navToggle.contains(e.target);

      if (!isClickInsideNav && !isClickOnToggle) {
        mainNav.classList.remove("show");
        if (navToggle) {
          navToggle.setAttribute("aria-expanded", "false");
        }
      }
    }
  });

  // ==========================================================================
  // ===== DESTAQUE DO ITEM ATIVO NO MENU HUB =====
  // ==========================================================================
  function updateActiveNavItem() {
    const navItems = document.querySelectorAll(".nav-item");
    const hubBtn = document.querySelector(".nav-hub-btn");

    // Procura o primeiro link com href="#"
    const activeLink = Array.from(navItems).find(
      (link) => link.getAttribute("href") === "#"
    );

    if (activeLink) {
      // Ativa o link com "#" e desativa os outros
      navItems.forEach((link) => {
        if (link === activeLink) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
      // Remove active do botão Início (hub)
      if (hubBtn) hubBtn.classList.remove("active");
    } else {
      // Nenhum "#" → estamos no hub: remove active de todos e ativa o hub
      navItems.forEach((link) => link.classList.remove("active"));
      if (hubBtn) hubBtn.classList.add("active");
    }
  }

  setTimeout(updateActiveNavItem, 100);
  window.addEventListener("popstate", updateActiveNavItem);

  // ==========================================================================
  // ===== NOVAS FUNCIONALIDADES: CTA SUTIL + MODAL FLUTUANTE =====
  // ==========================================================================
  // (Adicionado com segurança - verifica se os elementos existem antes de usar)

  try {
    // ---------- FORMULÁRIO DO CTA ----------
    const ctaForm = document.getElementById("cta-form");
    const ctaStatus = document.getElementById("cta-form-status");
    const ctaCountrySelect = document.getElementById("cta-country-code");
    const ctaPhoneInput = document.getElementById("cta-phone");

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
      if (digits.length <= 6)
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
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
      if (!ctaCountrySelect) return;
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
        const name = document.getElementById("cta-name").value.trim();
        const email = document.getElementById("cta-email").value.trim();
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
          ctaStatus.style.color = "#ce3232";
        }

        // ===== EMAILJS - DESCOMENTAR EM PRODUÇÃO =====
        /*
        emailjs
          .send("service_7oqli5m", "template_y7zwk4a", { name, email, phone: fullPhone })
          .then(() => {
            if (ctaStatus) {
              ctaStatus.innerHTML = "✅ Enviado com sucesso!";
              ctaStatus.style.color = "#2ecc71";
            }
            ctaForm.reset();
            if (ctaPhoneInput) ctaPhoneInput.value = "";
            setTimeout(() => { ctaStatus.style.display = "none"; }, 3000);
          })
          .catch((err) => {
            if (ctaStatus) {
              ctaStatus.innerHTML = `❌ Erro ao enviar: ${err.text || err.message || "verifique o console"}`;
              ctaStatus.style.color = "#e74c3c";
            }
          });
        */

        // ===== MODO DEMONSTRAÇÃO =====
        console.log("CTA - Envio desativado. Dados:", {
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

    // ---------- MODAL FLUTUANTE ----------
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
            modalCountrySelect.options[modalCountrySelect.selectedIndex]
              ?.dataset.iso2 || "BR";
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
          // Fallback manual
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
          modalStatusEl.style.color = "#ce3232";
        }

        // ===== EMAILJS - DESCOMENTAR EM PRODUÇÃO =====
        /*
        emailjs
          .send("service_7oqli5m", "template_y7zwk4a", { name, email, phone: fullPhone })
          .then(() => {
            if (modalStatusEl) {
              modalStatusEl.innerHTML = "✅ Oferta enviada para seu e-mail!";
              modalStatusEl.style.color = "#2ecc71";
            }
            modalFormEl.reset();
            if (modalPhoneInput) modalPhoneInput.value = "";
            setTimeout(() => {
              modalStatusEl.style.display = "none";
              modalEl.classList.remove("show");
            }, 2000);
          })
          .catch((err) => {
            if (modalStatusEl) {
              modalStatusEl.innerHTML = `❌ Erro: ${err.text || err.message || "verifique o console"}`;
              modalStatusEl.style.color = "#e74c3c";
            }
          });
        */

        // ===== MODO DEMONSTRAÇÃO =====
        console.log("Modal - Envio desativado. Dados:", {
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
  } catch (error) {
    console.warn("Erro ao inicializar funcionalidades adicionais:", error);
  }
})();