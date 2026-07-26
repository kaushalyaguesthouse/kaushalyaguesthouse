"use strict";
document.addEventListener("DOMContentLoaded", () => {
  if (AdminAuth.isAuthenticated()) { window.location.replace(AdminAuth.dashboardUrl()); return; }
  const form = document.querySelector("[data-login-form]"); if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); const button = event.submitter || form.querySelector("button[type=submit]"), error = document.querySelector("[data-error]"); if (!button || !error) return;
    button.disabled = true; button.textContent = "Signing in…"; error.hidden = true;
    try { await AdminAuth.login(form.elements.bootstrapKey.value); window.location.replace(AdminAuth.dashboardUrl()); }
    catch (loginError) { error.textContent = loginError.message; error.hidden = false; }
    finally { button.disabled = false; button.textContent = "Sign in securely"; }
  });
});
