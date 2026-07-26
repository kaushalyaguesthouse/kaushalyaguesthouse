"use strict";
window.AdminAuth = (() => {
  const TOKEN_KEY = "kgh_admin_token", config = window.KGH_CONFIG || {};
  const API_BASE = String(config.API_BASE_URL || "").replace(/\/$/, ""), timeoutMs = Number(config.REQUEST_TIMEOUT_MS) || 15000;
  let token = sessionStorage.getItem(TOKEN_KEY), redirecting = false;
  const pageUrl = (page) => new URL(page, window.location.href).href;
  const clearSession = () => { token = null; sessionStorage.removeItem(TOKEN_KEY); };
  const redirectToLogin = (reason = "session") => { clearSession(); if (redirecting || document.body?.dataset.page === "login") return; redirecting = true; const url = new URL(pageUrl("login.html")); url.searchParams.set("reason", reason); window.location.replace(url.href); };
  const safeError = (status, payload) => {
    if (status === 401 || status === 403) return "Your session is no longer authorized. Please sign in again.";
    if (status === 409) return payload?.code === "ROOM_ASSIGNMENT_CONFLICT" ? "ROOM_ASSIGNMENT_CONFLICT" : "That change conflicts with existing data. Refresh and try again.";
    if (status === 429) return "Too many requests. Please wait a moment and try again.";
    if (status >= 500) return "The service is temporarily unavailable. Please try again.";
    return "The request could not be completed. Please review the form and try again.";
  };
  const parseResponse = async (response, responseType) => { if (response.status === 204) return null; if (responseType === "blob" && response.ok) return response.blob(); const text = await response.text(); if (!text) return null; try { return JSON.parse(text); } catch (_) { if (!response.ok) return null; throw new Error("The server returned an unreadable response. Please try again."); } };
  const fetchWithTimeout = async (url, options) => { const controller = new AbortController(), timer = window.setTimeout(() => controller.abort(), timeoutMs); try { return await fetch(url, { ...options, signal: controller.signal }); } catch (error) { if (error?.name === "AbortError") throw new Error("The request timed out. Please try again."); throw new Error(navigator.onLine ? "The service could not be reached. Please try again." : "You are offline. Reconnect and try again."); } finally { window.clearTimeout(timer); } };
  const login = async (bootstrapKey) => { if (!API_BASE) throw new Error("The admin API is not configured."); const response = await fetchWithTimeout(`${API_BASE}/admin/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ bootstrapKey }) }); const data = await parseResponse(response); if (!response.ok) throw new Error(safeError(response.status, data)); token = data?.accessToken || data?.access_token || data?.token; if (!token) throw new Error("The server did not return an access token."); sessionStorage.setItem(TOKEN_KEY, token); return data; };
  const logout = () => redirectToLogin("logout");
  const request = async (path, options = {}) => { if (!token) { redirectToLogin("session"); throw new Error("Authentication is required."); } if (!API_BASE || !String(path).startsWith("/")) throw new Error("The admin API request is not configured correctly."); const { responseType, headers: suppliedHeaders, ...fetchOptions } = options; const headers = { Accept: responseType === "blob" ? "*/*" : "application/json", Authorization: `Bearer ${token}`, ...suppliedHeaders }; if (fetchOptions.body != null && !(fetchOptions.body instanceof FormData) && !headers["Content-Type"]) headers["Content-Type"] = "application/json"; const response = await fetchWithTimeout(`${API_BASE}${path}`, { ...fetchOptions, headers }); const data = await parseResponse(response, responseType); if (response.status === 401 || response.status === 403) { redirectToLogin("expired"); throw new Error(safeError(response.status)); } if (!response.ok) throw new Error(safeError(response.status, data)); return data; };
  const requireAuth = () => { if (!token) { redirectToLogin("session"); return false; } return true; };
  return { login, logout, request, requireAuth, clearSession, loginUrl: () => pageUrl("login.html"), dashboardUrl: () => pageUrl("dashboard.html"), isAuthenticated: () => Boolean(token) };
})();
