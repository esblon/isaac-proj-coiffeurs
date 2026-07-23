"use client"

import Image from "next/image"
import { MapPin, Star, BadgeCheck, Play, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { barbers, priceForZone } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"
import { useCart, parsePrice } from "@/lib/cart-context"

export function Barbers() {
  const { addItem } = useCart()
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24">
      <SectionHeading
        title="Nos meilleurs coiffeurs"
        subtitle="Des professionnels vérifiés et notés par la communauté. Le coiffeur se déplace chez vous, frais de transport déjà compris dans le prix."
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((barber) => {
          const zonePrice = priceForZone(barber.area)
          return (
          <article
            key={barber.name}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={barber.image || "/placeholder.svg"}
                alt={`Portrait du coiffeur ${barber.name}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Voile dégradé + overlay "vidéo" au survol */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-full bg-primary/90 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg">
                  <Play className="size-3.5 fill-current" />
                  Voir en action
                </span>
              </div>
              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                {barber.top && (
                  <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    Top noté
                  </span>
                )}
                {barber.verified && (
                  <span className="flex w-fit items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                    <BadgeCheck className="size-3.5 text-primary" />
                    Vérifié
                  </span>
                )}
              </div>
              <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                <Star className="size-3 fill-primary text-primary" />
                {barber.rating}
              </span>
            </div>

            <div className="p-5">
              <h3 className="font-heading text-lg font-semibold">{barber.name}</h3>
              <p className="text-sm text-muted-foreground">{barber.shop}</p>

              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {barber.area}
                <span className="mx-1">·</span>
                <Star className="size-3.5 fill-primary text-primary" />
                <span className="text-foreground">{barber.rating}</span>
                <span>· {barber.reviews} avis</span>
              </div>

              <div className="mt-3 flex items-center gap-4 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {barber.experience} ans
                  </span>
                  <span className="text-muted-foreground">d&apos;exp.</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Scissors className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {barber.completed.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-muted-foreground">coupes</span>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {barber.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Tarif unique {barber.area}
                  </p>
                  <p className="font-heading text-lg font-bold text-primary">
                    {zonePrice}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Déplacement inclus
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    addItem({
                      id: `reservation-${barber.name}`,
                      name: `RDV — ${barber.name}`,
                      detail: `${barber.shop}, ${barber.area}`,
                      price: parsePrice(zonePrice),
                      type: "reservation",
                      image: barber.image,
                    })
                  }
                >
                  Réserver
                </Button>
              </div>
            </div>
          </article>
          )
        })}
      </div>
    </section>
  )
}
