export default async function runHandler(step, context) {
  return context.executeAction(step.action, context.resolve(step.with || {}));
}
