"use client"

import { useEffect, useState } from "react"
import { CalendarDays, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionHeading } from "@/components/section-heading"

type Barber = {
  id: number
  name: string
  sector: string
  availabilities: { startsAt: string; endsAt: string }[]
}

const formatSlot = (startsAt: string, endsAt: string) => {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  return `${start.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })} · ${start.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}–${end.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

export function AvailabilityBrowser() {
  const [sector, setSector] = useState("")
  const [query, setQuery] = useState("")
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    fetch(`/api/barbers?sector=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Recherche indisponible.")
        return response.json() as Promise<{ barbers: Barber[] }>
      })
      .then((data) => setBarbers(data.barbers))
      .catch((reason) => {
        if (reason instanceof Error && reason.name !== "AbortError") {
          setError(reason.message)
        }
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [query])

  return (
    <section id="disponibilites" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeading
        title="Trouver un coiffeur disponible"
        subtitle="Précisez votre secteur pour consulter les professionnels et leurs prochains créneaux."
      />
      <form
        className="mx-auto mt-8 flex max-w-xl gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          setQuery(sector.trim())
        }}
      >
        <Input
          value={sector}
          onChange={(event) => setSector(event.target.value)}
          placeholder="Ex. Cocody, Riviera, Marcory…"
          aria-label="Secteur recherché"
        />
        <Button><Search /> Rechercher</Button>
      </form>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {loading && <p className="text-sm text-muted-foreground">Recherche en cours…</p>}
        {!loading && !error && !barbers.length && (
          <p className="text-sm text-muted-foreground">
            Aucun coiffeur disponible{query ? ` dans le secteur « ${query} »` : ""}.
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {barbers.map((barber) => (
          <article key={barber.id} className="rounded-2xl border bg-card p-5">
            <h3 className="font-heading text-lg font-bold">{barber.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" /> {barber.sector}
            </p>
            <div className="mt-4 space-y-2">
              {barber.availabilities.slice(0, 5).map((slot) => (
                <p
                  key={`${slot.startsAt}-${slot.endsAt}`}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                >
                  <CalendarDays className="size-4 text-primary" />
                  {formatSlot(slot.startsAt, slot.endsAt)}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
