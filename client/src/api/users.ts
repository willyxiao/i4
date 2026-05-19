const BASE = "/api/users";

export async function getUsers() {
  const res = await fetch(BASE, { credentials: "include" });
  return res.json();
}

export async function searchUsers(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/search?${qs}`, { credentials: "include" });
  return res.json();
}

export async function getUser(id: number) {
  const res = await fetch(`${BASE}/${id}`, { credentials: "include" });
  return res.json();
}

export async function updateUser(id: number, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createUser(data: Record<string, unknown>) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function manageUsers(
  action: string,
  users: number[]
) {
  const res = await fetch(`${BASE}/manage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action, users }),
  });
  return res.json();
}

export async function resetPassword(userId: number) {
  const res = await fetch(`${BASE}/${userId}/reset-password`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function makeAdmin(userId: number) {
  const res = await fetch(`${BASE}/${userId}/make-admin`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function revokeAdmin(userId: number) {
  const res = await fetch(`${BASE}/${userId}/revoke-admin`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function getStats(userId: number) {
  const res = await fetch(`/api/stats/${userId}`, { credentials: "include" });
  return res.json();
}
