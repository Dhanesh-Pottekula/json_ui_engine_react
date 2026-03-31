export default async function conditionHandler(step, context) {
  const passes = Boolean(context.resolve({ expr: step.test }));

  if (passes && Array.isArray(step.then)) {
    return context.executeSteps(step.then, { condition: true });
  }

  if (!passes && Array.isArray(step.else)) {
    return context.executeSteps(step.else, { condition: false });
  }

  return passes;
}
