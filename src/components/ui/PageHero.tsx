import Image from "next/image";
import { SplitHeading } from "@/components/motion/Reveal";

/** Inner-page opener: sky gradient, giant thin title, optional cutout overlapping the type (ZettaJoule). */
export function PageHero({
  title,
  lead,
  cutout,
  image,
  children,
}: {
  /** @deprecated section labels removed from the design */
  eyebrow?: string;
  title: string;
  lead?: string;
  cutout?: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="sky-gradient relative overflow-hidden">
      <div className="wrap relative pt-36 pb-16 md:pt-44 md:pb-24">
        <SplitHeading as="h1" immediate className="display-xl relative z-0 max-w-[14ch]">
          {title}
        </SplitHeading>
        {cutout && (
          <div className="pointer-events-none relative z-10 -mt-[12vw] ms-auto w-[78%] md:absolute md:end-[var(--gutter)] md:bottom-10 md:mt-0 md:w-[52%]">
            <Image src={cutout} alt="" width={1600} height={1289} priority sizes="(max-width:768px) 80vw, 50vw" className="h-auto w-full drop-shadow-[0_40px_40px_rgba(20,20,15,0.25)]" />
          </div>
        )}
        {lead && <p className={`lead relative z-10 mt-8 max-w-xl text-ink-700 ${cutout ? "md:mt-[18vw]" : ""}`}>{lead}</p>}
        {children}
      </div>
      {image && (
        <div className="wrap pb-0">
          <div className="relative aspect-[21/9] overflow-hidden bg-sand-200">
            <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        </div>
      )}
    </section>
  );
}
