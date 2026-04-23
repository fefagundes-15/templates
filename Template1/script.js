document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ===== ANO AUTOMÁTICO NO FOOTER =====
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ===== MENU HAMBURGUER =====
  const toggleBtn = document.getElementById("navToggle");
  const navMenu = document.getElementById("navLinks");
  if (toggleBtn && navMenu) {
    function openMenu() {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.classList.add("active");
      navMenu.classList.add("open");
    }
    function closeMenu() {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.classList.remove("active");
      navMenu.classList.remove("open");
    }
    function toggleMenu() {
      navMenu.classList.contains("open") ? closeMenu() : openMenu();
    }
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("open")) closeMenu();
      });
    });
    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("open") &&
        !navMenu.contains(e.target) &&
        !toggleBtn.contains(e.target)
      )
        closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768 && navMenu.classList.contains("open"))
        closeMenu();
    });
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener("click", function (e) {
      const hash = this.getAttribute("href");
      const target = document.getElementById(hash.split("#")[1]);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, null, hash);
      }
    });
  });

  // ==================== PRELOADER ====================
  window.addEventListener('load', function () {
    setTimeout(function () {
      document.body.classList.add('loaded');
    }, 300);
  });

  // ===== PARALLAX =====
  const parallaxBgs = document.querySelectorAll(".parallax-bg");
  function updateParallax() {
    if (window.innerWidth <= 768) return;
    parallaxBgs.forEach((bg) => {
      const rect = bg.parentElement.getBoundingClientRect();
      const speed = parseFloat(bg.getAttribute("data-speed")) || 0.5;
      const translateY =
        (window.scrollY - (rect.top + window.scrollY)) * speed * 0.2;
      bg.style.transform = `translate3d(0, ${translateY}px, 0)`;
    });
  }

  const sections = document.querySelectorAll(".parallax-section");
  const navItems = document.querySelectorAll(".nav-links a");
  function handleScroll() {
    const scrollPos = window.scrollY + 180;
    sections.forEach((section) => {
      const top = section.offsetTop,
        height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        const id = section.getAttribute("id");
        navItems.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`)
            link.classList.add("active");
        });
      }
    });
    requestAnimationFrame(updateParallax);
    const nav = document.getElementById("nav");
    if (window.scrollY > 80) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // ===== COUNTERS =====
  const counters = document.querySelectorAll(".counter");
  function startCounters() {
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"));
      let current = 0;
      const update = () => {
        current += target / 60;
        if (current < target) {
          counter.innerText = Math.ceil(current);
          requestAnimationFrame(update);
        } else {
          counter.innerText = target;
        }
      };
      update();
    });
  }
  let counted = false;
  function observeStats() {
    const statsSection = document.querySelector("#gallery .stats-row");
    if (!statsSection) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        startCounters();
        observer.disconnect();
      }
    });
    observer.observe(statsSection);
  }
  observeStats();

  // ===== EMAILJS INICIALIZAÇÃO (descomentar em produção) =====
  // emailjs.init({ publicKey: "-kFsg9Mxuhe2mjLaK" });

  // ===== FORMULÁRIO PRINCIPAL (CTA) =====
  const form = document.getElementById("contact-form");
  const statusDiv = document.getElementById("form-status");
  const countrySelect = document.getElementById("country-code");
  const phoneInput = document.getElementById("phone");

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

  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      let digits = e.target.value.replace(/\D/g, "");
      if (digits.length > currentMaxLength)
        digits = digits.slice(0, currentMaxLength);
      let formatted =
        currentCountryCode === "BR"
          ? formatPhoneBR(digits)
          : formatPhoneInternational(digits);
      e.target.value = formatted;
    });
    phoneInput.addEventListener("keydown", function (e) {
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

  async function loadCountries() {
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
          if (usarApenasRoot.includes(iso))
            dialCode = c.idd.root.replace("+", "");
          else if (c.idd.suffixes.length === 1)
            dialCode = (c.idd.root + c.idd.suffixes[0]).replace("+", "");
          else dialCode = c.idd.root.replace("+", "");
          return { name: c.name.common, iso2: iso, dialCode };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      if (countrySelect) {
        countrySelect.innerHTML = "";
        list.forEach((c) => {
          const option = document.createElement("option");
          option.value = c.dialCode;
          option.textContent = `${c.name} (+${c.dialCode})`;
          option.dataset.iso2 = c.iso2;
          countrySelect.appendChild(option);
        });
        [...countrySelect.options].forEach((opt, i) => {
          if (opt.dataset.iso2 === "BR") countrySelect.selectedIndex = i;
        });
        currentMaxLength = getMaxLengthForCountry("BR");
        function updateSelectedText() {
          const selectedIndex = countrySelect.selectedIndex;
          const dialCode = countrySelect.options[selectedIndex]?.value;
          if (dialCode)
            countrySelect.options[selectedIndex].text = `+${dialCode}`;
        }
        countrySelect.addEventListener("change", function () {
          updateSelectedText();
          const iso =
            countrySelect.options[countrySelect.selectedIndex]?.dataset.iso2 ||
            "BR";
          currentCountryCode = iso;
          currentMaxLength = getMaxLengthForCountry(iso);
          if (phoneInput) phoneInput.value = "";
        });
        countrySelect.addEventListener("blur", updateSelectedText);
        updateSelectedText();
      }
    } catch (err) {
      console.error("Erro ao carregar países:", err);
    }
  }
  loadCountries();

  function validateForm(name, email, phone) {
    if (!/^[A-Za-zÀ-ÿ\s\-']+$/.test(name)) return "Nome inválido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido.";
    if (phone.replace(/\D/g, "").length < 8)
      return "Celular inválido (mínimo 8 dígitos).";
    return null;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phoneRaw = phoneInput ? phoneInput.value.trim() : "";
      const dialCode = countrySelect ? countrySelect.value : "55";
      const error = validateForm(name, email, phoneRaw);
      if (error) {
        if (statusDiv) {
          statusDiv.style.display = "block";
          statusDiv.innerHTML = `❌ ${error}`;
        }
        return;
      }
      const fullPhone = `+${dialCode}${phoneRaw.replace(/\D/g, "")}`;
      if (statusDiv) {
        statusDiv.style.display = "block";
        statusDiv.innerHTML = "📧 Enviando...";
      }

      // ===== EMAILJS - DESCOMENTAR EM PRODUÇÃO =====
      /*
      emailjs
        .send("service_7oqli5m", "template_y7zwk4a", { name, email, phone: fullPhone })
        .then(() => {
          if (statusDiv) statusDiv.innerHTML = "✅ Enviado com sucesso!";
          form.reset(); if (phoneInput) phoneInput.value = "";
          setTimeout(() => { statusDiv.style.display = "none"; }, 3000);
        })
        .catch((err) => {
          if (statusDiv) statusDiv.innerHTML = `❌ Erro ao enviar: ${err.text || err.message || "verifique o console"}`;
        });
      */

      // ===== MODO DEMONSTRAÇÃO (REMOVER QUANDO EMAILJS FOR ATIVADO) =====
      console.log("Envio desativado. Dados:", {
        name,
        email,
        phone: fullPhone,
      });
      if (statusDiv) {
        statusDiv.innerHTML = "⚠️ Modo de demonstração – e-mail não enviado.";
        setTimeout(() => {
          statusDiv.style.display = "none";
        }, 2000);
      }
      form.reset();
      if (phoneInput) phoneInput.value = "";
    });
  }

  // ===== MODAL FLUTUANTE =====
  const modal = document.getElementById("floatingModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalForm = document.getElementById("modal-contact-form");
  const modalStatus = document.getElementById("modal-form-status");
  const modalCountrySelect = document.getElementById("modal-country-code");
  const modalPhoneInput = document.getElementById("modal-phone");

  if (modal && modalForm && modalCountrySelect && modalPhoneInput) {
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
      for (let i = 0; i < modalCountrySelect.options.length; i++)
        originalTexts[i] = modalCountrySelect.options[i].text;
      function updateSelectedText() {
        const selectedIndex = modalCountrySelect.selectedIndex;
        const dialCode = modalCountrySelect.options[selectedIndex]?.value;
        if (dialCode)
          modalCountrySelect.options[selectedIndex].text = `+${dialCode}`;
      }
      function restoreOriginalTexts() {
        for (let i = 0; i < modalCountrySelect.options.length; i++)
          modalCountrySelect.options[i].text = originalTexts[i];
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
            if (usarApenasRoot.includes(iso))
              dialCode = c.idd.root.replace("+", "");
            else if (c.idd.suffixes.length === 1)
              dialCode = (c.idd.root + c.idd.suffixes[0]).replace("+", "");
            else dialCode = c.idd.root.replace("+", "");
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

    modalForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("modal-name").value.trim();
      const email = document.getElementById("modal-email").value.trim();
      const phoneRaw = modalPhoneInput.value.trim();
      const dialCode = modalCountrySelect.value;
      if (!/^[A-Za-zÀ-ÿ\s\-']+$/.test(name)) {
        if (modalStatus) {
          modalStatus.innerHTML = "❌ Nome inválido.";
          modalStatus.style.display = "block";
        }
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (modalStatus) {
          modalStatus.innerHTML = "❌ E-mail inválido.";
          modalStatus.style.display = "block";
        }
        return;
      }
      if (phoneRaw.replace(/\D/g, "").length < 8) {
        if (modalStatus) {
          modalStatus.innerHTML = "❌ Celular inválido (mínimo 8 dígitos).";
          modalStatus.style.display = "block";
        }
        return;
      }
      const fullPhone = `+${dialCode}${phoneRaw.replace(/\D/g, "")}`;
      if (modalStatus) {
        modalStatus.style.display = "block";
        modalStatus.innerHTML = "📧 Enviando...";
      }

      // ===== EMAILJS - DESCOMENTAR EM PRODUÇÃO =====
      /*
      emailjs
        .send("service_7oqli5m", "template_y7zwk4a", { name, email, phone: fullPhone })
        .then(() => {
          if (modalStatus) modalStatus.innerHTML = "✅ Oferta enviada para seu e-mail!";
          modalForm.reset(); if (modalPhoneInput) modalPhoneInput.value = "";
          setTimeout(() => { modalStatus.style.display = "none"; modal.classList.remove("show"); }, 2000);
        })
        .catch((err) => {
          if (modalStatus) modalStatus.innerHTML = `❌ Erro: ${err.text || err.message || "verifique o console"}`;
        });
      */

      // ===== MODO DEMONSTRAÇÃO (REMOVER QUANDO EMAILJS FOR ATIVADO) =====
      console.log("Modal - Envio desativado. Dados:", {
        name,
        email,
        phone: fullPhone,
      });
      if (modalStatus) {
        modalStatus.innerHTML = "⚠️ Modo de demonstração – e-mail não enviado.";
        setTimeout(() => {
          modalStatus.style.display = "none";
          modal.classList.remove("show");
        }, 2000);
      }
      modalForm.reset();
      if (modalPhoneInput) modalPhoneInput.value = "";
    });

    let modalShown = false;
    setTimeout(() => {
      if (!modalShown && modal) {
        modalShown = true;
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
      }
    }, 7000);
    if (closeModalBtn)
      closeModalBtn.addEventListener("click", () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
      });
  }

  // ==================== DESTAQUE DO ITEM ATIVO NO MENU HUB ====================
  function updateActiveNavItem() {
    const navItems = document.querySelectorAll(".nav-item");
    const hubBtn = document.querySelector(".nav-hub-btn");

    // Procura o primeiro link com href="#"
    const activeLink = Array.from(navItems).find(link => link.getAttribute("href") === "#");

    if (activeLink) {
      // Se existe um link com "#", ativa ele e desativa os outros
      navItems.forEach(link => {
        if (link === activeLink) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
      // Remove active do botão Início (hub)
      if (hubBtn) hubBtn.classList.remove("active");
    } else {
      // Nenhum "#" → estamos no hub: remove active de todos os nav-items e ativa o hub
      navItems.forEach(link => link.classList.remove("active"));
      if (hubBtn) hubBtn.classList.add("active");
    }
  }

  setTimeout(updateActiveNavItem, 100);
  window.addEventListener("popstate", updateActiveNavItem);
});
