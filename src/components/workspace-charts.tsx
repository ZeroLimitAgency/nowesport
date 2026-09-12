"use client";
import { useMemo, useState } from "react";

export type ChartSeries = { id: string; label: string; color: string; points: Array<{ label: string; value: number }> };

export function MultiSeriesChart({ series, title }: { series: ChartSeries[]; title: string }) {
  const [hidden, setHidden] = useState<string[]>([]);
  const visible = series.filter((item) => !hidden.includes(item.id)).slice(0, 10);
  const values = visible.flatMap((item) => item.points.map((point) => point.value));
  const [minimum, maximum] = values.length ? [Math.min(...values), Math.max(...values)] : [0, 1];
  const range = maximum - minimum || 1;
  const paths = useMemo(() => visible.map((item) => ({ ...item, path: item.points.map((point, index) => `${index ? "L" : "M"}${(index / Math.max(1, item.points.length - 1)) * 760},${190 - ((point.value - minimum) / range) * 170}`).join(" ") })), [visible, minimum, range]);
  if (!series.length) return <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-white/10 text-sm text-white/40">Aucun historique de performance disponible.</div>;
  return <figure aria-label={title} className="overflow-hidden rounded-xl border border-white/8 bg-black/20 p-4"><div className="mb-3 flex max-h-20 flex-wrap gap-2 overflow-y-auto">{series.map((item) => <button type="button" key={item.id} onClick={() => setHidden((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current,item.id])} aria-pressed={!hidden.includes(item.id)} className={`rounded-full border px-3 py-1 text-xs ${hidden.includes(item.id) ? "border-white/8 text-white/30" : "border-white/15 text-white/75"}`}><span className="mr-1 inline-block size-2 rounded-full" style={{ backgroundColor: item.color }}/>{item.label}</button>)}</div><div className="min-w-[42rem] overflow-x-auto"><svg viewBox="0 0 760 210" role="img" aria-label={title} className="h-auto w-full"><title>{title}</title><g stroke="rgba(255,255,255,.08)">{[20,105,190].map((y)=><line key={y} x1="0" x2="760" y1={y} y2={y}/>)}</g>{paths.map((item)=><path key={item.id} d={item.path} fill="none" stroke={item.color} strokeWidth="3" strokeLinejoin="round"/>)}</svg></div><figcaption className="mt-2 text-xs text-white/35">{minimum.toLocaleString()} – {maximum.toLocaleString()} · jusqu’à 10 séries sélectionnées</figcaption></figure>;
}

export function ScoreBreakdown({ score, complete, items }: { score: number | null; complete: boolean; items: Array<{ label: string; normalizedScore?: number; weight: number; contribution?: number; missing: boolean }> }) {
  return <section className="rounded-xl border border-white/8 bg-white/[.025] p-5"><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[.18em] text-white/40">NOW Score</p><p className="mt-2 text-4xl font-black">{score === null ? "N/A" : `${score}/100`}</p></div><span className={complete ? "text-emerald-400" : "text-amber-300"}>{complete ? "Complete" : `Calculated on ${items.filter((item)=>!item.missing).length}/${items.length} criteria`}</span></div><div className="mt-5 grid gap-2">{items.map((item)=><div key={item.label} className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-white/6 pt-2 text-sm"><span>{item.label}</span><span className="text-white/50">{item.missing ? "N/A" : `${item.normalizedScore} × ${item.weight}%`}</span><strong>{item.contribution ?? "—"}</strong></div>)}</div></section>;
}
