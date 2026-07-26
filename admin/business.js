"use strict";

const businessValue = (item, ...keys) => keys.map((key) => item?.[key]).find((value) => value !== undefined && value !== null);
const businessList = (data, ...keys) => Array.isArray(data) ? data : keys.map((key) => data?.[key]).find(Array.isArray) || keys.map((key) => data?.data?.[key]).find(Array.isArray) || [];
const businessEscape = (value = "—") => String(value ?? "—").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const businessMoney = (value, currency = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(Number(value || 0));
const businessDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "—";
const safeStatus = (value) => String(value || "unknown").toLowerCase().replace(/[^a-z0-9-]/g, "-");
const badge = (value) => `<span class="status status-${safeStatus(value)}">${businessEscape(value || "Unknown")}</span>`;

function invoiceModel(raw = {}) {
  return {
    number: businessValue(raw, "invoice_number", "number", "invoice_no") || "—",
    booking: businessValue(raw, "booking_id", "booking_reference") || "—",
    guest: businessValue(raw, "guest_name", "customer_name", "guest") || "—",
    date: businessValue(raw, "invoice_date", "issued_at", "created_at"),
    amount: Number(businessValue(raw, "total_amount", "amount", "total") || 0),
    status: businessValue(raw, "payment_status", "status") || "Unknown",
    currency: businessValue(raw, "currency") || "INR",
    pdfUrl: businessValue(raw, "pdf_url", "download_url"),
    tax: Number(businessValue(raw, "gst_amount", "tax_amount") || 0),
    subtotal: Number(businessValue(raw, "subtotal", "net_amount") || 0)
  };
}
function invoiceRow(raw) {
  const item = invoiceModel(raw), number = businessEscape(item.number);
  return `<tr><td><strong>${number}</strong></td><td>${businessEscape(item.guest)}</td><td>${businessEscape(item.booking)}</td><td>${businessDate(item.date)}</td><td>${businessMoney(item.amount, item.currency)}</td><td>${badge(item.status)}</td><td><button class="btn btn-small btn-secondary" data-view-invoice="${number}" aria-label="View invoice ${number}">View</button></td></tr>`;
}
function invoiceCard(raw) {
  const item = invoiceModel(raw), number = businessEscape(item.number);
  return `<article class="invoice-card"><div><strong>${number}</strong>${badge(item.status)}</div><dl><div><dt>Guest</dt><dd>${businessEscape(item.guest)}</dd></div><div><dt>Booking</dt><dd>${businessEscape(item.booking)}</dd></div><div><dt>Total</dt><dd>${businessMoney(item.amount, item.currency)}</dd></div></dl><button class="btn btn-secondary" data-view-invoice="${number}" aria-label="View invoice ${number}">View details</button></article>`;
}
function renderInvoiceDetail(raw) {
  const item = invoiceModel(raw);
  return `<article class="print-sheet invoice-print"><header><h1>Invoice ${businessEscape(item.number)}</h1><p>${businessDate(item.date)}</p></header><dl class="detail-list"><div><dt>Guest</dt><dd>${businessEscape(item.guest)}</dd></div><div><dt>Booking ID</dt><dd>${businessEscape(item.booking)}</dd></div><div><dt>Payment status</dt><dd>${badge(item.status)}</dd></div><div><dt>Subtotal</dt><dd>${businessMoney(item.subtotal, item.currency)}</dd></div><div><dt>GST</dt><dd>${businessMoney(item.tax, item.currency)}</dd></div><div><dt>Total</dt><dd><strong>${businessMoney(item.amount, item.currency)}</strong></dd></div></dl></article>`;
}
function metricCards(data, definitions, currency = "INR") {
  return definitions.map(([label, keys, format = "number"]) => { const value = businessValue(data, ...keys); const output = format === "money" ? businessMoney(value, currency) : format === "percent" ? `${Number(value || 0).toFixed(1)}%` : Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 1 }); return `<article class="card report-metric"><p>${label}</p><strong>${output}</strong></article>`; }).join("");
}
function barChart(items, labelKeys, valueKeys, suffix = "") {
  const rows = Array.isArray(items) ? items : Object.entries(items || {}).map(([label, value]) => ({ label, value }));
  const values = rows.map((item) => Number(businessValue(item, ...valueKeys, "value") || 0)), max = Math.max(...values, 1);
  return rows.length ? rows.map((item, index) => `<div class="chart-row"><span>${businessEscape(businessValue(item, ...labelKeys, "label") || "—")}</span><i style="--bar:${Math.max(values[index] / max * 100, 2)}%"></i><strong>${values[index].toLocaleString("en-IN", { maximumFractionDigits: 1 })}${suffix}</strong></div>`).join("") : '<p class="empty">No chart data available.</p>';
}
function reportParams(root) {
  const params = new URLSearchParams({ period: root.querySelector("[data-period]").value });
  const from = root.querySelector("[data-from]").value, to = root.querySelector("[data-to]").value;
  if (from) params.set("from", from); if (to) params.set("to", to); return params;
}

