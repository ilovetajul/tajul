export default function TimelineItem({
  dateLabel,
  title,
  subtitle,
  body,
}: {
  dateLabel: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
}) {
  return (
    <div className="relative border-l border-white/15 pl-6 pb-8 last:pb-0">
      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" />
      <span className="text-xs uppercase tracking-wide text-white/40">{dateLabel}</span>
      <h4 className="mt-1 text-base font-semibold text-white">{title}</h4>
      {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
      {body && <p className="mt-2 text-sm text-white/70 whitespace-pre-line">{body}</p>}
    </div>
  );
}
