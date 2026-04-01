import Alert from "../../components/base/Alert.jsx";
import AlertDescription from "../../components/base/AlertDescription.jsx";
import AlertTitle from "../../components/base/AlertTitle.jsx";
import Badge from "../../components/base/Badge.jsx";
import Button from "../../components/base/Button.jsx";
import Input from "../../components/base/Input.jsx";
import Label from "../../components/base/Label.jsx";
import Select from "../../components/base/Select.jsx";
import Separator from "../../components/base/Separator.jsx";
import Slider from "../../components/base/Slider.jsx";
import Textarea from "../../components/base/Textarea.jsx";
import Card from "../../components/complex/Card.jsx";
import CardContent from "../../components/complex/CardContent.jsx";
import CardDescription from "../../components/complex/CardDescription.jsx";
import CardFooter from "../../components/complex/CardFooter.jsx";
import CardHeader from "../../components/complex/CardHeader.jsx";
import CardTitle from "../../components/complex/CardTitle.jsx";
import DataTable from "../../components/complex/DataTable.jsx";
import DropSimulation from "../../components/complex/DropSimulation.jsx";
import InfoCard from "../../components/complex/InfoCard.jsx";
import SectionCard from "../../components/complex/SectionCard.jsx";
import StatCard from "../../components/complex/StatCard.jsx";
import Table from "../../components/complex/Table.jsx";
import TableBody from "../../components/complex/TableBody.jsx";
import TableCell from "../../components/complex/TableCell.jsx";
import TableHead from "../../components/complex/TableHead.jsx";
import TableHeader from "../../components/complex/TableHeader.jsx";
import TableRow from "../../components/complex/TableRow.jsx";
import { Div, H1, H2, H3, Img, Li, P, Section, Span, Ul } from "../../components/primitives/HtmlPrimitives.jsx";

export const defaultComponentRegistry = {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DataTable,
  Div,
  DropSimulation,
  H1,
  H2,
  H3,
  Img,
  Input,
  Label,
  Li,
  P,
  Select,
  SectionCard,
  Section,
  Separator,
  Slider,
  Span,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Ul,
  InfoCard,
};

export function registerComponent(name, component, registry = defaultComponentRegistry) {
  registry[name] = component;
}
