"use strict";

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "—") => String(value ?? "—").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);
const listFrom = (data, keys) => Array.isArray(data) ? data : (keys.map((key) => data?.[key]).find(Array.isArray) || []);
const date = (value) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "—";
const dateTime = (value) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const money = (value) => value == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value));
const status = (value) => `<span class="status status-${String(value || "unknown").toLowerCase().replace(/\s+/g, "-")}">${escapeHtml(value)}</span>`;
const get = (item, ...keys) => keys.map((key) => item?.[key]).find((value) => value !== undefined && value !== null);
const showError = (error) => { const el = $("[data-error]"); if (el) { el.textContent = error.message; el.hidden = false; } };

function bookingRows(bookings) {
  return bookings.map((b) => {
    const id = get(b, "uuid", "id", "booking_id");
    return `<tr data-href="booking.html?id=${encodeURIComponent(id)}"><td><a href="booking.html?id=${encodeURIComponent(id)}" class="id-link">${escapeHtml(get(b, "booking_id", "uuid", "id"))}</a></td><td><strong>${escapeHtml(get(b, "customer", "name", "full_name", "customer_name"))}</strong></td><td>${escapeHtml(get(b, "phone", "mobile"))}</td><td>${escapeHtml(b.email)}</td><td>${escapeHtml(get(b, "room", "room_type"))}</td><td>${date(get(b, "check_in", "checkin"))}</td><td>${date(get(b, "check_out", "checkout"))}</td><td>${escapeHtml(get(b, "guests", "guest_count", "adults"))}</td><td>${escapeHtml(get(b, "payment_type", "payment_method"))}</td><td>${status(get(b, "payment_status"))}</td><td>${status(get(b, "booking_status", "status"))}</td><td>${money(get(b, "amount", "total_amount", "total"))}</td><td>${money(get(b, "advance", "advance_amount"))}</td><td>${dateTime(get(b, "created_at", "createdAt"))}</td></tr>`;
  }).join("");
}

async function initDashboard() {
  try {
    const [bookingData, reviewData] = await Promise.all([AdminAuth.request("/admin/bookings?limit=500"), AdminAuth.request("/admin/reviews")]);
    const bookings = listFrom(bookingData, ["bookings", "data"]), reviews = listFrom(reviewData, ["reviews", "data"]);
    const recent = [...bookings].sort((a, b) => new Date(get(b, "created_at", "createdAt")) - new Date(get(a, "created_at", "createdAt"))).slice(0, 5);
    $("[data-recent-bookings]").innerHTML = recent.length ? bookingRows(recent) : emptyRow(14, "No recent bookings");
    $("[data-booking-count]").textContent = bookings.length;
    $("[data-review-count]").textContent = reviews.length;
    renderSummary("[data-booking-summary]", bookings, (b) => get(b, "booking_status", "status"));
    renderSummary("[data-payment-summary]", bookings, (b) => get(b, "payment_status") || "Unknown");
    const activity = recent.map((b) => `<li><span class="activity-dot"></span><div><strong>Booking ${escapeHtml(get(b, "booking_id", "uuid", "id"))}</strong><small>${escapeHtml(get(b, "customer", "name", "full_name", "customer_name"))} · ${dateTime(get(b, "created_at", "createdAt"))}</small></div></li>`).join("");
    $("[data-activity]").innerHTML = activity || "<li>No recent activity</li>";
  } catch (error) { showError(error); }
}

function renderSummary(selector, items, getter) {
  const counts = items.reduce((all, item) => { const key = getter(item); all[key] = (all[key] || 0) + 1; return all; }, {});
  $(selector).innerHTML = Object.entries(counts).map(([key, count]) => `<div class="summary-row"><span>${status(key)}</span><strong>${count}</strong></div>`).join("") || "<p class='muted'>No data available</p>";
}

const emptyRow = (span, message) => `<tr><td colspan="${span}" class="empty">${message}</td></tr>`;

async function initBookings() {
  try {
    const data = await AdminAuth.request("/admin/bookings?limit=500");
    const bookings = listFrom(data, ["bookings", "data"]);
    $("[data-bookings]").innerHTML = bookings.length ? bookingRows(bookings) : emptyRow(14, "No bookings found");
    $("[data-total]").textContent = `${bookings.length} recent record${bookings.length === 1 ? "" : "s"}`;
    document.querySelectorAll("tr[data-href]").forEach((row) => row.addEventListener("click", (e) => { if (!e.target.closest("a")) location.href = row.dataset.href; }));
  } catch (error) { showError(error); }
}

async function initBooking() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return showError(new Error("No booking ID was provided."));
  try {
    const data = await AdminAuth.request(`/admin/bookings/${encodeURIComponent(id)}`);
    const booking = data.booking || data.data || data;
    $("[data-booking-title]").textContent = `Booking ${get(booking, "booking_id", "uuid", "id") || "details"}`;
    $("[data-fields]").innerHTML = Object.entries(booking).map(([key, value]) => `<div class="field"><dt>${escapeHtml(key.replace(/_/g, " "))}</dt><dd>${escapeHtml(typeof value === "object" ? JSON.stringify(value) : value)}</dd></div>`).join("");
    const current = get(booking, "booking_status", "status");
    $("[data-status-select]").value = current;
    $("[data-status-form]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const next = $("[data-status-select]").value;
      if (next === "Cancelled" && !confirm("Cancel this booking? This action changes its operational status.")) return;
      const button = event.submitter; button.disabled = true;
      try {
        await AdminAuth.request(`/admin/bookings/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ booking_status: next }) });
        $("[data-success]").textContent = "Booking status updated successfully."; $("[data-success]").hidden = false;
      } catch (error) { showError(error); } finally { button.disabled = false; }
    });
  } catch (error) { showError(error); }
}

async function initReviews() {
  try {
    const data = await AdminAuth.request("/admin/reviews");
    const reviews = listFrom(data, ["reviews", "data"]);
    $("[data-reviews]").innerHTML = reviews.length ? reviews.map((r) => {
      const id = get(r, "uuid", "id");
      return `<tr data-review="${escapeHtml(id)}"><td><strong>${escapeHtml(get(r, "reviewer", "name"))}</strong></td><td>${escapeHtml(r.email)}</td><td><span class="rating">★ ${escapeHtml(r.rating)}</span></td><td class="review-copy">${escapeHtml(get(r, "review", "message", "text"))}</td><td>${date(get(r, "date", "created_at", "createdAt"))}</td><td><div class="actions"><button class="btn btn-small" data-moderate="approved">Approve</button><button class="btn btn-small btn-danger" data-moderate="rejected">Reject</button></div></td></tr>`;
    }).join("") : emptyRow(6, "No pending reviews");
    $("[data-reviews]").addEventListener("click", async (event) => {
      const button = event.target.closest("[data-moderate]"); if (!button) return;
      const row = button.closest("[data-review]"); button.disabled = true;
      try { await AdminAuth.request(`/admin/reviews/${encodeURIComponent(row.dataset.review)}`, { method: "PATCH", body: JSON.stringify({ status: button.dataset.moderate }) }); row.remove(); if (!$("[data-reviews]").children.length) $("[data-reviews]").innerHTML = emptyRow(6, "No pending reviews"); }
      catch (error) { button.disabled = false; showError(error); }
    });
  } catch (error) { showError(error); }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "login") AdminAuth.requireAuth();
  ({ dashboard: initDashboard, bookings: initBookings, booking: initBooking, reviews: initReviews })[document.body.dataset.page]?.();
});