async function initInvoices() {
  const form = document.querySelector("[data-invoice-filters]"), result = document.querySelector("[data-invoice-results]"), rows = document.querySelector("[data-invoice-rows]"), cards = document.querySelector("[data-invoice-cards]"), loading = document.querySelector("[data-loading]"), empty = document.querySelector("[data-empty]"), error = document.querySelector("[data-load-error]"), dialog = document.querySelector("[data-invoice-dialog]");
  const state = { page: 1, limit: 20, hasNext: false, invoices: [] }; let selected;
  const load = async () => {
    const params = new URLSearchParams({ page: state.page, limit: state.limit }); new FormData(form).forEach((value, key) => { if (String(value).trim()) params.set(key, value); });
    result.setAttribute("aria-busy", "true"); loading.hidden = false; error.hidden = true; empty.hidden = true; rows.innerHTML = ""; cards.innerHTML = "";
    try { const response = await AdminAuth.request(`/admin/invoices?${params}`); state.invoices = businessList(response, "invoices", "items"); const pagination = response?.pagination || response?.data?.pagination || {}; state.page = Number(pagination.page || state.page); state.hasNext = pagination.has_next === true || (state.invoices.length === state.limit && pagination.has_next !== false); rows.innerHTML = state.invoices.map(invoiceRow).join(""); cards.innerHTML = state.invoices.map(invoiceCard).join(""); empty.hidden = state.invoices.length > 0; }
    catch (_) { error.hidden = false; } finally { loading.hidden = true; result.setAttribute("aria-busy", "false"); document.querySelector("[data-page]").textContent = `Page ${state.page}`; document.querySelector("[data-previous]").disabled = state.page <= 1; document.querySelector("[data-next]").disabled = !state.hasNext; }
  };
  result.addEventListener("click", (event) => { const button = event.target.closest("[data-view-invoice]"); if (!button) return; selected = state.invoices.find((raw) => String(invoiceModel(raw).number) === button.dataset.viewInvoice); if (!selected) return; document.querySelector("[data-invoice-title]").textContent = `Invoice ${invoiceModel(selected).number}`; document.querySelector("[data-invoice-detail]").innerHTML = renderInvoiceDetail(selected); dialog.showModal(); });
  form.addEventListener("submit", (event) => { event.preventDefault(); state.page = 1; load(); }); form.addEventListener("reset", () => setTimeout(() => { state.page = 1; load(); }));
  document.querySelector("[data-retry]").addEventListener("click", load); document.querySelector("[data-previous]").addEventListener("click", () => { if (state.page > 1) { state.page--; load(); } }); document.querySelector("[data-next]").addEventListener("click", () => { if (state.hasNext) { state.page++; load(); } }); document.querySelector("[data-close]").addEventListener("click", () => dialog.close()); document.querySelector("[data-print-invoice]").addEventListener("click", () => window.print()); document.querySelector("[data-download-invoice]").addEventListener("click", () => { const url = invoiceModel(selected).pdfUrl; if (url) { const link = document.createElement("a"); link.href = url; link.download = `${invoiceModel(selected).number}.pdf`; link.rel = "noopener"; link.click(); } else window.print(); }); await load();
}

