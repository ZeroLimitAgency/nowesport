export function AdminCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">
        {title}
      </p>
      <p className="mt-4 text-4xl font-black uppercase tracking-[-0.05em] text-white">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/52">{description}</p>
    </article>
  );
}
