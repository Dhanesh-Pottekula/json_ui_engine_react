import Alert from "../../components/base/Alert.jsx";
import AlertDescription from "../../components/base/AlertDescription.jsx";
import AlertTitle from "../../components/base/AlertTitle.jsx";
import Avatar from "../../components/base/Avatar.jsx";
import Badge from "../../components/base/Badge.jsx";
import Button from "../../components/base/Button.jsx";
import Checkbox from "../../components/base/Checkbox.jsx";
import Grid from "../../components/base/Grid.jsx";
import Input from "../../components/base/Input.jsx";
import Label from "../../components/base/Label.jsx";
import Progress from "../../components/base/Progress.jsx";
import Select from "../../components/base/Select.jsx";
import Separator from "../../components/base/Separator.jsx";
import Slider from "../../components/base/Slider.jsx";
import Stack from "../../components/base/Stack.jsx";
import Switch from "../../components/base/Switch.jsx";
import Textarea from "../../components/base/Textarea.jsx";
import Accordion, { AccordionContent, AccordionItem, AccordionTrigger } from "../../components/complex/Accordion.jsx";
import Card from "../../components/complex/Card.jsx";
import CardContent from "../../components/complex/CardContent.jsx";
import CardDescription from "../../components/complex/CardDescription.jsx";
import CardFooter from "../../components/complex/CardFooter.jsx";
import CardHeader from "../../components/complex/CardHeader.jsx";
import CardTitle from "../../components/complex/CardTitle.jsx";
import AreaChart from "../../components/complex/AreaChart.jsx";
import BarChart from "../../components/complex/BarChart.jsx";
import DataTable from "../../components/complex/DataTable.jsx";
import DropSimulation from "../../components/complex/DropSimulation.jsx";
import EmptyState from "../../components/complex/EmptyState.jsx";
import FAQList from "../../components/complex/FAQList.jsx";
import Hero from "../../components/complex/Hero.jsx";
import InfoCard from "../../components/complex/InfoCard.jsx";
import LineChart from "../../components/complex/LineChart.jsx";
import MetricGrid from "../../components/complex/MetricGrid.jsx";
import PieChart from "../../components/complex/PieChart.jsx";
import SectionCard from "../../components/complex/SectionCard.jsx";
import StatCard from "../../components/complex/StatCard.jsx";
import Tabs, { TabsContent, TabsList, TabsTrigger } from "../../components/complex/Tabs.jsx";
import Table from "../../components/complex/Table.jsx";
import TableBody from "../../components/complex/TableBody.jsx";
import TableCell from "../../components/complex/TableCell.jsx";
import TableHead from "../../components/complex/TableHead.jsx";
import TableHeader from "../../components/complex/TableHeader.jsx";
import TableRow from "../../components/complex/TableRow.jsx";
import { Div, H1, H2, H3, Img, Li, P, Section, Span, Ul } from "../../components/primitives/HtmlPrimitives.jsx";

export const defaultComponentRegistry = {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  AreaChart,
  Avatar,
  Badge,
  BarChart,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  DataTable,
  Div,
  DropSimulation,
  EmptyState,
  FAQList,
  Grid,
  H1,
  H2,
  H3,
  Hero,
  Img,
  Input,
  Label,
  Li,
  LineChart,
  MetricGrid,
  P,
  PieChart,
  Progress,
  Select,
  SectionCard,
  Section,
  Separator,
  Slider,
  Span,
  Stack,
  StatCard,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Ul,
  InfoCard,
};

export function registerComponent(name, component, registry = defaultComponentRegistry) {
  registry[name] = component;
}
