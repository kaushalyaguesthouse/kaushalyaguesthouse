"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("script.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const config = fs.readFileSync("api-config.js", "utf8");
const context = {
  window: { KGH_CONFIG: { API_BASE_URL: "https://kaushalya-backend.onrender.com", REQUEST_TIMEOUT_MS: 10 }, addEventListener() {} },
  document: { addEventListener() {} }, Intl, Date, Math, Number, Object, String, JSON, console,
  setTimeout, clearTimeout, navigator: { onLine: true },
  sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  crypto: { randomUUID() { return "test-id"; } }
};
vm.createContext(context);
vm.runInContext(source, context);
const core = context.window.KGH_TEST;

test("nights, complimentary nights and rupee advance are calculated exactly", () => {
  assert.deepEqual({ ...core.calculateBookingTotals("2026-08-01", "2026-08-02", "AC Room") }, { nights: 1, billableNights: 1, total: 1500, advance: 450 });
  assert.deepEqual({ ...core.calculateBookingTotals("2026-08-01", "2026-08-08", "Non AC Room") }, { nights: 7, billableNights: 6, total: 7200, advance: 2160 });
  assert.equal(core.calculateBookingTotals("2026-08-02", "2026-08-02", "AC Room"), null);
  assert.equal(core.calculateBookingTotals("2026-08-03", "2026-08-02", "AC Room"), null);
});

test("create-order accepts current flat and reconciled nested API response shapes", () => {
  assert.deepEqual({ ...core.normalizeOrderResponse({ success: true, order_id: "order_1", key_id: "rzp_live_public", amount: 45000 }) }, { success: true, orderId: "order_1", keyId: "rzp_live_public", amount: 45000, currency: "INR" });
  assert.deepEqual({ ...core.normalizeOrderResponse({ success: true, key: "rzp_live_public", order: { id: "order_2", amount: 45000, currency: "INR" } }) }, { success: true, orderId: "order_2", keyId: "rzp_live_public", amount: 45000, currency: "INR" });
});

test("every booking failure and Razorpay close/failure path is recoverable", () => {
  assert.match(source, /paymentMethod === "later" \|\| !checkoutOpened\) resetBookingButton/);
  assert.match(source, /ondismiss: \(\) => \{[^}]*Payment cancelled[^}]*resetBookingButton/s);
  assert.match(source, /razorpay\.on\("payment\.failed"[^\n]*resetBookingButton/);
  assert.match(source, /handler: async[\s\S]*finally \{\s*resetBookingButton\(\)/);
  assert.match(source, /if \(!window\.Razorpay\) throw/);
  assert.match(source, /if \(isSubmitting\) return/);
});

test("payment and booking contracts are complete and backend-authoritative", () => {
  for (const field of ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature"]) assert.match(source, new RegExp(field));
  assert.match(source, /Number\.isSafeInteger\(order\.amount\)/);
  assert.match(source, /Idempotency-Key/);
  assert.match(source, /parseBackendResponse/);
});

test("production frontend has one HTTPS API URL and no client secrets", () => {
  assert.match(config, /https:\/\/kaushalya-backend\.onrender\.com/);
  assert.doesNotMatch(source + html + config, /localhost|127\.0\.0\.1|http:\/\//i);
  assert.doesNotMatch(source + html + config, /service_role|razorpay_secret|key_secret|SUPABASE_SERVICE/i);
  assert.equal((source + fs.readFileSync("admin/auth.js", "utf8")).match(/https:\/\/kaushalya-backend\.onrender\.com/g), null);
});

test("reviews use text-safe DOM rendering", () => {
  assert.match(source, /quote\.textContent/);
  assert.match(source, /byline\.textContent/);
  assert.doesNotMatch(source.slice(source.indexOf("function renderReview")), /innerHTML/);
});

test("scripts load in safe order and external links isolate their opener", () => {
  assert.ok(html.indexOf("api-config.js") < html.indexOf("script.js"));
  assert.match(html, /checkout\.razorpay\.com\/v1\/checkout\.js/);
  for (const match of html.matchAll(/target="_blank"[^>]*>/g)) assert.match(match[0], /rel="noopener noreferrer"/);
});
