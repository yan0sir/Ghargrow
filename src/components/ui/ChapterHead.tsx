/** "01  Title" row at the top of each editorial chapter (About, Services). */
export function ChapterHead({ n, title, light = false, as: Tag = "h2" }: { n: number; title: string; light?: boolean; as?: "h2" | "h3" }) {
  return (
    <div className="flex items-start gap-6 md:gap-10">
      <span className={`font-display text-[clamp(28px,2.6vw,40px)] leading-none font-medium ${light ? "text-sand-50" : "text-green-700"}`}>
        {String(n).padStart(2, "0")}
      </span>
      <Tag className={`max-w-[14ch] text-[clamp(28px,2.6vw,40px)] leading-[1.05] font-medium tracking-[-0.02em] text-balance ${light ? "text-sand-50" : "text-green-900"}`}>
        {title}
      </Tag>
    </div>
  );
}
