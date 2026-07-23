import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"

// Marque officielle Orange : carré orange avec barre blanche.
function OrangeLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-8"
      fill="#FF7900"
      role="img"
      aria-label="Orange"
    >
      <title>Orange</title>
      <path d="M0 0h24v24H0V0Zm3.43 20.572h17.143v-3.429H3.43v3.429Z" />
    </svg>
  )
}

// Mot-symbole officiel Wave (logo principal de la marque).
function WaveWordmark() {
  return (
    <span className="font-heading text-3xl font-bold lowercase tracking-tight text-white">
      wave
    </span>
  )
}

export function AdBanners() {
  return (
    <section
      id="partenaires"
      aria-label="Espaces publicitaires de nos partenaires"
      className="border-y border-border bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          centered
          title="Nos partenaires"
          subtitle="Espaces sponsorisés par les marques qui soutiennent Coiffeurs 225."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Annonceur 1 — Orange Money */}
          <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-[#101010] p-6">
            <span className="absolute right-3 top-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
              Publicité
            </span>
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-lg bg-black">
                <OrangeLogo />
              </span>
              <span className="font-heading text-xl font-bold uppercase text-white">
                Orange Money
              </span>
            </div>
            <div className="mt-6">
              <p className="font-heading text-2xl font-bold leading-tight text-white text-balance">
                Payez vos coupes en un clin d&apos;œil
              </p>
              <p className="mt-2 text-sm text-white/70">
                Réglez vos réservations et abonnements avec Orange Money, sans
                frais sur votre première transaction.
              </p>
            </div>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF7900]"
            >
              Découvrir l&apos;offre
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </article>

          {/* Annonceur 2 — Wave */}
          <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-[#1DC8FF] p-6">
            <span className="absolute right-3 top-3 rounded-full bg-black/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
              Publicité
            </span>
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-white/95">
                <Image
                  src="/images/wave-penguin.png"
                  alt="Mascotte pingouin de Wave"
                  width={48}
                  height={48}
                  className="size-12 object-cover"
                />
              </span>
              <WaveWordmark />
            </div>
            <div className="mt-6">
              <p className="font-heading text-2xl font-bold leading-tight text-[#062a3d] text-balance">
                Transferts et paiements à 0 frais
              </p>
              <p className="mt-2 text-sm font-medium text-[#062a3d]/80">
                Payez votre coiffeur directement via Wave. Rapide, gratuit et
                100% sécurisé partout à Abidjan.
              </p>
            </div>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#062a3d]"
            >
              Télécharger Wave
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </article>

          {/* Annonceur 3 — Marque de shampoing locale */}
          <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <span className="absolute right-3 top-3 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/80">
              Publicité
            </span>
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src="/images/ad-karite.png"
                alt="Shampoing au karité Karité Royal"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <span className="font-heading text-xl font-bold uppercase text-primary">
                Karité Royal
              </span>
              <p className="mt-2 font-heading text-2xl font-bold leading-tight text-balance">
                Le shampoing 100% ivoirien au karité
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Nourrit le cheveu et la barbe naturellement. Fabriqué à Abidjan.
              </p>
              <a
                href="#kit"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                Voir le produit
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
