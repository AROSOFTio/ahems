import { request } from "./http";

export const reportService = {
  list: (token) => request("/reports", { token }),
  listExports: (token) => request("/reports/exports", { token }),
  generate: (payload, token) => request("/reports/generate", { method: "POST", body: payload, token }),
};
