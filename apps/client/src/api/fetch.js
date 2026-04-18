import { BASE_API_URL } from "./consts";
import { useAuthStore } from "@/store/authStore";

class HttpError extends Error {
  constructor(status, data) {
    super(data?.message || `Request failed with status ${status}`);
    this.status = status;
    this.response = { status, data };
  }
}

async function handleResponse(res, raw) {
  if (raw) {
    if (!res.ok) throw new HttpError(res.status);
    return res;
  }
  const data = res.headers.get("content-type")?.includes("application/json")
    ? await res.json()
    : null;
  if (!res.ok) throw new HttpError(res.status, data);
  return data;
}

export async function fetchPublic(path, options = {}) {
  const { raw, ...fetchOptions } = options;
  const res = await fetch(`${BASE_API_URL}${path}`, {
    credentials: "include",
    ...fetchOptions,
  });
  return handleResponse(res, raw);
}

async function refreshAccessToken() {
  const data = await fetchPublic("/refresh");
  const { setAuth } = useAuthStore.getState();
  setAuth((prev) => ({ ...prev, accessToken: data.accessToken }));
  return data.accessToken;
}

export async function fetchPrivate(path, options = {}) {
  const { raw, ...fetchOptions } = options;
  const { auth } = useAuthStore.getState();
  const headers = new Headers(fetchOptions.headers);
  if (auth?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${auth.accessToken}`);
  }
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_API_URL}${path}`, {
    credentials: "include",
    ...fetchOptions,
    headers,
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    const retryHeaders = new Headers(fetchOptions.headers);
    retryHeaders.set("Authorization", `Bearer ${newToken}`);
    if (!retryHeaders.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
      retryHeaders.set("Content-Type", "application/json");
    }
    const retry = await fetch(`${BASE_API_URL}${path}`, {
      credentials: "include",
      ...fetchOptions,
      headers: retryHeaders,
    });
    return handleResponse(retry, raw);
  }

  return handleResponse(res, raw);
}
