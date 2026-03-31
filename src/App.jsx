import JsonRenderer from "./engine/renderer/JsonRenderer.jsx";
import interestSchema from "./schemas/interestSchema.json";

export default function App() {
  return <JsonRenderer schema={interestSchema} />;
}
