const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const auth = {
  setToken(t) {
    localStorage.setItem("token", t);
  },
  getToken() {
    return localStorage.getItem("token") || "";
  },
  clear() {
    localStorage.removeItem("token");
  },
};

export async function apiGet(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${auth.getToken()}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost(path, body, opts = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(`${API}${path}`, {
    method: opts.method || "POST",
    body: isForm ? body : JSON.stringify(body || {}),
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${auth.getToken()}`,
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
