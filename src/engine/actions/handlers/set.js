export default async function setHandler(step, context) {
  const values = context.resolve(step.values || {});
  context.setValues(values);

  if (step.clearErrors) {
    context.clearErrors();
  }

  return values;
}
