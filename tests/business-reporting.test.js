const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
global.document = { addEventListener() {} };
const ui = require("../admin/business.js");
const source = fs.readFileSync("admin/business.js", "utf8");
const css = fs.readFileSync("admin/business.css", "utf8");
const page = (name) => fs.readFileSync(`admin/${name}.html`, "utf8");

test("invoice models omit internal IDs and payment secrets", () => {
  const raw = { id: "internal", invoice_number: "INV-7", guest_name: "Asha", booking_id: "KGH-4", payment_secret: "secret", jwt: "token", total_amount: 4500 };
  const output = ui.invoiceRow(raw) + ui.renderInvoiceDetail(raw);
  assert.match(output, /INV-7/); assert.match(output, /Asha/);
  for (const secret of ["internal", "secret", "token"]) assert.doesNotMatch(output, new RegExp(secret));
});
test("invoice filters, pagination, responsive cards and actions are accessible", () => {
  const html = page("invoices");
  assert.match(html, /Guest, Booking ID, Invoice #/); assert.match(html, /name="from"/); assert.match(html, /name="payment_status"/);
  assert.match(html, /data-previous/); assert.match(html, /data-next/); assert.match(html, /<caption class="sr-only">/);
  assert.match(html, /Download PDF/); assert.match(html, /data-print-invoice/); assert.match(css, /@media\(max-width:600px\).*\.desktop-only\{display:none\}/s);
});
test("revenue and occupancy expose all metrics, ranges, charts and printing", () => {
  const revenue = page("revenue"), occupancy = page("occupancy");
  for (const text of ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Monthly", "Yearly", "Custom Date Range"]) assert.match(revenue, new RegExp(text));
  for (const text of ["Gross Revenue", "Net Revenue", "GST Collected", "Pending Payments", "Refunds", "Average Booking Value"]) assert.match(source, new RegExp(text));
  for (const text of ["Occupancy", "ADR", "RevPAR", "Average Stay", "Available Room Nights", "Sold Room Nights", "Cancellation", "No-show"]) assert.match(source, new RegExp(text));
  assert.match(revenue, /Daily Revenue.*Monthly Revenue.*Revenue by Room Type/s); assert.match(occupancy, /Occupancy Trend.*Room Utilization/s); assert.match(source, /window\.print\(\)/);
});
test("export center supports every report and format", () => {
  for (const value of ["Bookings", "Revenue", "Occupancy", "Housekeeping", "Maintenance", "Reviews", "CSV", "Excel", "PDF"]) assert.match(source, new RegExp(value));
  assert.match(source, /\/admin\/exports/); assert.match(page("exports"), /data-export-error/);
});
test("business settings includes supported editable metadata", () => {
  const html = page("settings");
  for (const field of ["business_name", "gst_number", "gst_percent", "address", "phone", "email", "invoice_prefix", "timezone", "currency", "logo", "invoice_footer"]) assert.match(html, new RegExp(`name="${field}"`));
  assert.match(source, /logo_upload_supported/); assert.match(source, /method: "PATCH"/);
});
test("UX includes loading, retry, empty, dark mode and A4 layouts", () => {
  for (const name of ["invoices", "revenue", "occupancy", "settings"]) { const html = page(name); assert.match(html, /data-loading/); assert.match(html, /data-retry/); }
  assert.match(page("invoices"), /data-empty/); assert.match(page("revenue"), /data-empty/); assert.match(css, /@page\{size:A4/); assert.match(css, /var\(--surface\)/);
  assert.match(fs.readFileSync("admin/sidebar.js", "utf8"), /data-theme/);
});
test("errors stay friendly without stack traces or authentication material", () => {
  assert.doesNotMatch(source, /\.stack|Authorization|Bearer|jwt|payment_secret/i);
  assert.match(source, /Please retry|Please check your connection/);
});
