(() => {
  // 1) Elementy "on-load" od razu wchodzą
  window.addEventListener("DOMContentLoaded", () => {
    document
      .querySelectorAll(".on-load")
      .forEach((el) => el.classList.add("is-visible"));
  });

  // 2) Reszta wchodzi przy scrollu
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.15 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

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
            key: "committee",
            label: "Programme Committee",
            href: "index.html#committee",
          },
          {
            key: "organizers",
            label: "Organizers",
            href: "index.html#organizers",
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
          {
            key: "programme-pdf",
            label: "Download programme PDF",
            href: "assets/Confernece_program_2026-05-23_draft.pdf",
            target: "_blank",
          },
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
            src="assets/Logo.svg"
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

    function setMenuState(isOpen) {
      nav.classList.toggle("menu-open", isOpen);
      document.body.classList.toggle("nav-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      if (toggleImg) toggleImg.src = isOpen ? closeIcon : burgerIcon;
    }

    navToggle.addEventListener("click", () => {
      const open = !nav.classList.contains("menu-open");
      setMenuState(open);
    });

    // zamknięcie po kliknięciu linku
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenuState(false));
    });

    // ESC zamyka menu
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuState(false);
    });

    // przy przejściu na desktop zamknij overlay
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) setMenuState(false);
    });
  }

  // 5) Programme day navigation: highlight active day while scrolling
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

    function setActiveDay(activeId) {
      days.forEach(({ id, link }) => {
        const isActive = id === activeId;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    let ticking = false;

    function getOffset() {
      const navEl = document.getElementById("topnav");
      const navHeight = navEl ? navEl.getBoundingClientRect().height : 0;
      const dayNavHeight = dayNav.getBoundingClientRect().height || 0;
      return navHeight + dayNavHeight + 28;
    }

    function updateActiveDay() {
      const offset = getOffset();
      let activeId = days[0].id;

      days.forEach(({ id, section }) => {
        if (section.getBoundingClientRect().top <= offset) {
          activeId = id;
        }
      });

      setActiveDay(activeId);
      ticking = false;
    }

    function requestUpdate() {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveDay);
        ticking = true;
      }
    }

    links.forEach((link) => {
      link.addEventListener("click", () => {
        const id = link.getAttribute("href").slice(1);
        setActiveDay(id);
      });
    });

    updateActiveDay();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("hashchange", requestUpdate);
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

  // 6) Venue map (MapLibre + Positron style)
  function initVenueMap() {
    const mapEl = document.getElementById("venueMap");
    if (!mapEl) return;
    if (!window.maplibregl) {
      console.warn("MapLibre is not loaded.");
      return;
    }

    // default fallback (Mainz city center)
    const fallbackCenter = [8.247253, 49.992863]; // lon, lat (Mainz)
    const fallbackZoom = 13;

    const map = new maplibregl.Map({
      container: mapEl,
      // Positron (OpenMapTiles) style CDN
      style: "https://tiles.openfreemap.org/styles/positron",
      center: fallbackCenter,
      zoom: fallbackZoom,
      attributionControl: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    // Build a custom marker with primary color
    const markerEl = document.createElement("div");
    markerEl.className = "venue__marker";

    function placeMarker(lon, lat) {
      // fresh marker element each time (safe for fallback + re-try)
      const el = document.createElement("div");
      el.className = "venue__marker";

      new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([lon, lat])
        .addTo(map);

      // show the city context while keeping the marker visible
      map.flyTo({ center: [lon, lat], zoom: 13, speed: 0.8, essential: true });
    }

    // Resolve address via Nominatim (no key). If it fails, keep fallback center.
    const addressQuery = "Ludwigsstraße 2, 55116 Mainz, Germany";
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
      encodeURIComponent(addressQuery);

    fetch(url, {
      headers: { "Accept-Language": "en" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data) || !data[0]) throw new Error("No results");
        const lon = Number(data[0].lon);
        const lat = Number(data[0].lat);
        if (!Number.isFinite(lon) || !Number.isFinite(lat))
          throw new Error("Bad coords");
        placeMarker(lon, lat);
      })
      .catch(() => {
        // fallback marker in city center
        placeMarker(fallbackCenter[0], fallbackCenter[1]);
      });
  }

  window.addEventListener("DOMContentLoaded", initVenueMap);
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
