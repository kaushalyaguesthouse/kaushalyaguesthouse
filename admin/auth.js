"use strict";

window.AdminAuth = (() => {
  const API_BASE = window.KGH_CONFIG?.API_BASE_URL;
  const TOKEN_KEY = "kgh_admin_token";
  let token = sessionStorage.getItem(TOKEN_KEY);

  const safeError = (status) => {
    if (status === 401 || status === 403) return "Your session is no longer authorized. Please sign in again.";
    if (status === 429) return "Too many requests. Please wait a moment and try again.";
    if (status >= 500) return "The service is temporarily unavailable. Please try again.";
    return "The request could not be completed. Please review the form and try again.";
  };

  const login = async (bootstrapKey) => {
    let response;
    try {
      response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bootstrapKey })
      });
    } catch (_) {
      throw new Error(navigator.onLine ? "The sign-in service could not be reached. Please try again." : "You are offline. Reconnect before signing in.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(safeError(response.status));
    token = data.accessToken;
    if (!token) throw new Error("The server did not return an access token.");
    sessionStorage.setItem(TOKEN_KEY, token);
    return data;
  };

  const logout = () => {
    token = null;
    sessionStorage.removeItem(TOKEN_KEY);
    location.replace("login.html?reason=session");
  };

  const request = async (path, options = {}) => {
    if (!token) return logout();
    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers }
      });
    } catch (_) {
      throw new Error(navigator.onLine ? "The service could not be reached. Please try again." : "You are offline. Reconnect and try again.");
    }
    if (response.status === 401) return logout();
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(safeError(response.status));
    return data;
  };

  const requireAuth = () => {
    if (!token) logout();
  };

  return { login, logout, request, requireAuth, isAuthenticated: () => Boolean(token) };
})();
