const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

global.document = { addEventListener() {} };
const { housekeepingTasks, renderHousekeepingTask, housekeepingSkeletonRows } = require("../admin/admin.js");
const source = fs.readFileSync("admin/admin.js", "utf8");
const html = fs.readFileSync("admin/housekeeping.html", "utf8");
const css = fs.readFileSync("admin/admin.css", "utf8");
const sidebar = fs.readFileSync("admin/sidebar.js", "utf8");

const task = (status) => ({ id: "task-1", room_number: "204", task_type: "Checkout clean", status, created_at: "2026-07-26T09:00:00Z", completed_at: status === "completed" ? "2026-07-26T10:00:00Z" : null });

test("task loading accepts supported API response shapes", () => {
  assert.equal(housekeepingTasks({ tasks: [task("pending")] }).length, 1);
  assert.equal(housekeepingTasks({ data: { items: [task("pending")] } }).length, 1);
  assert.match(source, /AdminAuth\.request\(`\/admin\/housekeeping\?\$\{params\}`\)/);
});

test("status and room filters are sent with backend pagination", () => {
  assert.match(html, /name="status"/);
  assert.match(html, /name="room_number"/);
  assert.match(source, /page: String\(state\.page\), limit: String\(state\.limit\)/);
});

test("previous and next paginate and display the current page", () => {
  assert.match(html, /data-housekeeping-previous>Previous/);
  assert.match(html, /data-housekeeping-page>Page 1/);
  assert.match(html, /data-housekeeping-next>Next/);
  assert.match(source, /state\.page\+\+/);
});

test("each housekeeping status has its required action", () => {
  assert.match(renderHousekeepingTask(task("pending")), /data-housekeeping-action="start"[^>]*aria-label="Start Cleaning for room 204"/);
  assert.match(renderHousekeepingTask(task("cleaning")), /data-housekeeping-action="complete"/);
  assert.match(renderHousekeepingTask(task("completed")), /data-housekeeping-action="inspect"/);
  assert.match(renderHousekeepingTask(task("inspected")), /disabled aria-label="Room ready">✓ Ready/);
  for (const endpoint of ["start", "complete", "inspect"]) assert.match(source, new RegExp(endpoint));
  assert.match(source, /method: "POST"/);
});

test("loading uses skeleton rows and disables pagination", () => {
  assert.equal((housekeepingSkeletonRows().match(/housekeeping-skeleton/g) || []).length, 5);
  assert.match(source, /previous\.disabled = true; next\.disabled = true/);
  assert.match(css, /housekeeping-skeleton/);
});

test("empty and friendly retry states are present", () => {
  assert.match(source, /No housekeeping tasks match your filters\./);
  assert.match(html, /data-housekeeping-retry>Retry/);
  assert.match(html, /Please check your connection and try again\./);
  assert.doesNotMatch(source, /stack/);
});

test("mobile layout switches the table to full-width action cards", () => {
  assert.match(css, /@media\(max-width:600px\).*?\.housekeeping-table\{display:none\}/s);
  assert.match(css, /\.housekeeping-cards\{display:grid/);
  assert.match(css, /\.housekeeping-card \.housekeeping-action\{width:100%/);
});

test("housekeeping UI does not render private guest or payment fields", () => {
  for (const privateField of ["guest phone", "guest email", "payment id", "razorpay", "special request"]) assert.doesNotMatch(html.toLowerCase(), new RegExp(privateField));
  const output = renderHousekeepingTask({ ...task("pending"), phone: "private", email: "private@example.test", razorpay_id: "pay_1", special_requests: "private" });
  for (const secret of ["private", "private@example.test", "pay_1"]) assert.doesNotMatch(output, new RegExp(secret.replace(".", "\\.")));
});

test("navigation exposes the authenticated housekeeping page", () => {
  assert.match(sidebar, /href="housekeeping\.html"/);
  assert.match(html, /auth\.js.*sidebar\.js.*admin\.js/s);
});
