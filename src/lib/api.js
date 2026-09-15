const TOKEN_KEY = 'xoiom.adminToken';

function getCfg() {
  try {
    return (typeof window !== 'undefined' && window.XOIOM) || {};
  } catch {
    return {};
  }
}

/** Base URL for API calls, e.g. "/api" or "https://my-api.onrender.com/api". */
export const API_BASE = (getCfg().apiBase || '/api').replace(/\/+$/, '');

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — session won't persist */
  }
}

/** True when the error means "API not reachable / not deployed" rather than a real API rejection. */
export function isOfflineError(err) {
  return (
    !err ||
    err.status === undefined ||
    err.status === 404 ||
    err.status === 502 ||
    err.status === 503
  );
}

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch (networkErr) {
    const err = new Error('Could not reach the server');
    err.status = undefined;
    err.cause = networkErr;
    throw err;
  }

  let data = null;
  const type = res.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const err = new Error(
      (data && (data.error || data.message)) || `Request failed (${res.status})`
    );
    err.status = res.status;
    throw err;
  }

  return data === null ? {} : data;
}
