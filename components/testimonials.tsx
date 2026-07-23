"use client"

import Image from "next/image"
import { useState } from "react"
import { Play, Star, Quote, X } from "lucide-react"
import { testimonials, type Testimonial } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"

export function Testimonials() {
  const [active, setActive] = useState<Testimonial | null>(null)

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24">
      <SectionHeading
        title="Ils témoignent en vidéo"
        subtitle="Des clients réels racontent leur expérience. La preuve par l'image que Coiffeurs225 tient ses promesses."
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
          >
            <button
              type="button"
              onClick={() => setActive(t)}
              className="relative block aspect-video w-full overflow-hidden text-left"
              aria-label={`Lire le témoignage vidéo de ${t.name}`}
            >
              <Image
                src={t.image || "/placeholder.svg"}
                alt={`Témoignage de ${t.name}, client à ${t.area}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

              {/* Bouton lecture */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Play className="size-6 fill-current" />
                </span>
              </span>

              {/* Badge durée */}
              <span className="absolute bottom-3 right-3 rounded bg-background/85 px-2 py-0.5 text-xs font-semibold backdrop-blur">
                {t.duration}
              </span>

              {/* Identité */}
              <span className="absolute bottom-3 left-3">
                <span className="block font-heading text-sm font-bold text-foreground">
                  {t.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t.area} · {t.role}
                </span>
              </span>
            </button>

            <div className="p-5">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <Quote className="mb-1 mr-1 inline size-4 text-primary" />
                {t.quote}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Lecteur (overlay) — illustration du témoignage filmé */}
      {active && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 p-4 backdrop-blur"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={active.image || "/placeholder.svg"}
                alt={`Témoignage de ${active.name}`}
                fill
                className="animate-kenburns object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="mb-2 flex gap-0.5">
                  {Array.from({ length: active.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="font-heading text-lg font-bold">{active.name}</p>
                <p className="text-xs text-muted-foreground">
                  {active.area} · {active.role}
                </p>
              </div>
            </div>
            <div className="p-6">
              <Quote className="size-6 text-primary" />
              <p className="mt-2 text-base leading-relaxed text-pretty">
                {active.quote}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
