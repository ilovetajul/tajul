export default function TimelineItem({
  dateLabel,
  title,
  subtitle,
  body,
  achievements,
}: {
  dateLabel: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  achievements?: string | null;
}) {
  return (
    <div className="relative border-l border-white/15 pl-6 pb-8 last:pb-0">
      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" />
      <span className="text-xs uppercase tracking-wide text-white/60">{dateLabel}</span>
      <h4 className="mt-1 text-base font-semibold text-white">{title}</h4>
      {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
      {body && (
        <div className="mt-2 text-sm text-white/80">
          <p className="whitespace-pre-line">{body}</p>
        </div>
      )}
      {achievements && (
        <div className="mt-3 rounded-lg border border-secondary/30 bg-secondary/10 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary">Achievements</p>
          <p className="whitespace-pre-line text-sm text-white/90">{achievements}</p>
        </div>
      )}
    </div>
  );
}
