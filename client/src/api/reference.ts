export async function getContactTypes() {
  const res = await fetch("/api/reference/contact-types", {
    credentials: "include",
  });
  return res.json();
}

export async function getPriorities() {
  const res = await fetch("/api/reference/priorities", {
    credentials: "include",
  });
  return res.json();
}

export async function getCategories() {
  const res = await fetch("/api/reference/categories", {
    credentials: "include",
  });
  return res.json();
}

export async function getQuote() {
  const res = await fetch("/api/reference/quote");
  return res.json();
}

export async function getStates() {
  const res = await fetch("/api/reference/states");
  return res.json();
}

export async function sendEmail(data: Record<string, string>) {
  const res = await fetch("/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}