async function initReport(type) {
  const content = document.querySelector("[data-report-content]"), loading = document.querySelector("[data-loading]"), error = document.querySelector("[data-load-error]"), empty = document.querySelector("[data-empty]");
  const load = async () => { loading.hidden = false; content.hidden = true; error.hidden = true; try { const response = await AdminAuth.request(`/admin/analytics/${type}?${reportParams(document)}`), data = response?.data || response?.report || response || {}, currency = data.currency || "INR"; if (type === "revenue") { document.querySelector("[data-metrics]").innerHTML = metricCards(data, [["Gross Revenue", ["gross_revenue", "gross_booked_value"], "money"], ["Net Revenue", ["net_revenue"], "money"], ["GST Collected", ["gst_collected", "tax_collected"], "money"], ["Pending Payments", ["pending_payments", "pending_amount"], "money"], ["Refunds", ["refunds", "refund_amount"], "money"], ["Average Booking Value", ["average_booking_value", "avg_booking_value"], "money"]], currency); document.querySelector("[data-daily-chart]").innerHTML = barChart(businessList(data, "daily_revenue", "daily"), ["date", "day"], ["revenue", "amount"]); document.querySelector("[data-monthly-chart]").innerHTML = barChart(businessList(data, "monthly_revenue", "monthly"), ["month", "date"], ["revenue", "amount"]); document.querySelector("[data-room-chart]").innerHTML = barChart(businessList(data, "revenue_by_room_type", "room_types"), ["room_type", "name"], ["revenue", "amount"]); }
      else { document.querySelector("[data-metrics]").innerHTML = metricCards(data, [["Occupancy", ["occupancy_percentage", "occupancy"], "percent"], ["ADR", ["adr"], "money"], ["RevPAR", ["revpar"], "money"], ["Average Stay", ["average_stay"], "number"], ["Available Room Nights", ["available_room_nights"]], ["Sold Room Nights", ["sold_room_nights"]], ["Cancellation", ["cancellation_percentage", "cancellation_rate"], "percent"], ["No-show", ["no_show_percentage", "no_show_rate"], "percent"]], currency); document.querySelector("[data-trend-chart]").innerHTML = barChart(businessList(data, "occupancy_trend", "trend"), ["date", "day"], ["occupancy", "percentage"], "%"); document.querySelector("[data-utilization-chart]").innerHTML = barChart(businessList(data, "room_utilization", "room_types"), ["room_type", "name"], ["utilization", "percentage"], "%"); }
      content.hidden = false; empty.hidden = Object.keys(data).length > 0; } catch (_) { error.hidden = false; } finally { loading.hidden = true; } };
  document.querySelector("[data-refresh]").addEventListener("click", load); document.querySelector("[data-retry]").addEventListener("click", load); document.querySelector("[data-period]").addEventListener("change", (event) => { const custom = event.target.value === "custom"; document.querySelectorAll("[data-from],[data-to]").forEach((input) => { input.disabled = !custom; }); }); document.querySelector("[data-print-report]").addEventListener("click", () => window.print()); await load();
}
async function initExports() {
  const types = ["Bookings", "Revenue", "Occupancy", "Housekeeping", "Maintenance", "Reviews"], formats = ["CSV", "Excel", "PDF"], grid = document.querySelector("[data-export-grid]");
  grid.innerHTML = types.map((type) => `<article class="card export-card"><h2>${type}</h2><label><span>Format</span><select class="select" data-format>${formats.map((format) => `<option value="${format.toLowerCase()}">${format}</option>`).join("")}</select></label><button class="btn" data-export="${type.toLowerCase()}">Export ${type}</button></article>`).join("");
  grid.addEventListener("click", async (event) => { const button = event.target.closest("[data-export]"); if (!button) return; const format = button.parentElement.querySelector("[data-format]").value, error = document.querySelector("[data-export-error]"), toast = document.querySelector("[data-success]"); button.disabled = true; error.hidden = true; try { const response = await AdminAuth.request(`/admin/exports/${button.dataset.export}?format=${format}`, { method: "POST" }), url = businessValue(response, "download_url", "url"); if (url) { const link = document.createElement("a"); link.href = url; link.download = ""; link.rel = "noopener"; link.click(); } toast.textContent = `${button.dataset.export} ${format.toUpperCase()} export is ready.`; toast.hidden = false; setTimeout(() => { toast.hidden = true; }, 5000); } catch (_) { error.textContent = "Export could not be created. Please retry."; error.hidden = false; } finally { button.disabled = false; } });
}
async function initSettings() {
  const form = document.querySelector("[data-settings-form]"), loading = document.querySelector("[data-loading]"), error = document.querySelector("[data-load-error]");
  const load = async () => { loading.hidden = false; error.hidden = true; form.hidden = true; try { const response = await AdminAuth.request("/admin/settings/business"), settings = response?.settings || response?.data || response || {}; [...form.elements].forEach((field) => { if (field.name && field.type !== "file" && settings[field.name] != null) field.value = settings[field.name]; }); form.hidden = false; document.querySelector("[data-logo-support]").textContent = settings.logo_upload_supported ? "PNG, JPG, or WebP." : "Logo upload is unavailable on this server."; form.logo.disabled = !settings.logo_upload_supported; } catch (_) { error.hidden = false; } finally { loading.hidden = true; } };
  form.addEventListener("submit", async (event) => { event.preventDefault(); const button = form.querySelector("button[type=submit]"), payload = {}; new FormData(form).forEach((value, key) => { if (key !== "logo") payload[key] = value; }); button.disabled = true; try { await AdminAuth.request("/admin/settings/business", { method: "PATCH", body: JSON.stringify(payload) }); const toast = document.querySelector("[data-success]"); toast.hidden = false; setTimeout(() => { toast.hidden = true; }, 5000); } catch (_) { error.hidden = false; } finally { button.disabled = false; } }); document.querySelector("[data-retry]").addEventListener("click", load); await load();
}
if (typeof module !== "undefined") module.exports = { invoiceModel, invoiceRow, invoiceCard, renderInvoiceDetail, metricCards, barChart, safeStatus };
if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", () => { AdminAuth.requireAuth(); ({ invoices: initInvoices, revenue: () => initReport("revenue"), occupancy: () => initReport("occupancy"), exports: initExports, settings: initSettings })[document.body.dataset.page]?.(); });
