import Button from "../../components/base/Button.jsx";
import Container from "../../components/base/Container.jsx";
import NumberInput from "../../components/base/NumberInput.jsx";
import Select from "../../components/base/Select.jsx";
import Slider from "../../components/base/Slider.jsx";
import Text from "../../components/base/Text.jsx";
import BarChart from "../../components/complex/BarChart.jsx";
import Card from "../../components/complex/Card.jsx";
import StatGrid from "../../components/complex/StatGrid.jsx";

export const defaultComponentRegistry = {
  BarChart,
  Button,
  Card,
  Container,
  NumberInput,
  Select,
  Slider,
  StatGrid,
  Text,
};

export function registerComponent(name, component, registry = defaultComponentRegistry) {
  registry[name] = component;
}
