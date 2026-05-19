export async function getCases(type: string, userId?: number) {
  const params = new URLSearchParams({ type });
  if (userId) params.set("userId", String(userId));
  const res = await fetch(`/api/cases?${params}`, { credentials: "include" });
  return res.json();
}
