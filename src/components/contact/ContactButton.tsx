"use client";

import { useSite, type ContactTopic } from "@/components/providers/SiteProvider";
import { btnClass, Roll } from "@/components/ui/Btn";
import { IconArrow, IconWhatsApp } from "@/components/ui/Icons";
import { site } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { usePageUrl } from "@/lib/usePageUrl";

/** Opens the shared contact sheet about a topic. */
export function ContactButton({
  topic,
  children,
  variant = "primary",
  className = "",
  arrow = true,
}: {
  topic?: ContactTopic;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "light" | "dark" | "ghost" | "whatsapp";
  className?: string;
  arrow?: boolean;
}) {
  const { openContact } = useSite();
  return (
    <button type="button" onClick={() => openContact(topic)} className={btnClass(variant, className)}>
      <Roll>{children}</Roll>
      {arrow && <IconArrow className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />}
    </button>
  );
}

/** Direct WhatsApp link with a product-specific pre-filled message. */
export function WhatsAppButton({ label, className = "", children }: { label?: string; className?: string; children?: React.ReactNode }) {
  const { d } = useSite();
  const url = usePageUrl();
  const msg = label ? `${d.contact.waMessage} ${label}. ${url}` : d.contact.waGeneral;
  return (
    <a href={waLink(site.defaultWhatsapp, msg)} target="_blank" rel="noopener noreferrer" className={btnClass("whatsapp", className)}>
      <IconWhatsApp className="size-5" />
      <Roll>{children ?? d.cta.askWhatsapp}</Roll>
    </a>
  );
}
