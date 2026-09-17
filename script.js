(() => {
  // 1) Elementy "on-load" od razu wchodzą
  window.addEventListener("DOMContentLoaded", () => {
    document
      .querySelectorAll(".on-load")
      .forEach((el) => el.classList.add("is-visible"));
  });

  // 2) Reveal on scroll, with a no-IntersectionObserver fallback.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 },
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  } else {
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("is-visible"));
  }

  function renderTopnav() {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    const active = mount.dataset.active || "";

    const navItems = [
      { key: "home", label: "HOME", href: "index.html" },
      {
        key: "conference",
        label: "CONFERENCE",
        href: "index.html#about",
        children: [
          {
            key: "about",
            label: "About the conference",
            href: "index.html#about",
          },
          { key: "dates", label: "Key dates", href: "index.html#dates" },
          {
            key: "funding",
            label: "Funding & costs",
            href: "index.html#funding",
          },
          { key: "venue", label: "Venue", href: "index.html#venue" },
          {
            key: "organizers",
            label: "Organizers",
            href: "index.html#organizers",
          },
          {
            key: "committee",
            label: "Conference Committee",
            href: "index.html#committee",
          },
        ],
      },
      { key: "cfp", label: "CALL FOR PAPERS", href: "call-for-papers.html" },
      {
        key: "programme",
        label: "PROGRAMME",
        href: "program.html",
        children: [
          {
            key: "program",
            label: "Conference programme",
            href: "program.html",
          },
          { key: "keynotes", label: "Keynote speakers", href: "keynotes.html" },
        ],
      },
      {
        key: "authors",
        label: "FOR AUTHORS",
        href: "for-authors.html",
        children: [
          {
            key: "presentation-guidelines",
            label: "Presentation guidelines",
            href: "for-authors.html#presentation-guidelines",
          },
          {
            key: "abstract-template",
            label: "Abstract template",
            href: "for-authors.html#abstract-template",
          },
          {
            key: "proceedings",
            label: "Proceedings",
            href: "for-authors.html#proceedings",
          },
        ],
      },
      { key: "registration", label: "REGISTRATION", href: "registration.html" },
      { key: "contact", label: "CONTACT", href: "contact.html" },
    ];

    const isItemActive = (item) =>
      active === item.key ||
      Boolean(
        item.children && item.children.some((child) => child.key === active),
      );

    const renderLink = (item, className) => {
      const target = item.target
        ? ` target="${item.target}" rel="noopener noreferrer"`
        : "";
      return `<a href="${item.href}" class="${className}"${target}>${item.label}</a>`;
    };

    const links = navItems
      .map((item) => {
        const hasDropdown =
          Array.isArray(item.children) && item.children.length > 0;
        const activeClass = isItemActive(item) ? " is-active" : "";

        if (!hasDropdown) {
          return `
        <li class="topnav__item${activeClass}">
          ${renderLink(item, "topnav__link")}
        </li>`;
        }

        const childLinks = item.children
          .map((child) => {
            const childActiveClass = active === child.key ? " is-active" : "";
            return `
              <li class="topnav__dropdown-item${childActiveClass}">
                ${renderLink(child, "topnav__dropdown-link")}
              </li>`;
          })
          .join("");

        return `
        <li class="topnav__item topnav__item--has-dropdown${activeClass}">
          ${renderLink(item, "topnav__link topnav__link--dropdown")}
          <ul class="topnav__dropdown" aria-label="${item.label} submenu">
            ${childLinks}
          </ul>
        </li>`;
      })
      .join("");

    mount.outerHTML = `
    <!-- TOPNAV -->
    <header class="topnav" id="topnav">
      <h2 class="visually-hidden">Header</h2>
      <div class="wrapper">
        <a href="index.html" class="topnav__homelink">
          <img
            src="assets/Logo_F3D.svg"
            alt="FAIR 3D Heritage"
            class="topnav__logo"
          />
        </a>

        <button
          class="topnav__toggle"
          id="navToggle"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="mainMenu"
          type="button"
        >
          <img
            src="assets/Burger.svg"
            alt=""
            class="topnav__toggle-icon"
            width="24"
            height="24"
          />
        </button>

        <nav class="menu" id="mainMenu" aria-label="Main navigation">
          <ul class="topnav_links">
            ${links}
          </ul>
        </nav>
      </div>
    </header>`;
  }

  renderTopnav();

  // 3) Navbar transparent -> color on scroll
  const nav = document.getElementById("topnav");
  const threshold = 20;

  function updateNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > threshold);
  }

  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  // 4) Mobile menu toggle (burger -> close)
  const navToggle = document.getElementById("navToggle");
  const menu = document.getElementById("mainMenu");

  if (nav && navToggle && menu) {
    const burgerIcon = "assets/Burger.svg";
    const closeIcon = "assets/mingcute--close-line.svg";
    const toggleImg = navToggle.querySelector(".topnav__toggle-icon");
    const mobileMq = window.matchMedia("(max-width: 860px)");

    function setMenuState(isOpen) {
      const mobile = mobileMq.matches;
      const shouldOpen = mobile && isOpen;

      nav.classList.toggle("menu-open", shouldOpen);
      document.body.classList.toggle("nav-open", shouldOpen);
      navToggle.setAttribute("aria-expanded", String(shouldOpen));
      navToggle.setAttribute("aria-label", shouldOpen ? "Close menu" : "Open menu");

      if (toggleImg) toggleImg.src = shouldOpen ? closeIcon : burgerIcon;

      // On mobile the closed full-screen menu must be truly non-interactive.
      // This prevents invisible navigation links from catching taps on page content.
      if (mobile) {
        menu.setAttribute("aria-hidden", String(!shouldOpen));
        try {
          menu.inert = !shouldOpen;
        } catch (_) {}
      } else {
        menu.removeAttribute("aria-hidden");
        try {
          menu.inert = false;
        } catch (_) {}
      }
    }

    navToggle.addEventListener("click", () => {
      setMenuState(!nav.classList.contains("menu-open"));
    });

    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenuState(false));
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuState(false);
    });

    const syncMenuMode = () => setMenuState(false);
    if (typeof mobileMq.addEventListener === "function") {
      mobileMq.addEventListener("change", syncMenuMode);
    } else if (typeof mobileMq.addListener === "function") {
      mobileMq.addListener(syncMenuMode);
    }
    setMenuState(false);
  }

  // 5) Programme day navigation: exact sticky-header-aware scrolling
  function initProgramDayNavigation() {
    const dayNav = document.querySelector(".program-daynav");
    if (!dayNav) return;

    const links = Array.from(dayNav.querySelectorAll('a[href^="#day-"]'));
    const days = links
      .map((link) => {
        const id = link.getAttribute("href").slice(1);
        return { id, link, section: document.getElementById(id) };
      })
      .filter((item) => item.section);

    if (!days.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;

    function syncMeasurements() {
      const height = Math.ceil(dayNav.getBoundingClientRect().height || 0);
      document.documentElement.style.setProperty(
        "--program-daynav-h",
        `${height}px`,
      );
    }

    function getTopOffset() {
      const navEl = document.getElementById("topnav");
      const navHeight = navEl ? Math.ceil(navEl.getBoundingClientRect().height) : 0;
      const dayNavHeight = Math.ceil(dayNav.getBoundingClientRect().height || 0);
      return navHeight + dayNavHeight + 14;
    }

    function setActiveDay(activeId) {
      days.forEach(({ id, link }) => {
        const isActive = id === activeId;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    function scrollToDay(id, { updateHistory = true, behavior } = {}) {
      const item = days.find((day) => day.id === id);
      if (!item) return;

      syncMeasurements();
      const targetY =
        item.section.getBoundingClientRect().top +
        window.scrollY -
        getTopOffset();

      if (updateHistory) {
        const url = new URL(window.location.href);
        url.hash = id;
        history.pushState({ programmeDay: id }, "", url);
      }

      setActiveDay(id);
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior:
          behavior || (reducedMotion.matches ? "auto" : "smooth"),
      });
    }

    function updateActiveDay() {
      syncMeasurements();
      const offset = getTopOffset() + 8;
      let activeId = days[0].id;

      for (const { id, section } of days) {
        if (section.getBoundingClientRect().top <= offset) activeId = id;
      }

      setActiveDay(activeId);
      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveDay);
      }
    }

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        scrollToDay(link.getAttribute("href").slice(1));
      });
    });

    const alignHash = (behavior = "auto") => {
      const id = window.location.hash.replace(/^#/, "");
      if (!days.some((day) => day.id === id)) return;
      window.requestAnimationFrame(() => scrollToDay(id, { updateHistory: false, behavior }));
    };

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => {
        syncMeasurements();
        requestUpdate();
      });
      resizeObserver.observe(dayNav);
      const topnav = document.getElementById("topnav");
      if (topnav) resizeObserver.observe(topnav);
    }

    syncMeasurements();
    updateActiveDay();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("orientationchange", requestUpdate, { passive: true });
    window.addEventListener("hashchange", () => alignHash("auto"));
    window.addEventListener("popstate", () => alignHash("auto"));

    // Correct the browser's native initial hash jump after sticky bars/fonts settle.
    if (window.location.hash) {
      alignHash("auto");
      window.addEventListener("load", () => alignHash("auto"), { once: true });
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => alignHash("auto")).catch(() => {});
      }
    }
  }

  initProgramDayNavigation();

  // 5b) Keynotes: language toggle for Hubertus Günther
  function initKeynoteLanguageToggle() {
    const toggleButtons = document.querySelectorAll(
      "[data-keynote-target][data-keynote-lang]",
    );
    if (!toggleButtons.length) return;

    function setLanguage(targetId, lang) {
      const buttons = document.querySelectorAll(
        `[data-keynote-target="${targetId}"]`,
      );
      const panels = document.querySelectorAll(
        `[data-keynote-panel="${targetId}"]`,
      );

      buttons.forEach((button) => {
        const isActive = button.dataset.keynoteLang === lang;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.lang === lang;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    }

    toggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setLanguage(button.dataset.keynoteTarget, button.dataset.keynoteLang);
      });
    });
  }

  initKeynoteLanguageToggle();

  // 5) Hero arrow: pozycja + smooth scroll do #about
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero__content");
  const chevron = document.querySelector(".hero__chevron");
  const about = document.getElementById("about");

  function placeChevron() {
    if (!hero || !heroContent || !chevron) return;

    const heroRect = hero.getBoundingClientRect();
    const contentRect = heroContent.getBoundingClientRect();

    // ile wolnego miejsca zostało pod contentem do końca hero
    const freeSpace = heroRect.bottom - contentRect.bottom;

    // połowa tej wolnej przestrzeni
    // minus połowa wysokości strzałki, bo pozycjonujemy TOP elementu
    const arrowHalf = chevron.offsetHeight / 2 || 32;
    let topInHero =
      contentRect.bottom - heroRect.top + freeSpace / 2 - arrowHalf;

    // bezpieczne ograniczenia, by nie wyszła poza hero
    const minTop = 0;
    const maxTop = hero.clientHeight - (chevron.offsetHeight || 64);
    topInHero = Math.max(minTop, Math.min(maxTop, topInHero));

    chevron.style.top = `${topInHero}px`;
  }

  function smoothScrollToAbout(e) {
    if (!about) return;
    e.preventDefault();

    const navEl = document.getElementById("topnav");
    const navH = navEl ? navEl.getBoundingClientRect().height : 0;
    const targetTop = about.getBoundingClientRect().top + window.scrollY - navH;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  }

  if (chevron) {
    chevron.addEventListener("click", smoothScrollToAbout);
  }

  // przelicz po załadowaniu i przy zmianach viewportu
  window.addEventListener("load", placeChevron);
  window.addEventListener("resize", placeChevron);
  window.addEventListener("orientationchange", placeChevron);

  // dodatkowo po fontach (bo potrafią zmienić wysokość contentu)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(placeChevron).catch(() => {});
  }

})();
(() => {
  function initVenueMap() {
    const mapEl = document.getElementById("venueMap");
    if (!mapEl) return;
    if (!window.maplibregl) {
      console.warn("MapLibre is not loaded.");
      return;
    }

    const addressLine = "Ludwigsstraße 2, 55116 Mainz, Germany";
    const title = "LUX Pavilion";
    const subtitle = "Hochschule Mainz – University of Applied Sciences";

    // Mainz (fallback)
    const fallbackCenter = [8.247253, 49.992863]; // lon, lat
    const fallbackZoom = 13;

    const map = new maplibregl.Map({
      container: mapEl,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: fallbackCenter,
      zoom: fallbackZoom,
      attributionControl: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    function addMarkerWithPopup(lon, lat) {
      const el = document.createElement("div");
      el.className = "venue__marker";

      const popupHtml = `
        <div style="font-family: inherit; line-height: 1.35;">
          <strong>${title}</strong><br/>
          ${subtitle}<br/>
          ${addressLine}
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 18,
        closeButton: true,
      }).setHTML(popupHtml);

      new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([lon, lat])
        .setPopup(popup) // <-- klik w marker otwiera popup
        .addTo(map);

      map.flyTo({ center: [lon, lat], zoom: 13, speed: 0.8, essential: true });
    }

    // Nominatim geocode (bez klucza)
    const q = encodeURIComponent(addressLine);
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`;

    fetch(url, { headers: { "Accept-Language": "en" } })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data) || !data[0]) throw new Error("No results");
        const lon = Number(data[0].lon);
        const lat = Number(data[0].lat);
        if (!Number.isFinite(lon) || !Number.isFinite(lat))
          throw new Error("Bad coords");
        addMarkerWithPopup(lon, lat);
      })
      .catch(() => {
        addMarkerWithPopup(fallbackCenter[0], fallbackCenter[1]);
      });
  }

  window.addEventListener("DOMContentLoaded", initVenueMap);
})();

