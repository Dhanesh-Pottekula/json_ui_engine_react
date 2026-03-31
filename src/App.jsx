import JsonRenderer from "./engine/renderer/JsonRenderer.jsx";
import interestSchema from "./schemas/interestSchemaString.js";

export default function App() {
  return <JsonRenderer schema={interestSchema} />;
}
