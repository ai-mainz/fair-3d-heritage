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