/* Conference Committee bio modal */
(() => {
  function initCommitteeBioModal() {
    const modal = document.getElementById("committeeBioModal");
    const content = document.getElementById("committeeBioContent");
    if (!modal || !content) return;

    function openModal(targetId) {
      const source = document.getElementById(targetId);
      if (!source) return;

      content.innerHTML = source.innerHTML;

      const title = content.querySelector("h3");
      if (title) {
        title.id = "committeeBioTitle";
      }

      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      content.innerHTML = "";

      if (
        document.activeElement &&
        typeof document.activeElement.blur === "function"
      ) {
        document.activeElement.blur();
      }

      document
        .querySelectorAll(".committee-card__bio-btn")
        .forEach((button) => {
          button.blur();
        });
    }

    document.addEventListener("click", (event) => {
      const bioButton = event.target.closest("[data-bio-target]");

      if (bioButton) {
        event.preventDefault();
        openModal(bioButton.dataset.bioTarget);
        return;
      }

      if (event.target.closest("[data-committee-modal-close]")) {
        closeModal();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommitteeBioModal);
  } else {
    initCommitteeBioModal();
  }
})();

/* Abstract PDF access: native on touch/mobile, modal enhancement on desktop */
(() => {
  function initAbstractPdfAccess() {
    const modal = document.getElementById("abstractPdfModal");
    const frame = document.getElementById("abstractPdfFrame");
    const title = document.getElementById("abstractPdfTitle");
    const openLink = document.getElementById("abstractPdfOpenLink");
    const triggers = Array.from(document.querySelectorAll("[data-abstract-pdf]"));

    if (!triggers.length) return;

    let lastTrigger = null;
    const mobileOrTouch = () =>
      window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;

    // Progressive enhancement: expose a real URL/"link" semantic even before activation.
    triggers.forEach((trigger) => {
      trigger.setAttribute("role", "link");
      if (!trigger.hasAttribute("tabindex")) trigger.tabIndex = 0;
      trigger.dataset.abstractHref = trigger.dataset.abstractPdf || "";
    });

    function openNative(pdfUrl) {
      // Synchronous call from the user gesture: least likely to be blocked on iOS/iPadOS.
      const opened = window.open(pdfUrl, "_blank");
      if (opened) {
        try {
          opened.opener = null;
        } catch (_) {}
      } else {
        window.location.href = pdfUrl;
      }
    }

    function openModal(trigger) {
      const pdfUrl = trigger.dataset.abstractPdf;
      const abstractTitle = trigger.dataset.abstractTitle || "Abstract";
      if (!pdfUrl) return;

      if (mobileOrTouch() || !modal || !frame || !title || !openLink) {
        openNative(pdfUrl);
        return;
      }

      lastTrigger = trigger;
      title.textContent = abstractTitle;
      frame.src = pdfUrl;
      openLink.href = pdfUrl;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("abstract-modal-open");

      const closeButton = modal.querySelector("[data-abstract-modal-close]");
      if (closeButton) closeButton.focus({ preventScroll: true });
    }

    function closeModal() {
      if (!modal || modal.hidden) return;
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("abstract-modal-open");
      if (frame) frame.src = "";
      if (openLink) openLink.href = "#";
      if (lastTrigger?.focus) lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    }

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-abstract-pdf]");
      if (trigger) {
        event.preventDefault();
        openModal(trigger);
        return;
      }

      if (event.target.closest("[data-abstract-modal-close]")) {
        event.preventDefault();
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      const trigger = event.target.closest?.("[data-abstract-pdf]");
      if (trigger && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openModal(trigger);
        return;
      }

      if (event.key === "Escape") closeModal();

      // Keep keyboard focus inside the desktop modal.
      if (event.key === "Tab" && modal && !modal.hidden) {
        const focusable = Array.from(
          modal.querySelectorAll('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => !el.hidden);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAbstractPdfAccess);
  } else {
    initAbstractPdfAccess();
  }
})();

/* Collapsible workshop descriptions — smooth V2 */
(() => {
  function initWorkshopDescriptions() {
    const summaries = document.querySelectorAll(".program-workshop-summary");
    if (!summaries.length) return;

    function getDescription(summary) {
      const descriptionId = summary.getAttribute("aria-controls");
      return descriptionId ? document.getElementById(descriptionId) : null;
    }

    function setOpen(summary, open) {
      const description = getDescription(summary);
      if (!description) return;

      summary.setAttribute("aria-expanded", String(open));
      description.classList.toggle("is-open", open);
      description.setAttribute("aria-hidden", String(!open));

      const a11yLabel = summary.querySelector(".program-workshop-toggle-a11y");
      if (a11yLabel) {
        a11yLabel.textContent = open
          ? "Hide workshop description"
          : "Show workshop description";
      }
    }

    summaries.forEach((summary) => {
      const description = getDescription(summary);
      if (!description) return;

      // The HTML starts with [hidden] to avoid a flash of open content.
      // Remove it once the accordion styles/behaviour are ready.
      description.hidden = false;
      setOpen(summary, false);

      summary.addEventListener("click", () => {
        const isOpen = summary.getAttribute("aria-expanded") === "true";
        setOpen(summary, !isOpen);
      });

      summary.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();

        const isOpen = summary.getAttribute("aria-expanded") === "true";
        setOpen(summary, !isOpen);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorkshopDescriptions);
  } else {
    initWorkshopDescriptions();
  }
})();

/* Collapsible programme sessions / poster sessions */
(() => {
  function initSessionAccordions() {
    const summaries = document.querySelectorAll(".program-session-summary");
    if (!summaries.length) return;

    function getDetails(summary) {
      const detailsId = summary.getAttribute("aria-controls");
      return detailsId ? document.getElementById(detailsId) : null;
    }

    function setOpen(summary, open) {
      const details = getDetails(summary);
      if (!details) return;

      summary.setAttribute("aria-expanded", String(open));
      details.classList.toggle("is-open", open);
      details.setAttribute("aria-hidden", String(!open));

      const a11yLabel = summary.querySelector(".program-session-toggle-a11y");
      if (a11yLabel) {
        a11yLabel.textContent = open
          ? "Hide session presentations"
          : "Show session presentations";
      }
    }

    summaries.forEach((summary) => {
      const details = getDetails(summary);
      if (!details) return;

      // Prevent a flash of expanded content during load, then initialise collapsed.
      details.hidden = false;
      setOpen(summary, false);

      summary.addEventListener("click", () => {
        const isOpen = summary.getAttribute("aria-expanded") === "true";
        setOpen(summary, !isOpen);
      });

      summary.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();

        const isOpen = summary.getAttribute("aria-expanded") === "true";
        setOpen(summary, !isOpen);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSessionAccordions);
  } else {
    initSessionAccordions();
  }
})();

