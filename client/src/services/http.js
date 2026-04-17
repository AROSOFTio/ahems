const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function request(path, { method = "GET", body, token, headers = {} } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network error — please check your connection and try again.");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload?.message || `Request failed (${response.status} ${response.statusText})`;
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

