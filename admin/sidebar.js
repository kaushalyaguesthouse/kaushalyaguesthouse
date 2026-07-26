"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  if (main) {
    main.id ||= "main-content";
    document.body.insertAdjacentHTML("afterbegin", '<a class="skip-link" href="#main-content">Skip to main content</a><div class="offline-banner" data-offline hidden role="status">You are offline. Some admin actions are unavailable until your connection returns.</div>');
  }
  const host = document.querySelector("[data-sidebar]");
  if (!host) return;
  const page = document.body.dataset.page;
  host.innerHTML = `
    <div class="brand"><span class="brand-mark">K</span><span><strong>Kaushalya</strong><small>Guest House</small></span></div>
    <nav aria-label="Admin navigation">
      <a href="dashboard.html" ${page === "dashboard" ? 'aria-current="page"' : ""}><span>⌂</span> Dashboard</a>
      <a href="bookings.html" ${["bookings", "booking"].includes(page) ? 'aria-current="page"' : ""}><span>▣</span> Bookings</a>
      <a href="availability.html" ${page === "availability" ? 'aria-current="page"' : ""}><span>▦</span> Availability</a>
      <a href="housekeeping.html" ${page === "housekeeping" ? 'aria-current="page"' : ""}><span>⌁</span> Housekeeping</a>
      <a href="reviews.html" ${page === "reviews" ? 'aria-current="page"' : ""}><span>☆</span> Reviews</a>
      <a href="invoices.html" ${page === "invoices" ? 'aria-current="page"' : ""}><span>₹</span> Invoices</a>
      <a href="revenue.html" ${page === "revenue" ? 'aria-current="page"' : ""}><span>↗</span> Revenue</a>
      <a href="occupancy.html" ${page === "occupancy" ? 'aria-current="page"' : ""}><span>▥</span> Occupancy</a>
      <a href="exports.html" ${page === "exports" ? 'aria-current="page"' : ""}><span>⇩</span> Export Center</a>
      <a href="settings.html" ${page === "settings" ? 'aria-current="page"' : ""}><span>⚙</span> Settings</a>
    </nav>
    <button class="logout" data-logout><span>↪</span> Logout</button>`;
  document.querySelector("[data-logout]").addEventListener("click", AdminAuth.logout);
  const menu = document.querySelector("[data-menu]");
  const setMenu = (open) => { document.body.classList.toggle("sidebar-open", open); menu?.setAttribute("aria-expanded", String(open)); };
  menu?.setAttribute("aria-controls", "admin-navigation");
  menu?.setAttribute("aria-expanded", "false");
  host.id = "admin-navigation";
  menu?.addEventListener("click", () => setMenu(!document.body.classList.contains("sidebar-open")));
  document.querySelector("[data-overlay]")?.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { setMenu(false); menu?.focus(); } });
  const themeButton = document.querySelector("[data-theme]");
  const describeTheme = () => themeButton?.setAttribute("aria-label", document.documentElement.dataset.theme === "dark" ? "Use light mode" : "Use dark mode");
  themeButton?.addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    sessionStorage.setItem("kgh_admin_theme", dark ? "dark" : "light");
    describeTheme();
  });
  describeTheme();
  const offline = document.querySelector("[data-offline]");
  const updateConnection = () => { if (offline) offline.hidden = navigator.onLine; document.body.classList.toggle("is-offline", !navigator.onLine); };
  addEventListener("online", updateConnection); addEventListener("offline", updateConnection); updateConnection();
  document.querySelectorAll("table:not(:has(caption))").forEach((table) => table.insertAdjacentHTML("afterbegin", '<caption class="sr-only">Administrative data table</caption>'));
});

document.documentElement.dataset.theme = sessionStorage.getItem("kgh_admin_theme") || "light";
