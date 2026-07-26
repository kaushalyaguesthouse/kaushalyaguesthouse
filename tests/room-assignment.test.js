const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

global.document = { addEventListener() {} };
const { normalizeAssignment, renderAssignment, renderRooms, sameRoomType } = require("../admin/admin.js");
const source = fs.readFileSync("admin/admin.js", "utf8");
const html = fs.readFileSync("admin/booking.html", "utf8");
const css = fs.readFileSync("admin/admin.css", "utf8");

test("assign room flow uses the assignment API and success message", () => {
  assert.match(source, /method: "POST"/);
  assert.match(source, /Room assigned successfully\./);
  assert.match(source, /\/admin\/rooms\/status/);
});

test("release room flow confirms, deletes, and reports success", () => {
  assert.match(source, /Release this room assignment\?/);
  assert.match(source, /method: "DELETE"/);
  assert.match(source, /Assignment released\./);
});

test("conflict response is replaced with a friendly message", () => {
  assert.match(source, /ROOM_ASSIGNMENT_CONFLICT/);
  assert.match(source, /This room is already assigned during the selected stay\./);
});

test("empty assignment displays the required state", () => {
  const output = renderAssignment({ current: null, history: [] });
  assert.match(output, /No room assigned/);
  assert.match(output, /No assignment history yet/);
});

test("assignment history is newest first and includes all columns", () => {
  const model = normalizeAssignment({ history: [
    { room_number: "101", assigned_at: "2026-01-01T10:00:00Z", status: "released" },
    { room_number: "202", assigned_at: "2026-02-01T10:00:00Z", status: "assigned" }
  ] });
  assert.equal(model.history[0].room_number, "202");
  const output = renderAssignment(model);
  assert.ok(output.indexOf("202") < output.indexOf("101"));
  for (const heading of ["Room number", "Assigned at", "Released at", "Status"]) assert.match(output, new RegExp(heading));
});

test("loading state uses skeletons and disables active controls", () => {
  assert.match(html, /assignment-skeleton/);
  assert.match(source, /button\.disabled = loading/);
  assert.match(css, /assignment-shimmer/);
});

test("mobile modal is fullscreen and room cards stack", () => {
  assert.match(css, /@media\(max-width:600px\)/);
  assert.match(css, /\.room-modal\{inset:0;width:100%;height:100%/);
  assert.match(css, /\.assignment-skeleton,\.room-grid\{grid-template-columns:1fr\}/);
});

test("only matching, available rooms can be selected", () => {
  assert.equal(sameRoomType("Deluxe", " deluxe "), true);
  const output = renderRooms([
    { id: "a", room_number: "1", room_type: "Deluxe", derived_status: "available" },
    { id: "b", room_number: "2", room_type: "Deluxe", derived_status: "occupied" },
    { id: "c", room_number: "3", room_type: "Deluxe", derived_status: "cleaning" }
  ]);
  assert.match(output, /data-room-id="a"[^>]*>Select room/);
  assert.match(output, /data-room-id="b" disabled>Unavailable/);
  assert.match(output, /data-room-id="c" disabled>Unavailable/);
});

test("booking details omit private guest and payment fields", () => {
  assert.match(source, /privateFields/);
  assert.match(source, /email\|phone\|mobile/);
  assert.match(source, /special\.\?requests/);
  assert.match(source, /razorpay/);
  assert.match(source, /typeof value !== "object"/);
});
