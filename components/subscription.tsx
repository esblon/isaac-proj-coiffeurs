"use client"

import { useState, type FormEvent } from "react"
import { Check, RefreshCw, Gift, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"
import { useCart, parsePrice } from "@/lib/cart-context"

type Plan = {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}

const plans: Plan[] = [
  {
    name: "Essentiel",
    price: "9 000 FCFA",
    period: "/ mois",
    description: "Pour rester toujours frais.",
    features: [
      "2 coupes par mois",
      "Réservation prioritaire",
      "-10% sur le kit coiffure",
    ],
  },
  {
    name: "Premium",
    price: "15 000 FCFA",
    period: "/ mois",
    description: "Le choix des habitués.",
    features: [
      "4 coupes par mois",
      "1 taille de barbe offerte / mois",
      "Réservation prioritaire",
      "-20% sur le kit coiffure",
      "Service à domicile inclus 1x",
    ],
    highlighted: true,
    badge: "Le plus populaire",
  },
  {
    name: "VIP",
    price: "25 000 FCFA",
    period: "/ mois",
    description: "L'expérience sans limite.",
    features: [
      "Coupes illimitées",
      "Barbe & soins illimités",
      "Service à domicile illimité",
      "Kit coiffure offert / trimestre",
    ],
  },
  {
    name: "Famille",
    price: "35 000 FCFA",
    period: "/ mois",
    description: "Jusqu'à 4 membres, prix dégressif.",
    features: [
      "4 coupes par mois et par membre",
      "Tarif dégressif : ~8 750 FCFA / membre",
      "1 taille de barbe offerte / membre",
      "Service à domicile inclus 2x / mois",
      "-25% sur le kit coiffure",
      "Membre supplémentaire à 7 000 FCFA",
    ],
    badge: "Le plus économique",
  },
]

export function Subscription() {
  const { addItem } = useCart()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [forWhom, setForWhom] = useState<"self" | "other">("self")
  const [beneficiaryName, setBeneficiaryName] = useState("")
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("")

  function openPlanModal(plan: Plan) {
    setSelectedPlan(plan)
    setForWhom("self")
    setBeneficiaryName("")
    setBeneficiaryPhone("")
  }

  function closeModal() {
    setSelectedPlan(null)
  }

  function confirmPlan(e: FormEvent) {
    e.preventDefault()
    if (!selectedPlan) return

    const isGift = forWhom === "other"
    addItem({
      id: isGift
        ? `abonnement-${selectedPlan.name}-cadeau-${beneficiaryPhone}`
        : `abonnement-${selectedPlan.name}`,
      name: isGift
        ? `Abonnement ${selectedPlan.name} (offert à ${beneficiaryName})`
        : `Abonnement ${selectedPlan.name}`,
      detail: isGift
        ? `Bénéficiaire : ${beneficiaryName} · ${beneficiaryPhone}`
        : selectedPlan.description,
      price: parsePrice(selectedPlan.price),
      type: "abonnement",
      recurring: true,
    })
    closeModal()
  }

  return (
    <section id="abonnement" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <RefreshCw className="size-3.5" />
            Renouvelé automatiquement
          </span>
          <div className="mt-4">
            <SectionHeading
              centered
              title="Abonnement mensuel"
              subtitle="Un forfait renouvelable chaque mois, sans engagement. Annulez ou changez de formule quand vous voulez."
            />
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-primary bg-card shadow-lg shadow-primary/10"
                  : "border-border bg-background"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {plan.badge}
                </span>
              )}
              <h3 className="font-heading text-xl font-bold uppercase">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-heading text-3xl font-bold text-primary">
                  {plan.price}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6"
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => openPlanModal(plan)}
              >
                Choisir {plan.name}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Frais de déplacement du coiffeur inclus dans chaque prestation ·
          Paiement sécurisé par Mobile Money (Orange, Wave, MTN, Moov) ou carte
          bancaire · Renouvellement mensuel automatique · Résiliable à tout
          moment.
        </p>
      </div>

      {/* Modale : pour qui est l'abonnement ? */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            onClick={closeModal}
            aria-hidden="true"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Abonnement ${selectedPlan.name}`}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Fermer"
              className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-heading text-lg font-bold uppercase">
              Abonnement {selectedPlan.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedPlan.price} {selectedPlan.period} · Pour qui souscrivez-vous&nbsp;?
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForWhom("self")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
                  forWhom === "self"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="size-6 text-primary" />
                Pour moi
              </button>
              <button
                type="button"
                onClick={() => setForWhom("other")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
                  forWhom === "other"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <Gift className="size-6 text-primary" />
                Pour un proche
              </button>
            </div>

            <form onSubmit={confirmPlan} className="mt-5 space-y-3">
              {forWhom === "other" && (
                <>
                  <div>
                    <label
                      htmlFor="beneficiary-name"
                      className="mb-1 block text-xs font-medium"
                    >
                      Nom du bénéficiaire
                    </label>
                    <input
                      id="beneficiary-name"
                      required
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      placeholder="Ex : Kouassi Yao"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="beneficiary-phone"
                      className="mb-1 block text-xs font-medium"
                    >
                      Téléphone du bénéficiaire
                    </label>
                    <input
                      id="beneficiary-phone"
                      required
                      type="tel"
                      value={beneficiaryPhone}
                      onChange={(e) => setBeneficiaryPhone(e.target.value)}
                      placeholder="Ex : +225 07 00 00 00 00"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Le bénéficiaire recevra un SMS l&apos;informant que vous lui
                    offrez cet abonnement.
                  </p>
                </>
              )}
              <Button type="submit" className="w-full" size="lg">
                {forWhom === "other"
                  ? "Offrir cet abonnement"
                  : "Ajouter au panier"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
