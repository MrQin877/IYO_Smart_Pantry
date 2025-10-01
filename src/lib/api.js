// C:\xampp\htdocs\IYO_Smart_Pantry\src\lib\api.js
export const API = import.meta.env.VITE_API_BASE;

export async function apiGet(path, init = {}) {
  const res = await fetch(`${API}${path}`, { credentials: 'include', ...init });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch {
    throw new Error(`Non-JSON response: ${text.slice(0,200)}`);
  }
  if (!res.ok || json?.ok === false) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}

export async function apiPost(path, data) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch {
    throw new Error(`Non-JSON response: ${text.slice(0,200)}`);
  }
  if (!res.ok || json?.ok === false) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}
