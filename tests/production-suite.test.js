"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const read = (path) => fs.readFileSync(path, "utf8");
const css = read("admin/admin.css");
const sidebar = read("admin/sidebar.js");
const auth = read("admin/auth.js");
const admin = read("admin/admin.js");

const pages = fs.readdirSync("admin").filter((name) => name.endsWith(".html"));

test("every admin page declares language, viewport, title and noindex", () => {
  for (const page of pages) {
    const html = read(`admin/${page}`);
    assert.match(html, /<html lang="en">/i, page);
    assert.match(html, /name="viewport"/i, page);
    assert.match(html, /<title>[^<]+<\/title>/i, page);
    assert.match(html, /noindex,nofollow/i, page);
  }
});

test("production shell supports skip navigation, menu state, escape and offline feedback", () => {
  assert.match(sidebar, /Skip to main content/);
  assert.match(sidebar, /aria-expanded/);
  assert.match(sidebar, /event\.key === "Escape"/);
  assert.match(sidebar, /addEventListener\("offline"/);
  assert.match(sidebar, /navigator\.onLine/);
});

test("responsive, print, focus, reduced motion and dark schemes are defined", () => {
  for (const token of ["max-width:340px", "max-width:480px", "max-width:900px", "@media print", "prefers-reduced-motion", ":focus-visible", "data-theme=dark"]) {
    assert.ok(css.includes(token), token);
  }
});

test("authentication limits credentials to the tab and sanitizes server errors", () => {
  assert.match(auth, /sessionStorage/);
  assert.doesNotMatch(auth, /localStorage/);
  assert.match(auth, /safeError/);
  assert.doesNotMatch(auth, /data\.error \|\| data\.message/);
  assert.match(admin, /uuid\|token\|secret\|password/);
});
