"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  addPartnerAvailability,
  removePartnerAvailability,
} from "@/app/actions/partner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Availability = {
  id: number
  startsAt: Date
  endsAt: Date
  status: string
}

const displayDate = (value: Date) =>
  new Date(value).toLocaleString("fr-FR", {
    weekday: "short",
    dateStyle: "short",
    timeStyle: "short",
  })

export function PartnerSchedule({
  availabilities,
}: {
  availabilities: Availability[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState("")

  const run = (action: () => Promise<unknown>) => {
    setMessage("")
    startTransition(async () => {
      try {
        await action()
        setMessage("Agenda mis à jour.")
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Une erreur est survenue.")
      }
    })
  }

  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 className="font-heading text-lg font-bold">Mon agenda</h2>
        <p className="text-sm text-muted-foreground">
          Ajoutez vos créneaux disponibles. Les clients les verront dans la recherche.
        </p>
      </div>
      <form
        className="grid gap-3 border-b p-4 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          const data = new FormData(form)
          run(async () => {
            await addPartnerAvailability({
              startsAt: data.get("startsAt"),
              endsAt: data.get("endsAt"),
            })
            form.reset()
          })
        }}
      >
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Début</span>
          <Input name="startsAt" type="datetime-local" required />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Fin</span>
          <Input name="endsAt" type="datetime-local" required />
        </label>
        <Button className="self-end" disabled={pending}>Ajouter</Button>
      </form>
      {message && <p className="border-b px-4 py-3 text-sm" role="status">{message}</p>}
      <div className="divide-y">
        {availabilities.map((slot) => (
          <article key={slot.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">
                {displayDate(slot.startsAt)} → {displayDate(slot.endsAt)}
              </p>
              <p className="text-xs capitalize text-muted-foreground">{slot.status}</p>
            </div>
            {slot.status === "disponible" && new Date(slot.startsAt) > new Date() && (
              <Button
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => run(() => removePartnerAvailability({ id: slot.id }))}
              >
                Supprimer
              </Button>
            )}
          </article>
        ))}
        {!availabilities.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Aucun créneau renseigné.
          </p>
        )}
      </div>
    </section>
  )
}
