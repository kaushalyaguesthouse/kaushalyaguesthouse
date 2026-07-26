"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const read = (file) => fs.readFileSync(file, "utf8");
const pages = fs.readdirSync("admin").filter((file) => file.endsWith(".html"));
const allAdmin = fs.readdirSync("admin").filter((file) => /\.(?:html|js|css)$/.test(file)).map((file) => read(`admin/${file}`)).join("\n");

test("admin pages load configuration before authentication and reference existing relative assets", () => {
  for (const page of pages) {
    const html = read(`admin/${page}`), configAt = html.indexOf('../api-config.js'), authAt = html.indexOf('src="auth.js"');
    assert.ok(configAt >= 0 && authAt > configAt, page);
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const asset = match[1]; if (/^(?:https?:|#)/.test(asset) || asset.includes("?") || !/\.(?:js|css|html|png|jpe?g)$/i.test(asset)) continue;
      assert.ok(fs.existsSync(path.resolve("admin", asset)), `${page}: ${asset}`);
    }
  }
});
test("admin sources contain no local URLs or common server secret patterns", () => {
  assert.doesNotMatch(allAdmin, /localhost|127\.0\.0\.1|http:\/\//i);
  assert.doesNotMatch(allAdmin, /service[_-]?role|razorpay[_-]?secret|key_secret|supabase_service|sk_live_/i);
});
test("admin routes follow the deployed contract inventory", () => {
  const modules = read("admin/admin.js") + read("admin/business.js"), source = read("admin/auth.js") + modules;
  for (const route of ["/admin/login", "/admin/analytics/summary", "/admin/bookings", "/assignment", "/assign-room", "/admin/rooms/status", "/admin/availability", "/admin/housekeeping", "/admin/reviews", "/admin/invoices", "/admin/analytics/${type}", "/admin/exports/", "/admin/settings/business"]) assert.ok(source.includes(route), route);
  assert.doesNotMatch(modules, /\bfetch\s*\(/, "page modules must use AdminAuth.request");
});
test("unauthorized requests clear the tab session and redirect under the current Pages folder", async () => {
  const removed = [], redirects = [];
  const response = { status: 403, ok: false, async text() { return JSON.stringify({ message: "private" }); } };
  const context = { window: { KGH_CONFIG: { API_BASE_URL: "https://api.example", REQUEST_TIMEOUT_MS: 100 }, location: { href: "https://example.test/repo/admin/dashboard.html", replace(url) { redirects.push(url); } }, setTimeout, clearTimeout }, document: { body: { dataset: { page: "dashboard" } } }, sessionStorage: { getItem() { return "token"; }, removeItem(key) { removed.push(key); }, setItem() {} }, navigator: { onLine: true }, fetch: async () => response, AbortController, FormData, URL, JSON, Error };
  vm.createContext(context); vm.runInContext(read("admin/auth.js"), context);
  await assert.rejects(context.window.AdminAuth.request("/admin/bookings"), /no longer authorized/);
  assert.deepEqual(removed, ["kgh_admin_token"]); assert.match(redirects[0], /^https:\/\/example\.test\/repo\/admin\/login\.html\?reason=expired$/);
});
test("failed admin actions restore controls and loaders settle", () => {
  const admin = read("admin/admin.js"), business = read("admin/business.js"), login = read("admin/login.js");
  assert.match(admin, /finally \{ button\.disabled = false; \}/);
  assert.match(business, /finally \{ button\.disabled = false; \}/);
  assert.match(login, /finally \{ button\.disabled = false;/);
  assert.match(admin, /finally \{ loading\.hidden = true; button\.disabled = false; \}/);
  assert.match(business, /finally \{ loading\.hidden = true;/);
});
test("missing optional login form does not crash initialization and review guest data uses textContent", () => {
  const listeners = []; const context = { document: { addEventListener(_event, callback) { listeners.push(callback); }, querySelector() { return null; } }, window: { location: { replace() {} } }, AdminAuth: { isAuthenticated() { return false; } } };
  vm.createContext(context); vm.runInContext(read("admin/login.js"), context); assert.doesNotThrow(() => listeners[0]());
  assert.match(read("admin/admin.js"), /function createReviewRow[\s\S]*cell\.textContent/);
});
