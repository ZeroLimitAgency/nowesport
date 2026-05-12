import { notFound } from "next/navigation";
import { getLegalPageBySlug, legalPages } from "@/data/site";

export function generateStaticParams() {
  return legalPages.map((item) => ({ slug: item.slug }));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLegalPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(93,18,55,0.34)_0%,rgba(93,18,55,0.12)_34%,transparent_72%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[24rem] -z-10 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(233,53,133,0.12)_0%,rgba(233,53,133,0.03)_38%,transparent_72%)] blur-2xl" />

      <section className="mx-auto w-full max-w-[92rem] px-5 pb-18 pt-10 sm:px-8 sm:pt-14">
        <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] px-6 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:px-10">
          <p className="section-kicker">{page.kicker}</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] sm:text-7xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            {page.intro}
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          {page.sections.map((section) => (
            <article
              key={section}
              className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] px-6 py-6 shadow-[0_20px_55px_rgba(0,0,0,0.22)]"
            >
              <p className="text-base leading-7 text-white/62">{section}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
