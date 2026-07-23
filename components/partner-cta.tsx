"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PartnerForm } from "@/components/partner-form"
import { CalendarCheck, TrendingUp, Wallet } from "lucide-react"

const PERKS = [
  {
    icon: CalendarCheck,
    title: "Agenda rempli",
    text: "Recevez des réservations près de chez vous, sans prospection.",
  },
  {
    icon: Wallet,
    title: "Revenus réguliers",
    text: "Paiements sécurisés et abonnements clients fidélisés.",
  },
  {
    icon: TrendingUp,
    title: "Visibilité accrue",
    text: "Votre profil mis en avant auprès de milliers de clients à Abidjan.",
  },
]

export function PartnerCta() {
  const [showForm, setShowForm] = useState(false)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-border bg-primary/10 px-6 py-12 sm:px-12">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-balance sm:text-4xl">
            Vous êtes barbier ou coiffeur ?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Rejoignez Coiffeurs 225, remplissez votre agenda et développez votre
            clientèle à Abidjan.
          </p>
        </div>

        {!showForm && (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {PERKS.map((perk) => (
                <div
                  key={perk.title}
                  className="rounded-2xl border border-border bg-card p-5 text-center"
                >
                  <perk.icon className="mx-auto size-7 text-primary" />
                  <h3 className="mt-3 font-heading text-base font-bold uppercase tracking-wide">
                    {perk.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {perk.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button size="lg" onClick={() => setShowForm(true)}>
                Devenir partenaire
              </Button>
            </div>
          </>
        )}

        {showForm && (
          <div className="mt-10">
            <PartnerForm />
          </div>
        )}
      </div>
    </section>
  )
}
