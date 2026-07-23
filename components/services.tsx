"use client"

import { Scissors, Clock, Plus } from "lucide-react"
import { services } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"
import { Button } from "@/components/ui/button"
import { useCart, parsePrice } from "@/lib/cart-context"

export function Services() {
  const { addItem } = useCart()

  return (
    <section id="services" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          title="Nos services"
          subtitle="Des prestations pour tous les styles, à des prix transparents. Frais de déplacement du coiffeur jusqu'à chez vous déjà inclus."
        />

        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 sm:gap-4 sm:p-5"
            >
              <span className="hidden size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                <Scissors className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{service.name}</p>
                {/* Durée + mention masquées sur mobile pour alléger la lecture */}
                <p className="mt-0.5 hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                  <Clock className="size-3.5" />
                  {service.duration} min · Déplacement inclus
                </p>
                <p className="font-heading text-base font-bold text-primary sm:hidden">
                  {service.price}
                </p>
              </div>
              {/* Prix complet visible seulement sur écran large */}
              <div className="hidden text-right sm:block">
                <p className="font-heading font-bold text-primary">
                  {service.price}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Déplacement inclus
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0"
                aria-label={`Réserver ${service.name}`}
                onClick={() =>
                  addItem({
                    id: `service-${service.name}`,
                    name: `Réservation — ${service.name}`,
                    detail: `${service.duration} min · Déplacement inclus`,
                    price: parsePrice(service.price),
                    type: "reservation",
                  })
                }
              >
                <Plus className="size-4 sm:hidden" />
                <span className="hidden sm:inline">Réserver</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
