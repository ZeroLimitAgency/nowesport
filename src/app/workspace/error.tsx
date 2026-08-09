"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-6"><h2 className="font-bold">Le module n’a pas pu être chargé.</h2><button className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black" onClick={reset}>Réessayer</button></div>; }
