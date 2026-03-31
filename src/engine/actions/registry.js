import alertHandler from "./handlers/alert.js";
import apiHandler from "./handlers/api.js";
import conditionHandler from "./handlers/condition.js";
import logHandler from "./handlers/log.js";
import navigationHandler from "./handlers/navigation.js";
import runHandler from "./handlers/run.js";
import setHandler from "./handlers/set.js";
import validateHandler from "./handlers/validate.js";

export const defaultActionRegistry = {
  alert: alertHandler,
  api_request: apiHandler,
  condition: conditionHandler,
  log: logHandler,
  navigate: navigationHandler,
  run: runHandler,
  set: setHandler,
  validate: validateHandler,
};

export function registerAction(name, handler, registry = defaultActionRegistry) {
  registry[name] = handler;
}
