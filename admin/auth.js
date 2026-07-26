"use strict";

window.AdminAuth = (() => {
  const API_BASE = "https://kaushalya-backend.onrender.com";
  const TOKEN_KEY = "kgh_admin_token";
  let token = sessionStorage.getItem(TOKEN_KEY);

  const login = async (bootstrapKey) => {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bootstrapKey })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.message || "Unable to sign in.");
    token = data.accessToken;
    if (!token) throw new Error("The server did not return an access token.");
    sessionStorage.setItem(TOKEN_KEY, token);
    return data;
  };

  const logout = () => {
    token = null;
    sessionStorage.removeItem(TOKEN_KEY);
    location.replace("login.html");
  };

  const request = async (path, options = {}) => {
    if (!token) return logout();
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers }
    });
    if (response.status === 401) return logout();
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status}).`);
    return data;
  };

  const requireAuth = () => {
    if (!token) logout();
  };

  return { login, logout, request, requireAuth, isAuthenticated: () => Boolean(token) };
})();
