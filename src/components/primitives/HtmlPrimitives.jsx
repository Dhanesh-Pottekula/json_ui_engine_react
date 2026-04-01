import { cn } from "../../utils/cn.js";

function Primitive({ as: Component, content, className, children, ...rest }) {
  return (
    <Component className={cn(className)} {...rest}>
      {content}
      {children}
    </Component>
  );
}

export function Div(props) {
  return <Primitive as="div" {...props} />;
}

export function Section(props) {
  return <Primitive as="section" {...props} />;
}

export function Span(props) {
  return <Primitive as="span" {...props} />;
}

export function P(props) {
  return <Primitive as="p" {...props} />;
}

export function H1(props) {
  return <Primitive as="h1" {...props} />;
}

export function H2(props) {
  return <Primitive as="h2" {...props} />;
}

export function H3(props) {
  return <Primitive as="h3" {...props} />;
}

export function Ul(props) {
  return <Primitive as="ul" {...props} />;
}

export function Li(props) {
  return <Primitive as="li" {...props} />;
}

export function Img({ src, alt = "", className }) {
  return <img className={cn(className)} src={src} alt={alt} />;
}
