import { request } from "./http";

export const notificationService = {
  list: (token, filters = {}) => {
    const search = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    );
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request(`/notifications${suffix}`, { token });
  },
  markRead: (id, token) => request(`/notifications/${id}/read`, { method: "PATCH", token }),
};
