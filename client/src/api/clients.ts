const BASE = "/api/clients";

export async function searchClients(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/search?${qs}`, { credentials: "include" });
  return res.json();
}

export async function getClient(id: number) {
  const res = await fetch(`${BASE}/${id}`, { credentials: "include" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Client not found");
  }
  return res.json();
}

export async function createClient(data: Record<string, unknown>) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateClient(id: number, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteClient(id: number) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
}

export async function mergeClients(
  keepClientId: number,
  mergeClientId: number,
  mergedData: Record<string, unknown>
) {
  const res = await fetch(`${BASE}/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ keepClientId, mergeClientId, mergedData }),
  });
  return res.json();
}
