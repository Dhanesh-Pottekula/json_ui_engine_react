export default async function logHandler(step, context) {
  const payload = context.resolve(step.payload ?? step.message ?? null);
  console.info("[engine:log]", payload);
  return payload;
}
