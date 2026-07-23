import { Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppQr } from "@/components/app-qr"
import { ShareLocationButton } from "@/components/share-location-button"
import { HeroBackdrop } from "@/components/hero-backdrop"
import { zones } from "@/lib/data"

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <HeroBackdrop />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-2 rounded-full bg-primary animate-live-pulse" />
            </span>
            N°1 à Abidjan
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Réservez le meilleur coiffeur/barbier près de chez vous
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Découvrez les coiffeurs et barbiers les mieux notés d&apos;Abidjan.
            Comparez, choisissez votre créneau et réservez en quelques secondes.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className="flex flex-col gap-1.5 text-left">
                <span className="text-xs font-medium text-muted-foreground">
                  Service
                </span>
                <select className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
                  <option>Tous</option>
                  <option>Dégradé / Fade</option>
                  <option>Coupe classique</option>
                  <option>Taille de barbe</option>
                  <option>Tresses &amp; nattes</option>
                  <option>Coupe enfant</option>
                  <option>Service à domicile</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-left">
                <span className="text-xs font-medium text-muted-foreground">
                  Quartier
                </span>
                <select className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
                  <option>Toutes les zones</option>
                  {zones.map((zone) => (
                    <option key={zone}>{zone}</option>
                  ))}
                </select>
              </label>
              <Button
                size="lg"
                className="h-11 self-end"
                nativeButton={false}
                render={<a href="#barbers" />}
              >
                <Search className="size-4" />
                Rechercher
              </Button>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-2 text-xs text-muted-foreground">
                Service à domicile ? Partagez votre position avec un coiffeur.
              </p>
              <ShareLocationButton />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm">
            <Star className="size-4 fill-primary text-primary" />
            <span className="font-semibold">4.8</span>
            <span className="text-muted-foreground">
              · 12 000+ clients satisfaits
            </span>
          </div>
        </div>

        <AppQr className="hidden w-56 shrink-0 lg:block" />
      </div>
    </section>
  )
}
