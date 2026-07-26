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
  const charts = [];
  const value = (object, ...keys) => get(object || {}, ...keys);
  const number = (raw) => Number.isFinite(Number(raw)) ? Number(raw) : 0;
  const array = (object, ...keys) => listFrom(object || {}, keys);
  const formatCount = (raw) => new Intl.NumberFormat("en-IN").format(number(raw));
  const percent = (raw) => `${number(raw).toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`;
  const metricCard = (label, raw, formatter = formatCount) => `<article class="card metric-card"><p>${escapeHtml(label)}</p><strong>${formatter(raw)}</strong></article>`;
  const periodNames = { today: "Today", current_week: "Current week", week: "Current week", current_month: "Current month", month: "Current month", current_year: "Current year", year: "Current year" };
  const renderChart = (canvasSelector, emptySelector, type, labels, datasets) => {
    const canvas = $(canvasSelector), empty = $(emptySelector);
    const hasData = labels.length && datasets.some((set) => set.data.some((item) => number(item) !== 0));
    canvas.hidden = !hasData; empty.hidden = Boolean(hasData);
    if (!hasData || typeof Chart === "undefined") { if (typeof Chart === "undefined") empty.textContent = "Charts are temporarily unavailable."; return; }
    charts.push(new Chart(canvas, { type, data: { labels, datasets }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { usePointStyle: true } } }, scales: type === "doughnut" ? {} : { y: { beginAtZero: true } } } }));
  };
  const load = async () => {
    const button = $("[data-analytics-refresh]"), loading = $("[data-analytics-loading]"), content = $("[data-analytics-content]"), empty = $("[data-analytics-empty]"), error = $("[data-error]");
    button.disabled = true; loading.hidden = false; content.hidden = true; empty.hidden = true; error.hidden = true;
    charts.splice(0).forEach((chart) => chart.destroy());
    try {
      const response = await AdminAuth.request("/admin/analytics/summary");
      const data = response?.data || response?.summary || response || {};
      const overview = data.overview || data.snapshot || data.metrics || {};
      const revenue = data.revenue_summary || data.revenue || {};
      const trends = data.trends || data.charts || {};
      let trend = array(data, "daily_trend", "trend", "daily");
      if (!trend.length) trend = array(trends, "daily_trend", "default_30_day_trend", "daily");
      const roomBookings = value(data, "bookings_by_room_type", "room_type_bookings") || value(trends, "bookings_by_room_type", "room_type_bookings") || [];
      const statuses = value(data, "booking_status_distribution", "bookings_by_status", "status_distribution") || value(trends, "booking_status_distribution", "bookings_by_status") || [];
      const occupancy = array(data, "occupancy_by_room_type", "room_type_occupancy");
      const payments = data.payment_statistics || data.payments || {};
      const hasAnalytics = Object.keys(overview).length || Object.keys(revenue).length || Object.keys(trends).length || trend.length || Object.keys(roomBookings).length || Object.keys(statuses).length || occupancy.length || Object.keys(payments).length;
      $("[data-generated-at]").textContent = dateTime(value(data, "generated_at", "generatedAt", "last_generated_at"));
      $("[data-timezone]").textContent = escapeHtml(value(data, "timezone", "effective_timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
      if (!hasAnalytics) { empty.hidden = false; return; }
      $("[data-overview-cards]").innerHTML = [
        ["Today’s bookings", value(overview, "todays_bookings", "today_bookings", "bookings_today")],
        ["Verified online collections today", value(overview, "verified_online_collections_today", "online_collections_today"), money],
        ["Current guests", value(overview, "current_guests", "guests_in_house")], ["Rooms occupied", value(overview, "rooms_occupied", "occupied_rooms")],
        ["Available rooms", value(overview, "available_rooms", "rooms_available")], ["Occupancy percentage", value(overview, "occupancy_percentage", "occupancy_percent"), percent],
        ["Gross booked value this month", value(overview, "gross_booked_value_this_month", "monthly_gross_booked_value"), money]
      ].map(([label, raw, formatter]) => metricCard(label, raw, formatter)).join("");
      const periods = ["today", "current_week", "current_month", "current_year"];
      $("[data-revenue-cards]").innerHTML = periods.map((key) => {
        const item = revenue[key] || revenue[key.replace("current_", "")] || {};
        return `<article class="card revenue-card"><h3>${periodNames[key]}</h3><dl><div><dt>Verified online collections</dt><dd>${money(value(item, "verified_online_collections", "verified_online_amount", "online_collections"))}</dd></div><div><dt>Gross booked value</dt><dd>${money(value(item, "gross_booked_value", "booked_value"))}</dd></div></dl></article>`;
      }).join("");
      const grossSeries = array(trends, "daily_gross_booked_value", "gross_booked_value");
      const verifiedSeries = array(trends, "daily_verified_online_collections", "verified_online_collections");
      const bookingSeries = array(trends, "daily_booking_count", "booking_count");
      if (!trend.length && (grossSeries.length || verifiedSeries.length || bookingSeries.length)) {
        const indexed = new Map();
        [[grossSeries, "gross_booked_value"], [verifiedSeries, "verified_online_collections"], [bookingSeries, "booking_count"]].forEach(([series, key]) => series.forEach((item) => {
          const day = value(item, "date", "day", "label");
          indexed.set(day, { ...(indexed.get(day) || { date: day }), [key]: value(item, "value", "amount", "count", key) });
        }));
        trend = [...indexed.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
      }
      const dates = trend.map((item) => value(item, "date", "day", "label"));
      renderChart("[data-value-chart]", "[data-value-chart-empty]", "line", dates, [
        { label: "Gross booked value", data: trend.map((item) => number(value(item, "gross_booked_value", "booked_value"))), borderColor: "#c99b54", backgroundColor: "#c99b5430", tension: .25 },
        { label: "Verified online collections", data: trend.map((item) => number(value(item, "verified_online_collections", "verified_online_amount", "online_collections"))), borderColor: "#174d3a", backgroundColor: "#174d3a30", tension: .25 }
      ]);
      renderChart("[data-bookings-chart]", "[data-bookings-chart-empty]", "bar", dates, [{ label: "Bookings", data: trend.map((item) => number(value(item, "booking_count", "bookings"))), backgroundColor: "#4c9a78" }]);
      const normalizeDistribution = (items) => Array.isArray(items) ? items : Object.entries(items || {}).map(([label, count]) => ({ label, count }));
      const roomData = normalizeDistribution(roomBookings), statusData = normalizeDistribution(statuses);
      const palette = ["#174d3a", "#c99b54", "#4c9a78", "#74877e", "#d17a5b", "#725a8d"];
      renderChart("[data-room-chart]", "[data-room-chart-empty]", "doughnut", roomData.map((item) => value(item, "room_type", "label", "name")), [{ label: "Bookings", data: roomData.map((item) => number(value(item, "booking_count", "count", "value"))), backgroundColor: palette }]);
      renderChart("[data-status-chart]", "[data-status-chart-empty]", "doughnut", statusData.map((item) => value(item, "status", "booking_status", "label", "name")), [{ label: "Bookings", data: statusData.map((item) => number(value(item, "booking_count", "count", "value"))), backgroundColor: palette }]);
      $("[data-occupancy-rows]").innerHTML = occupancy.length ? occupancy.map((item) => `<tr><td><strong>${escapeHtml(value(item, "room_type", "name"))}</strong></td><td>${formatCount(value(item, "occupied_rooms", "occupied"))}</td><td>${formatCount(value(item, "blocked_rooms", "blocked"))}</td><td>${formatCount(value(item, "available_rooms", "available"))}</td><td>${formatCount(value(item, "total_rooms", "total"))}</td><td><strong>${percent(value(item, "occupancy_percentage", "occupancy_percent"))}</strong></td></tr>`).join("") : emptyRow(6, "No occupancy data available.");
      $("[data-payment-cards]").innerHTML = [
        ["Verified online amount", value(payments, "verified_online_amount", "verified_online_collections")], ["Expected pay-at-hotel amount", value(payments, "expected_pay_at_hotel_amount", "pay_at_hotel_expected")],
        ["Pending payment amount", value(payments, "pending_payment_amount", "pending_amount")], ["Completed bookings with unrecorded balance", value(payments, "completed_bookings_with_unrecorded_balance", "unrecorded_balance")]
      ].map(([label, raw]) => metricCard(label, raw, money)).join("");
      content.hidden = false;
    } catch (loadError) { showError(loadError); }
    finally { loading.hidden = true; button.disabled = false; }
  };
  $("[data-analytics-refresh]").addEventListener("click", load);
  await load();
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
  const assignmentSection = $("[data-assignment-section]"), assignmentContent = $("[data-assignment-content]");
  const assignmentActions = $("[data-assignment-actions]"), assignmentError = $("[data-assignment-error]");
  const modal = $("[data-room-modal]"), roomList = $("[data-room-list]"), roomError = $("[data-room-error]");
  let booking;
  const refreshBooking = async () => { const response = await AdminAuth.request(`/admin/bookings/${encodeURIComponent(id)}`); booking = response.booking || response.data || response; };
  const toast = (message) => { const el = $("[data-success]"); el.textContent = message; el.hidden = false; window.setTimeout(() => { el.hidden = true; }, 5000); };
  const setAssignmentLoading = (loading) => {
    assignmentSection.setAttribute("aria-busy", String(loading));
    assignmentActions.querySelectorAll("button").forEach((button) => { button.disabled = loading; });
    if (loading) { assignmentError.hidden = true; assignmentContent.innerHTML = '<div class="assignment-skeleton"><span></span><span></span><span></span></div>'; }
  };
  const loadAssignment = async () => {
    setAssignmentLoading(true);
    try {
      const response = await AdminAuth.request(`/admin/bookings/${encodeURIComponent(id)}/assignment`);
      const model = normalizeAssignment(response);
      assignmentContent.innerHTML = renderAssignment(model);
      assignmentActions.innerHTML = model.current
        ? '<button class="btn btn-danger btn-small" type="button" data-release-assignment>Release Assignment</button>'
        : '<button class="btn btn-small" type="button" data-assign-room>Assign Room</button>';
      assignmentError.hidden = true;
    } catch (_) { assignmentContent.innerHTML = ""; assignmentActions.innerHTML = ""; assignmentError.hidden = false; }
    finally { setAssignmentLoading(false); }
  };
  const openRooms = async () => {
    modal.showModal(); roomError.hidden = true;
    roomList.innerHTML = '<div class="room-loading" aria-label="Loading available rooms"><span class="spinner"></span><span>Loading rooms…</span></div>';
    const bookingType = String(get(booking, "room_type", "room", "roomType") || "");
    $("[data-room-modal-description]").textContent = bookingType ? `Rooms matching ${bookingType}` : "Choose an available room";
    try {
      const response = await AdminAuth.request("/admin/rooms/status");
      const rooms = listFrom(response, ["rooms", "data", "items"]).filter((room) => sameRoomType(get(room, "room_type", "type", "roomType"), bookingType));
      roomList.innerHTML = renderRooms(rooms);
    } catch (_) {
      roomList.innerHTML = '<div class="empty">Rooms could not be loaded. Please close this window and try again.</div>';
      roomError.textContent = "Available rooms could not be loaded."; roomError.hidden = false;
    }
  };
  const assignRoom = async (button) => {
    modal.querySelectorAll("button").forEach((item) => { item.disabled = true; }); roomError.hidden = true;
    try {
      await AdminAuth.request(`/admin/bookings/${encodeURIComponent(id)}/assign-room`, { method: "POST", body: JSON.stringify({ room_id: button.dataset.roomId }) });
      modal.close(); await refreshBooking(); await loadAssignment(); toast("Room assigned successfully.");
    } catch (error) {
      roomError.textContent = /ROOM_ASSIGNMENT_CONFLICT/.test(error.message) ? "This room is already assigned during the selected stay." : "The room could not be assigned. Please try again.";
      roomError.hidden = false; modal.querySelectorAll("button").forEach((item) => { item.disabled = false; });
    }
  };
  const releaseRoom = async (button) => {
    if (!confirm("Release this room assignment?")) return;
    button.disabled = true;
    try {
      await AdminAuth.request(`/admin/bookings/${encodeURIComponent(id)}/assign-room`, { method: "DELETE" });
      await refreshBooking(); await loadAssignment(); toast("Assignment released.");
    } catch (_) { showError(new Error("The assignment could not be released. Please try again.")); button.disabled = false; }
  };
  assignmentActions.addEventListener("click", (event) => {
    const assign = event.target.closest("[data-assign-room]"), release = event.target.closest("[data-release-assignment]");
    if (assign) openRooms(); if (release) releaseRoom(release);
  });
  roomList.addEventListener("click", (event) => { const button = event.target.closest("[data-room-id]"); if (button && !button.disabled) assignRoom(button); });
  $("[data-close-room-modal]").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.close(); });
  $("[data-assignment-retry]").addEventListener("click", loadAssignment);
  try {
    const data = await AdminAuth.request(`/admin/bookings/${encodeURIComponent(id)}`);
    booking = data.booking || data.data || data;
    $("[data-booking-title]").textContent = `Booking ${get(booking, "booking_id", "uuid", "id") || "details"}`;
    const privateFields = /(^id$|uuid|token|secret|password|email|phone|mobile|special.?requests?|payment.?id|razorpay|internal)/i;
    $("[data-fields]").innerHTML = Object.entries(booking).filter(([key, value]) => !privateFields.test(key) && (value === null || typeof value !== "object")).map(([key, value]) => `<div class="field"><dt>${escapeHtml(key.replace(/_/g, " "))}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
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
    await loadAssignment();
  } catch (error) { showError(error); }
}

const sameRoomType = (left, right) => !right || String(left || "").trim().toLowerCase() === String(right).trim().toLowerCase();
function normalizeAssignment(response = {}) {
  const payload = response.data || response;
  const candidate = payload.current_assignment || payload.assignment || payload.current || (get(payload, "room_number", "room_id") ? payload : null);
  const current = candidate && !get(candidate, "released_at", "releasedAt") && String(get(candidate, "status") || "").toLowerCase() !== "released" ? candidate : null;
  const history = listFrom(payload, ["history", "assignment_history", "assignments"]).slice().sort((a, b) => new Date(get(b, "assigned_at", "assignedAt") || 0) - new Date(get(a, "assigned_at", "assignedAt") || 0));
  return { current, history };
}
function renderAssignment({ current, history }) {
  const currentHtml = current ? `<dl class="assignment-details"><div><dt>Assigned room number</dt><dd>${escapeHtml(get(current, "room_number", "number", "room_no"))}</dd></div><div><dt>Room type</dt><dd>${escapeHtml(get(current, "room_type", "type"))}</dd></div><div><dt>Assignment status</dt><dd>${status(get(current, "status") || "Assigned")}</dd></div><div><dt>Assigned time</dt><dd>${dateTime(get(current, "assigned_at", "assignedAt"))}</dd></div></dl>` : '<p class="empty-assignment">No room assigned</p>';
  const rows = history.length ? history.map((item) => `<tr><td><strong>${escapeHtml(get(item, "room_number", "number", "room_no"))}</strong></td><td>${dateTime(get(item, "assigned_at", "assignedAt"))}</td><td>${dateTime(get(item, "released_at", "releasedAt"))}</td><td>${status(get(item, "status") || (get(item, "released_at", "releasedAt") ? "Released" : "Assigned"))}</td></tr>`).join("") : emptyRow(4, "No assignment history yet.");
  return `${currentHtml}<div class="assignment-history"><h3>Assignment History</h3><div class="table-scroll"><table><thead><tr><th>Room number</th><th>Assigned at</th><th>Released at</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function renderRooms(rooms) {
  if (!rooms.length) return '<div class="empty">No matching rooms are available for this room type.</div>';
  return rooms.map((room) => {
    const derived = String(get(room, "derived_status", "derivedStatus", "status") || "unknown").toLowerCase();
    const available = derived === "available", roomId = get(room, "uuid", "id", "room_id");
    return `<article class="room-option ${available ? "" : "room-disabled"}"><div class="room-option-head"><strong>Room ${escapeHtml(get(room, "room_number", "number", "room_no"))}</strong>${status(derived)}</div><dl><div><dt>Room type</dt><dd>${escapeHtml(get(room, "room_type", "type", "roomType"))}</dd></div><div><dt>Derived status</dt><dd>${escapeHtml(derived)}</dd></div><div><dt>Housekeeping status</dt><dd>${escapeHtml(get(room, "housekeeping_status", "housekeepingStatus"))}</dd></div><div><dt>Operational status</dt><dd>${escapeHtml(get(room, "operational_status", "operationalStatus"))}</dd></div></dl><button class="btn btn-small" type="button" data-room-id="${escapeHtml(roomId)}" ${available ? "" : "disabled"}>${available ? "Select room" : "Unavailable"}</button></article>`;
  }).join("");
}

const housekeepingValue = (task, ...keys) => get(task, ...keys);
const housekeepingStatus = (task) => String(housekeepingValue(task, "status", "current_status", "housekeeping_status") || "Pending").trim().toLowerCase();
const housekeepingTasks = (response = {}) => listFrom(response?.data || response, ["tasks", "items", "housekeeping_tasks", "data"]);
const housekeepingAction = (task) => {
  const current = housekeepingStatus(task), room = housekeepingValue(task, "room_number", "room_no", "room", "number") || "room";
  const actions = { pending: ["start", "▶ Start Cleaning"], cleaning: ["complete", "✔ Complete Cleaning"], completed: ["inspect", "🔍 Inspect Room"] };
  if (!actions[current]) return '<button class="btn btn-small housekeeping-action" type="button" disabled aria-label="Room ready">✓ Ready</button>';
  const [action, label] = actions[current];
  return `<button class="btn btn-small housekeeping-action" type="button" data-housekeeping-action="${action}" aria-label="${escapeHtml(label.replace(/^[^A-Za-z]+/, ""))} for room ${escapeHtml(room)}">${label}</button>`;
};
const housekeepingTaskModel = (task) => ({
  id: housekeepingValue(task, "uuid", "id", "task_id"), room: housekeepingValue(task, "room_number", "room_no", "room", "number"),
  type: housekeepingValue(task, "task_type", "type") || "Room cleaning", current: housekeepingStatus(task),
  created: housekeepingValue(task, "created_at", "createdAt", "created"), completed: housekeepingValue(task, "completed_at", "completedAt", "completed")
});
function renderHousekeepingTask(task, card = false) {
  const model = housekeepingTaskModel(task), badge = status(model.current.charAt(0).toUpperCase() + model.current.slice(1)), action = housekeepingAction(task);
  if (card) return `<article class="housekeeping-card" data-task-id="${escapeHtml(model.id)}"><div class="housekeeping-card-head"><strong>Room ${escapeHtml(model.room)}</strong>${badge}</div><dl><div><dt>Task Type</dt><dd>${escapeHtml(model.type)}</dd></div><div><dt>Created</dt><dd>${dateTime(model.created)}</dd></div><div><dt>Completed</dt><dd>${dateTime(model.completed)}</dd></div></dl>${action}</article>`;
  return `<tr data-task-id="${escapeHtml(model.id)}"><td><strong>${escapeHtml(model.room)}</strong></td><td>${escapeHtml(model.type)}</td><td>${badge}</td><td>${dateTime(model.created)}</td><td>${dateTime(model.completed)}</td><td>${action}</td></tr>`;
}
const housekeepingSkeletonRows = () => Array.from({ length: 5 }, () => '<tr class="housekeeping-skeleton" aria-hidden="true"><td colspan="6"><span></span></td></tr>').join("");

async function initHousekeeping() {
  const form = $("[data-housekeeping-filters]"), rows = $("[data-housekeeping-rows]"), cards = $("[data-housekeeping-cards]");
  const section = $("[data-housekeeping-section]"), errorNotice = $("[data-housekeeping-error]"), previous = $("[data-housekeeping-previous]"), next = $("[data-housekeeping-next]"), pageLabel = $("[data-housekeeping-page]");
  const state = { page: 1, limit: 20, hasNext: false };
  const setLoading = () => { section.setAttribute("aria-busy", "true"); errorNotice.hidden = true; rows.innerHTML = housekeepingSkeletonRows(); cards.innerHTML = '<div class="housekeeping-card-skeleton" aria-label="Loading housekeeping tasks"><span></span><span></span><span></span></div>'; previous.disabled = true; next.disabled = true; };
  const load = async () => {
    setLoading();
    const params = new URLSearchParams({ page: String(state.page), limit: String(state.limit) });
    new FormData(form).forEach((value, key) => { if (String(value).trim()) params.set(key, String(value).trim()); });
    try {
      const response = await AdminAuth.request(`/admin/housekeeping?${params}`), tasks = housekeepingTasks(response).slice().sort((a, b) => new Date(housekeepingValue(b, "created_at", "createdAt") || 0) - new Date(housekeepingValue(a, "created_at", "createdAt") || 0));
      const pagination = response?.pagination || response?.data?.pagination || {};
      state.page = Number(pagination.page ?? pagination.current_page ?? state.page) || 1;
      const totalPages = Number(pagination.total_pages ?? pagination.pages), total = Number(pagination.total ?? pagination.total_items);
      state.hasNext = pagination.has_next === true || (Number.isFinite(totalPages) ? state.page < totalPages : Number.isFinite(total) ? state.page * state.limit < total : tasks.length === state.limit);
      rows.innerHTML = tasks.length ? tasks.map((task) => renderHousekeepingTask(task)).join("") : emptyRow(6, "No housekeeping tasks match your filters.");
      cards.innerHTML = tasks.length ? tasks.map((task) => renderHousekeepingTask(task, true)).join("") : '<p class="empty">No housekeeping tasks match your filters.</p>';
      pageLabel.textContent = `Page ${state.page}`; previous.disabled = state.page <= 1; next.disabled = !state.hasNext;
    } catch (_) { rows.innerHTML = ""; cards.innerHTML = ""; errorNotice.hidden = false; }
    finally { section.setAttribute("aria-busy", "false"); }
  };
  const act = async (button) => {
    const container = button.closest("[data-task-id]"), action = button.dataset.housekeepingAction, taskId = container?.dataset.taskId;
    const prompts = { start: "Start cleaning this room?", complete: "Mark cleaning as complete?", inspect: "Confirm that this room has passed inspection?" };
    if (!taskId || !confirm(prompts[action])) return;
    button.disabled = true;
    try {
      await AdminAuth.request(`/admin/housekeeping/${encodeURIComponent(taskId)}/${action}`, { method: "POST" });
      const nextStatus = { start: "Cleaning", complete: "Completed", inspect: "Inspected" }[action];
      document.querySelectorAll(`[data-task-id="${CSS.escape(taskId)}"]`).forEach((item) => { const badge = item.querySelector(".status"); if (badge) { badge.className = `status status-${nextStatus.toLowerCase()}`; badge.textContent = nextStatus; } });
      await load(); const toast = $("[data-housekeeping-success]"); toast.textContent = `${nextStatus} status saved successfully.`; toast.hidden = false; window.setTimeout(() => { toast.hidden = true; }, 5000);
    } catch (_) { errorNotice.querySelector("strong").textContent = "That task could not be updated."; errorNotice.querySelector("p").textContent = "No changes were made. Please try again."; errorNotice.hidden = false; button.disabled = false; }
  };
  section.addEventListener("click", (event) => { const button = event.target.closest("[data-housekeeping-action]"); if (button && !button.disabled) act(button); });
  form.addEventListener("submit", (event) => { event.preventDefault(); state.page = 1; load(); });
  $("[data-housekeeping-status]").addEventListener("change", () => { state.page = 1; load(); });
  $("[data-housekeeping-refresh]").addEventListener("click", load); $("[data-housekeeping-retry]").addEventListener("click", load);
  previous.addEventListener("click", () => { if (state.page > 1) { state.page--; load(); } }); next.addEventListener("click", () => { if (state.hasNext) { state.page++; load(); } });
  await load();
}

if (typeof module !== "undefined") module.exports = { normalizeAssignment, renderAssignment, renderRooms, sameRoomType, housekeepingTasks, renderHousekeepingTask, housekeepingSkeletonRows };

function createReviewRow(review) {
  const row = document.createElement("tr"); row.dataset.review = String(get(review, "uuid", "id") || "");
  const addCell = (value, className) => { const cell = document.createElement("td"); if (className) cell.className = className; cell.textContent = String(value ?? "—"); row.append(cell); return cell; };
  addCell(get(review, "reviewer", "name")); addCell(review.email);
  addCell(`★ ${Number(review.rating) || 0}`, "rating"); addCell(get(review, "review", "message", "text"), "review-copy"); addCell(date(get(review, "date", "created_at", "createdAt")));
  const actionsCell = document.createElement("td"), actions = document.createElement("div"); actions.className = "actions";
  [["approved", "Approve", "btn btn-small"], ["rejected", "Reject", "btn btn-small btn-danger"]].forEach(([moderation, label, className]) => { const button = document.createElement("button"); button.type = "button"; button.className = className; button.dataset.moderate = moderation; button.textContent = label; actions.append(button); });
  actionsCell.append(actions); row.append(actionsCell); return row;
}
async function initReviews() {
  const body = $("[data-reviews]"); if (!body) return;
  try {
    const data = await AdminAuth.request("/admin/reviews?status=pending"), reviews = listFrom(data, ["reviews", "data", "items"]);
    body.replaceChildren();
    if (reviews.length) reviews.forEach((review) => body.append(createReviewRow(review)));
    else body.insertAdjacentHTML("beforeend", emptyRow(6, "No pending reviews"));
    body.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-moderate]"); if (!button) return;
      const row = button.closest("[data-review]"); row.querySelectorAll("button").forEach((control) => { control.disabled = true; });
      try { await AdminAuth.request(`/admin/reviews/${encodeURIComponent(row.dataset.review)}`, { method: "PATCH", body: JSON.stringify({ status: button.dataset.moderate }) }); row.remove(); if (!body.children.length) body.insertAdjacentHTML("beforeend", emptyRow(6, "No pending reviews")); }
      catch (error) { row.querySelectorAll("button").forEach((control) => { control.disabled = false; }); showError(error); }
    });
  } catch (error) { body.innerHTML = emptyRow(6, "Reviews could not be loaded. Please try again."); showError(error); }
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
  if (document.body.dataset.page !== "login" && !AdminAuth.requireAuth()) return;
  ({ dashboard: initDashboard, bookings: initBookings, booking: initBooking, reviews: initReviews, availability: initAvailability, housekeeping: initHousekeeping })[document.body.dataset.page]?.();
});
