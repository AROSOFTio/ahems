import { request } from "./http";

export const authService = {
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),
  changePassword: (payload, token) =>
    request("/auth/change-password", { method: "POST", body: payload, token }),
  me: (token) => request("/auth/me", { token }),
  updateProfile: (payload, token) =>
    request("/users/profile", { method: "PATCH", body: payload, token }),
};

