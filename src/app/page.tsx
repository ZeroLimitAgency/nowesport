import Image from "next/image";
import {
  PartnersShowcaseSection,
  ShopGridSection,
  TeamsShowcaseSection,
} from "@/components/content-sections";
import { productOptions, shopCollections } from "@/data/site";
import {
  getPublicGames,
  getPublicPartners,
  getPublicProducts,
  getTeamSupportBlocks,
} from "@/lib/content";

export default async function Home() {
  const [products, games, partners] = await Promise.all([
    getPublicProducts(),
    getPublicGames(),
    getPublicPartners(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="relative min-h-[100svh] overflow-hidden">
        <a href="https://youtu.be/F7VLXWSbRoE?si=vzBYyV9froSyNNC7" target="_blank" rel="noreferrer" className="absolute inset-0 block">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/media/jersey.jpeg"
            className="h-full w-full object-cover"
          >
            <source src="/media/now-academy.mp4" type="video/mp4" />
          </video>
        </a>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.2)_58%,rgba(0,0,0,0.55)_100%)]" />

        <div className="absolute bottom-7 left-5 z-10 flex items-center gap-8 sm:bottom-10 sm:left-8">
          {[
            "GENESIS",
            "leo express",
            "tp-link",
          ].map((sponsor) => (
            <span key={sponsor} className="text-xl font-semibold tracking-wide text-white/88 sm:text-3xl">
              {sponsor}
            </span>
          ))}
        </div>
      </section>

      <div className="space-y-4 py-10 sm:py-14">
        <ShopGridSection items={products} productOptions={productOptions} shopCollections={shopCollections} />
        <TeamsShowcaseSection gamesData={games} teamBlocks={getTeamSupportBlocks()} />
        <PartnersShowcaseSection partnersData={partners} />
      </div>
    </main>
  );
}
