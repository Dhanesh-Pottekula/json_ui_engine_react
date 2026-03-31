export default async function navigationHandler(step, context) {
  const destination = context.resolve(step.to ?? step.href);
  const payload = {
    to: destination,
    replace: Boolean(step.replace),
    meta: context.resolve(step.meta || null),
  };

  context.setNavigation(payload);

  if (typeof context.onNavigate === "function") {
    context.onNavigate(payload);
    return payload;
  }

  if (typeof window !== "undefined" && typeof destination === "string" && /^https?:\/\//.test(destination)) {
    if (payload.replace) {
      window.location.replace(destination);
    } else {
      window.location.assign(destination);
    }
  }

  return payload;
}
