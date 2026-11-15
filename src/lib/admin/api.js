// Small client for the portfolio API (Cloudflare Worker).
// - adds the bearer token, - normalises errors, - sends the user back to the
//   login page when the session expires.

import { API_URL } from "@/lib/config";

export { API_URL };

const TOKEN_KEY = "admin.token";
const EXPIRED_KEY = "admin.expired";
const LOGIN_PATH = "/admin/login";

/** Error thrown for every failed request. `fields` maps field name -> message. */
export class ApiError extends Error {
  constructor(status, message, details = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.fields = Object.fromEntries(details.map((d) => [d.field, d.message]));
  }
}

// ---- session ---------------------------------------------------------------

function decodeExp(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).exp * 1000;
  } catch {
    return 0;
  }
}

export function getToken() {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    if (decodeExp(token) <= Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.setItem(EXPIRED_KEY, "1"); // so the login page can say why
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage blocked: the session just won't survive a reload */
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/** Milliseconds until the current session expires (0 when logged out). */
export function sessionTimeLeft() {
  const token = getToken();
  return token ? Math.max(0, decodeExp(token) - Date.now()) : 0;
}

export function endSession(reason = "expired") {
  try {
    if (sessionStorage.getItem(EXPIRED_KEY)) reason = "expired";
    sessionStorage.removeItem(EXPIRED_KEY);
  } catch {}
  clearToken();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith(LOGIN_PATH)) {
    window.location.replace(`${LOGIN_PATH}?reason=${reason}`);
  }
}

// ---- requests --------------------------------------------------------------

async function toError(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {}
  let message = body?.error || `Request failed (${res.status})`;
  if (res.status === 429) {
    const wait = Math.ceil(Number(res.headers.get("Retry-After")) / 60);
    if (wait) message = `Too many attempts. Try again in ${wait} minute${wait > 1 ? "s" : ""}.`;
  }
  return new ApiError(res.status, message, Array.isArray(body?.details) ? body.details : []);
}

/**
 * api("/admin/profile")                      GET
 * api("/admin/social-links", { method: "POST", json: {...} })
 * Resolves with parsed JSON, rejects with ApiError.
 */
export async function api(path, { method = "GET", json, auth = true, signal } = {}) {
  if (!API_URL) throw new ApiError(0, "The API address is not configured (NEXT_PUBLIC_API_URL).");
  const headers = {};
  if (json !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (!token) {
      endSession();
      throw new ApiError(401, "Session expired");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: json !== undefined ? JSON.stringify(json) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 401 && auth) {
    endSession();
    throw new ApiError(401, "Session expired");
  }
  if (!res.ok) throw await toError(res);
  if (auth && method !== "GET") requestRevalidate();
  return res.status === 204 ? null : res.json();
}

// ---- keep the public site fresh --------------------------------------------
// Every successful write asks the site to drop its cache. Calls are merged
// (a gallery upload or a reorder can send several writes in a row).
let revalidateTimer = null;
function requestRevalidate() {
  clearTimeout(revalidateTimer);
  revalidateTimer = setTimeout(() => {
    const token = getToken();
    if (!token) return;
    fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${token}` }, keepalive: true }).catch(() => {
      /* not critical: the site also refreshes on its own every minute */
    });
  }, 400);
}

/**
 * Upload a body (FormData or File) with progress reporting.
 * onProgress receives a number between 0 and 1.
 */
export function upload(path, body, { method = "POST", headers = {}, onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    if (!API_URL) return reject(new ApiError(0, "The API address is not configured (NEXT_PUBLIC_API_URL)."));
    const token = getToken();
    if (!token) {
      endSession();
      return reject(new ApiError(401, "Session expired"));
    }

    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_URL}${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onerror = () => reject(new ApiError(0, "Upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    xhr.onload = () => {
      const data = xhr.response;
      if (xhr.status === 401) {
        endSession();
        return reject(new ApiError(401, "Session expired"));
      }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(data);
      reject(new ApiError(xhr.status, data?.error || `Upload failed (${xhr.status})`, data?.details ?? []));
    };
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(body);
  });
}

export async function login(password) {
  const { token } = await api("/login", { method: "POST", json: { password }, auth: false });
  setToken(token);
}

export function logout() {
  clearToken();
  window.location.replace(LOGIN_PATH);
}
