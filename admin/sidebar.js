"use strict";

document.addEventListener("DOMContentLoaded", () => {
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
  document.querySelector("[data-menu]")?.addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  document.querySelector("[data-overlay]")?.addEventListener("click", () => document.body.classList.remove("sidebar-open"));
  document.querySelector("[data-theme]")?.addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    sessionStorage.setItem("kgh_admin_theme", dark ? "dark" : "light");
  });
});

document.documentElement.dataset.theme = sessionStorage.getItem("kgh_admin_theme") || "light";
