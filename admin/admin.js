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
  const form = $("[data-booking-filters]"), tableBody = $("[data-bookings]"), section = $("[data-bookings-section]");
  const previous = $("[data-previous-page]"), next = $("[data-next-page]"), indicator = $("[data-page-indicator]");
  const apply = $("[data-apply-filters]"), errorNotice = $("[data-error]");
  const state = { page: 1, limit: 25, hasNext: false };

  const load = async () => {
    const params = new URLSearchParams({ page: String(state.page), limit: String(state.limit) });
    new FormData(form).forEach((value, key) => { if (String(value).trim()) params.set(key, String(value).trim()); });
    tableBody.innerHTML = emptyRow(14, "Loading bookings…");
    section.setAttribute("aria-busy", "true"); apply.disabled = true; previous.disabled = true; next.disabled = true;
    errorNotice.hidden = true;
    try {
      const response = await AdminAuth.request(`/admin/bookings?${params.toString()}`);
      const bookings = Array.isArray(response?.items) ? response.items : (Array.isArray(response?.bookings) ? response.bookings : []);
      const pagination = response?.pagination || {};
      const currentPage = Number(pagination.page ?? pagination.current_page ?? state.page) || state.page;
      const total = Number(pagination.total ?? pagination.total_items ?? bookings.length);
      state.page = currentPage;
      state.hasNext = pagination.has_next === true;
      tableBody.innerHTML = bookings.length ? bookingRows(bookings) : emptyRow(14, "No bookings match your filters.");
      $("[data-total]").textContent = `${total} result${total === 1 ? "" : "s"}`;
      indicator.textContent = `Page ${currentPage}`;
      previous.disabled = currentPage <= 1;
      next.disabled = !state.hasNext;
      tableBody.querySelectorAll("tr[data-href]").forEach((row) => row.addEventListener("click", (event) => { if (!event.target.closest("a")) location.href = row.dataset.href; }));
    } catch (error) {
      tableBody.innerHTML = emptyRow(14, "Bookings could not be loaded. Please try again.");
      $("[data-total]").textContent = "Unable to load results";
      showError(error);
    } finally { section.setAttribute("aria-busy", "false"); apply.disabled = false; }
  };

  form.addEventListener("change", () => { state.page = 1; });
  form.addEventListener("input", () => { state.page = 1; });
  form.addEventListener("submit", (event) => { event.preventDefault(); state.page = 1; load(); });
  $("[data-clear-filters]").addEventListener("click", () => { form.reset(); state.page = 1; load(); });
  previous.addEventListener("click", () => { if (state.page > 1) { state.page -= 1; load(); } });
  next.addEventListener("click", () => { if (state.hasNext) { state.page += 1; load(); } });
  await load();
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

const availabilityDays = (data) => listFrom(data, ["availability", "days", "data"]);
const dayBookings = (day) => listFrom(day, ["bookings", "booking_details", "reservations"]);

async function initAvailability() {
  const monthSelect = $("[data-month]"), yearSelect = $("[data-year]"), roomTypeSelect = $("[data-room-type]");
  const refreshButton = $("[data-refresh]"), calendar = $("[data-calendar]"), calendarSection = $("[data-calendar-section]");
  const modal = $("[data-availability-modal]"), now = new Date();
  monthSelect.innerHTML = Array.from({ length: 12 }, (_, index) => `<option value="${index + 1}">${new Intl.DateTimeFormat("en-IN", { month: "long" }).format(new Date(2020, index, 1))}</option>`).join("");
  yearSelect.innerHTML = Array.from({ length: 11 }, (_, index) => now.getFullYear() - 5 + index).map((year) => `<option value="${year}">${year}</option>`).join("");
  monthSelect.value = now.getMonth() + 1; yearSelect.value = now.getFullYear();

  const renderModal = (day, dateValue) => {
    const bookings = dayBookings(day);
    $("[data-modal-title]").textContent = new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(dateValue);
    $("[data-day-bookings]").innerHTML = bookings.length ? bookings.map((booking) => `<tr><td>${escapeHtml(get(booking, "booking_id", "id", "uuid"))}</td><td>${escapeHtml(get(booking, "room_type", "room"))}</td><td>${status(get(booking, "booking_status", "status"))}</td></tr>`).join("") : emptyRow(3, "No bookings for this day");
    modal.showModal();
  };
  const load = async () => {
    refreshButton.disabled = true; calendarSection.setAttribute("aria-busy", "true"); $("[data-error]").hidden = true;
    calendar.innerHTML = '<p class="empty calendar-message">Loading availability…</p>';
    try {
      const params = new URLSearchParams({ month: monthSelect.value, year: yearSelect.value });
      if (roomTypeSelect.value) params.set("room_type", roomTypeSelect.value);
      const days = availabilityDays(await AdminAuth.request(`/admin/availability?${params}`));
      const byDate = new Map(days.map((day) => { const raw = get(day, "date", "day"); return [/^\d+$/.test(String(raw)) ? Number(raw) : new Date(raw).getUTCDate(), day]; }));
      const year = Number(yearSelect.value), month = Number(monthSelect.value), count = new Date(year, month, 0).getDate();
      const blanks = Array.from({ length: new Date(year, month - 1, 1).getDay() }, () => '<span class="calendar-blank" aria-hidden="true"></span>');
      const cells = Array.from({ length: count }, (_, index) => {
        const number = index + 1, day = byDate.get(number) || {}, total = Number(get(day, "total_rooms", "total") || 0), booked = Number(get(day, "booked_rooms", "booked") || 0), available = Number(get(day, "available_rooms", "available") ?? Math.max(total - booked, 0));
        const level = available <= 0 ? "full" : booked > 0 ? "partial" : "available";
        return `<button class="calendar-day ${level}" type="button" data-day="${number}" aria-label="${number}: ${available} of ${total} rooms available"><strong>${number}</strong><dl><div><dt>Total</dt><dd>${total}</dd></div><div><dt>Booked</dt><dd>${booked}</dd></div><div><dt>Available</dt><dd>${available}</dd></div></dl></button>`;
      });
      calendar.innerHTML = [...blanks, ...cells].join("");
      calendar.querySelectorAll("[data-day]").forEach((button) => button.addEventListener("click", () => renderModal(byDate.get(Number(button.dataset.day)) || {}, new Date(year, month - 1, Number(button.dataset.day)))));
    } catch (error) { calendar.innerHTML = '<p class="empty calendar-message">Availability could not be loaded.</p>'; showError(error); }
    finally { refreshButton.disabled = false; calendarSection.setAttribute("aria-busy", "false"); }
  };
  refreshButton.addEventListener("click", load); monthSelect.addEventListener("change", load); yearSelect.addEventListener("change", load); roomTypeSelect.addEventListener("change", load);
  $("[data-close-modal]").addEventListener("click", () => modal.close()); modal.addEventListener("click", (event) => { if (event.target === modal) modal.close(); });
  await load();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "login") AdminAuth.requireAuth();
  ({ dashboard: initDashboard, bookings: initBookings, booking: initBooking, reviews: initReviews, availability: initAvailability })[document.body.dataset.page]?.();
});
