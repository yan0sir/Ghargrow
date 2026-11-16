import Link from "next/link";
import { IconArrow } from "./Icons";

type Variant = "primary" | "outline" | "ghost" | "light" | "whatsapp" | "dark";

const styles: Record<Variant, string> = {
  primary: "bg-green-700 text-white hover:bg-green-800",
  dark: "bg-ink-900 text-white hover:bg-green-900",
  outline: "border border-ink-900/80 text-ink-900 hover:bg-ink-900 hover:text-white",
  light: "border border-white/70 text-white hover:bg-white hover:text-ink-900",
  ghost: "text-ink-900 px-0! hover:text-green-700",
  whatsapp: "bg-whatsapp text-ink-900 hover:brightness-95",
};

export const btnClass = (v: Variant = "primary", extra = "") =>
  `group inline-flex items-center gap-3 px-6 h-12 text-[15px] font-medium tracking-tight transition-colors duration-300 ${styles[v]} ${extra}`;

/** Label with the ZettaJoule-style hover text roll. */
export const Roll = ({ children }: { children: React.ReactNode }) => (
  <span className="roll">
    <span>{children}</span>
    <span aria-hidden>{children}</span>
  </span>
);

export function Btn({
  href,
  children,
  variant = "primary",
  arrow = true,
  icon,
  className = "",
  external,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
  icon?: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      {icon}
      <Roll>{children}</Roll>
      {arrow && <IconArrow className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />}
    </>
  );
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={btnClass(variant, className)}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={btnClass(variant, className)}>
      {inner}
    </Link>
  );
}
