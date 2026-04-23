(function () {
  "use strict";

  // ==========================================================================
  // ANO ATUAL NO FOOTER
  // ==========================================================================
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ==========================================================================
  // MENU HAMBURGUER (MOBILE)
  // ==========================================================================
  const toggleBtn = document.getElementById("navToggle");
  const navMenu = document.getElementById("tmNav");

  if (toggleBtn && navMenu) {
    const openMenu = () => {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.classList.add("active");
      navMenu.classList.add("active");
    };

    const closeMenu = () => {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.classList.remove("active");
      navMenu.classList.remove("active");
    };

    const toggleMenu = () => {
      if (navMenu.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    toggleBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("active")) closeMenu();
      });
    });

    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("active") &&
        !navMenu.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024 && navMenu.classList.contains("active")) {
        closeMenu();
      }
    });
  }

  // ==========================================================================
  // SMOOTH SCROLL PARA LINKS INTERNOS
  // ==========================================================================
  const smoothLinks = document.querySelectorAll('a[href*="#"]:not([href="#"])');
  smoothLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      const targetId = hash.split("#")[1];
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, null, hash);
      }
    });
  });

  // ==========================================================================
  // PRELOADER
  // ==========================================================================
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });

  // ==========================================================================
  // BACK TO TOP BUTTON
  // ==========================================================================
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      backToTopBtn.classList.toggle("show", window.scrollY > 300);
    });

    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ==========================================================================
  // FUNÇÕES AUXILIARES (compartilhadas entre formulários)
  // ==========================================================================
  const getMaxLengthForCountry = (iso2) => {
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
  };

  const formatPhoneBR = (digits) => {
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const formatPhoneInternational = (digits, countryCode) => {
    if (typeof AsYouType === "undefined") return digits;
    const formatter = new AsYouType(countryCode);
    return formatter.input(digits);
  };

  // Configuração do seletor de países (exibe apenas o código após seleção)
  const setupCountrySelect = (selectElement, onCountryChange) => {
    if (!selectElement) return;
    const originalTexts = [];
    for (let i = 0; i < selectElement.options.length; i++) {
      originalTexts[i] = selectElement.options[i].text;
    }

    const updateSelectedText = () => {
      const selectedIndex = selectElement.selectedIndex;
      const dialCode = selectElement.options[selectedIndex]?.value;
      if (dialCode) {
        selectElement.options[selectedIndex].text = `+${dialCode}`;
      }
    };

    const restoreOriginalTexts = () => {
      for (let i = 0; i < selectElement.options.length; i++) {
        selectElement.options[i].text = originalTexts[i];
      }
    };

    selectElement.addEventListener("mousedown", restoreOriginalTexts);
    selectElement.addEventListener("change", () => {
      updateSelectedText();
      const iso =
        selectElement.options[selectElement.selectedIndex]?.dataset.iso2 ||
        "BR";
      if (onCountryChange) onCountryChange(iso);
    });
    selectElement.addEventListener("blur", updateSelectedText);
    updateSelectedText();
  };

  // Carregar lista de países via API Rest Countries
  const loadCountries = async (selectElement, onLoadCallback) => {
    if (!selectElement) return;
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

      selectElement.innerHTML = "";
      list.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.dialCode;
        option.textContent = `${c.name} (+${c.dialCode})`;
        option.dataset.iso2 = c.iso2;
        selectElement.appendChild(option);
      });

      // Seleciona Brasil por padrão
      [...selectElement.options].forEach((opt, i) => {
        if (opt.dataset.iso2 === "BR") selectElement.selectedIndex = i;
      });

      if (onLoadCallback) onLoadCallback(list);
    } catch (err) {
      console.error("Erro ao carregar países:", err);
    }
  };

  // Máscara de telefone
  const setupPhoneMask = (inputElement, getCountryCode, getMaxLength) => {
    if (!inputElement) return;

    inputElement.addEventListener("input", (e) => {
      let digits = e.target.value.replace(/\D/g, "");
      const maxLen = getMaxLength();
      if (digits.length > maxLen) digits = digits.slice(0, maxLen);

      let formatted;
      if (getCountryCode() === "BR") {
        formatted = formatPhoneBR(digits);
      } else {
        formatted = formatPhoneInternational(digits, getCountryCode());
      }
      e.target.value = formatted;
    });

    inputElement.addEventListener("keydown", (e) => {
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

    inputElement.addEventListener("blur", () => {
      if (typeof parsePhoneNumber !== "undefined") {
        try {
          const parsed = parsePhoneNumber(inputElement.value, getCountryCode());
          if (parsed?.isValid()) {
            inputElement.value = parsed.formatInternational();
          }
        } catch {
          // ignora erro silenciosamente
        }
      }
    });
  };

  // Validação genérica para nome, email, telefone
  const validateForm = (name, email, phone) => {
    if (!/^[A-Za-zÀ-ÿ\s\-']+$/.test(name)) return "Nome inválido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido.";
    if (phone.replace(/\D/g, "").length < 8)
      return "Celular inválido (mínimo 8 dígitos).";
    return null;
  };

  // ==========================================================================
  // FORMULÁRIO DO CTA (Receba Ofertas)
  // ==========================================================================
  const ctaForm = document.getElementById("cta-form");
  const ctaStatus = document.getElementById("cta-form-status");
  const ctaCountrySelect = document.getElementById("cta-country-code");
  const ctaPhoneInput = document.getElementById("cta-phone");

  if (ctaForm && ctaCountrySelect && ctaPhoneInput) {
    let ctaCurrentCountry = "BR";
    let ctaMaxLength = 15;

    // Carrega países e configura o select
    loadCountries(ctaCountrySelect, () => {
      ctaMaxLength = getMaxLengthForCountry("BR");
      setupCountrySelect(ctaCountrySelect, (iso) => {
        ctaCurrentCountry = iso;
        ctaMaxLength = getMaxLengthForCountry(iso);
        ctaPhoneInput.value = "";
      });
    });

    // Configura máscara do telefone
    setupPhoneMask(
      ctaPhoneInput,
      () => ctaCurrentCountry,
      () => ctaMaxLength,
    );

    // Submit do formulário CTA
    ctaForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("cta-name").value.trim();
      const email = document.getElementById("cta-email").value.trim();
      const phoneRaw = ctaPhoneInput.value.trim();
      const dialCode = ctaCountrySelect.value;

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
        ctaStatus.style.color = "#c79c60";
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

      // ===== MODO DEMONSTRAÇÃO - COMENTAR EM PRODUÇÃO =====
      console.log("Formulário CTA - Envio Dados:", {
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

  // ==========================================================================
  // FORMULÁRIO PRINCIPAL (contact-form)
  // ==========================================================================
  const form = document.getElementById("contact-form");
  const statusDiv = document.getElementById("form-status");
  const countrySelect = document.getElementById("country-code");
  const phoneInput = document.getElementById("phone");

  if (form && countrySelect && phoneInput) {
    let currentCountryCode = "BR";
    let currentMaxLength = 15;

    loadCountries(countrySelect, () => {
      currentMaxLength = getMaxLengthForCountry("BR");
      setupCountrySelect(countrySelect, (iso) => {
        currentCountryCode = iso;
        currentMaxLength = getMaxLengthForCountry(iso);
        phoneInput.value = "";
      });
    });

    setupPhoneMask(
      phoneInput,
      () => currentCountryCode,
      () => currentMaxLength,
    );

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phoneRaw = phoneInput.value.trim();
      const dialCode = countrySelect.value;

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
          form.reset();
          if (phoneInput) phoneInput.value = "";
          setTimeout(() => { statusDiv.style.display = "none"; }, 3000);
        })
        .catch((err) => {
          if (statusDiv) statusDiv.innerHTML = `❌ Erro ao enviar: ${err.text || err.message || "verifique o console"}`;
        });
      */

      // ===== MODO DEMONSTRAÇÃO - COMENTAR EM PRODUÇÃO =====
      console.log("Formulário principal - Envio Dados:", {
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

  // ==========================================================================
  // MODAL FLUTUANTE
  // ==========================================================================
  const modal = document.getElementById("floatingModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalForm = document.getElementById("modal-contact-form");
  const modalStatus = document.getElementById("modal-form-status");
  const modalCountrySelect = document.getElementById("modal-country-code");
  const modalPhoneInput = document.getElementById("modal-phone");

  if (modal && modalForm && modalCountrySelect && modalPhoneInput) {
    let modalCurrentCountry = "BR";
    let modalMaxLength = 15;

    loadCountries(modalCountrySelect, () => {
      modalMaxLength = getMaxLengthForCountry("BR");
      setupCountrySelect(modalCountrySelect, (iso) => {
        modalCurrentCountry = iso;
        modalMaxLength = getMaxLengthForCountry(iso);
        modalPhoneInput.value = "";
      });
      setupPhoneMask(
        modalPhoneInput,
        () => modalCurrentCountry,
        () => modalMaxLength,
      );
    });

    modalForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("modal-name").value.trim();
      const email = document.getElementById("modal-email").value.trim();
      const phoneRaw = modalPhoneInput.value.trim();
      const dialCode = modalCountrySelect.value;

      const error = validateForm(name, email, phoneRaw);
      if (error) {
        if (modalStatus) {
          modalStatus.innerHTML = `❌ ${error}`;
          modalStatus.style.display = "block";
          modalStatus.style.color = "#e74c3c";
        }
        return;
      }

      const fullPhone = `+${dialCode}${phoneRaw.replace(/\D/g, "")}`;
      if (modalStatus) {
        modalStatus.style.display = "block";
        modalStatus.innerHTML = "📧 Enviando...";
        modalStatus.style.color = "#c79c60";
      }

      // ===== EMAILJS - DESCOMENTAR EM PRODUÇÃO =====
      /*
      emailjs
        .send("service_7oqli5m", "template_y7zwk4a", { name, email, phone: fullPhone })
        .then(() => {
          if (modalStatus) {
            modalStatus.innerHTML = "✅ Oferta enviada para seu e-mail!";
            modalStatus.style.color = "#2ecc71";
          }
          modalForm.reset();
          if (modalPhoneInput) modalPhoneInput.value = "";
          setTimeout(() => {
            modalStatus.style.display = "none";
            modal.classList.remove("show");
          }, 2000);
        })
        .catch((err) => {
          if (modalStatus) {
            modalStatus.innerHTML = `❌ Erro: ${err.text || err.message || "verifique o console"}`;
            modalStatus.style.color = "#e74c3c";
          }
        });
      */

      // ==== MODO DEMONSTRAÇÃO - COMENTAR EM PRODUÇÃO =====
      console.log("Modal - Envio Dados:", {
        name,
        email,
        phone: fullPhone,
      });
      if (modalStatus) {
        modalStatus.innerHTML = "⚠️ Modo de demonstração – e-mail não enviado.";
        modalStatus.style.color = "#f39c12";
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

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
      });
    }
  }

  // ==================== DESTAQUE DO ITEM ATIVO NO MENU INFERIOR ====================
  function updateActiveNavItem() {
    const navItems = document.querySelectorAll(".nav-item");
    const hubBtn = document.querySelector(".nav-hub-btn");

    // Procura o primeiro link com href="#" (representa a página atual)
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
      // Nenhum "#" → estamos no hub: remove active de todos e ativa o hub
      navItems.forEach(link => link.classList.remove("active"));
      if (hubBtn) hubBtn.classList.add("active");
    }
  }

  // Executa quando o DOM estiver pronto
  setTimeout(updateActiveNavItem, 100);
  window.addEventListener("popstate", updateActiveNavItem);
})();
