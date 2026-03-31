export default async function alertHandler(step, context) {
  const message = context.resolve(step.message);

  if (typeof window !== "undefined") {
    window.alert(String(message ?? ""));
  }

  return message;
}
