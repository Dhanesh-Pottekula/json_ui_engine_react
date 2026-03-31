export default async function apiHandler(step, context) {
  const url = context.resolve(step.url);
  const method = (step.method || "GET").toUpperCase();
  const headers = context.resolve(step.headers || {});
  const body = context.resolve(step.body);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body == null || method === "GET" ? undefined : JSON.stringify(body),
  });

  let payload = null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const error = new Error(step.errorMessage || `Request failed with status ${response.status}`);
    error.response = payload;
    throw error;
  }

  if (step.into) {
    context.setValue(step.into, payload);
  }

  if (step.saveAs) {
    context.setActionResult(step.saveAs, payload);
  }

  return payload;
}
