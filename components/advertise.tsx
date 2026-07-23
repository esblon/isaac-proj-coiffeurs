"use client"

import { useState, type FormEvent } from "react"
import {
  Check,
  Megaphone,
  CheckCircle2,
  Loader2,
  MessageCircle,
  X,
  MapPin,
  CalendarRange,
  Clock,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionHeading } from "@/components/section-heading"
import { WHATSAPP_NUMBER, buildWhatsappLink } from "@/lib/site"
import { saveAdRequest } from "@/app/actions/submissions"

const COMMERCIAL_EMAIL = "assistant.comercial@nostalgie.ci"

type AdPackage = {
  name: string
  price: string
  /** Tarif mensuel de référence en FCFA, pour estimer le budget selon la durée. */
  monthly: number
  period: string
  tagline: string
  features: string[]
  highlighted?: boolean
  badge?: string
}

type Duration = {
  label: string
  /** Multiplicateur appliqué au tarif mensuel. */
  factor: number
  /** Remise indicative pour les engagements longs. */
  note?: string
}

const durations: Duration[] = [
  { label: "1 semaine", factor: 0.3 },
  { label: "1 mois", factor: 1 },
  { label: "3 mois", factor: 2.7, note: "-10%" },
  { label: "6 mois", factor: 5.1, note: "-15%" },
]

function formatFcfa(value: number): string {
  return `${Math.round(value).toLocaleString("fr-FR")} FCFA`
}

const packages: AdPackage[] = [
  {
    name: "Visibilité",
    price: "25 000 FCFA",
    monthly: 25000,
    period: "/ mois",
    tagline: "Idéal pour vous lancer auprès de notre audience.",
    features: [
      "1 emplacement (sur les 6 disponibles)",
      "~15 000 impressions / mois",
      "Logo + lien vers votre site ou page",
      "Rapport de performance mensuel",
    ],
  },
  {
    name: "Croissance",
    price: "75 000 FCFA",
    monthly: 75000,
    period: "/ mois",
    tagline: "Le choix des marques qui veulent convertir.",
    features: [
      "2 emplacements premium (accueil + offres)",
      "~60 000 impressions / mois",
      "1 publication sponsorisée sur nos réseaux",
      "Mention dans 1 newsletter clients",
      "Ciblage par zone d'Abidjan",
      "Rapport détaillé + suivi des clics",
    ],
    highlighted: true,
    badge: "Le plus populaire",
  },
  {
    name: "Prestige",
    price: "150 000 FCFA",
    monthly: 150000,
    period: "/ mois",
    tagline: "Une présence maximale et exclusive.",
    features: [
      "Jusqu'à 4 des 6 emplacements + tête de page exclusive",
      "Impressions illimitées",
      "4 publications sponsorisées / mois",
      "2 newsletters dédiées",
      "Notification push dans l'application",
      "Campagne sur-mesure avec chargé de compte",
    ],
    badge: "Premium",
  },
]

export function Advertise() {
  const [selected, setSelected] = useState<AdPackage | null>(null)
  const [duration, setDuration] = useState<Duration>(durations[1])
  const [company, setCompany] = useState("")
  const [contact, setContact] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const estimatedBudget = selected
    ? formatFcfa(selected.monthly * duration.factor)
    : ""

  function openModal(pkg: AdPackage) {
    setSelected(pkg)
    setDuration(durations[1])
    setCompany("")
    setContact("")
    setPhone("")
    setEmail("")
    setMessage("")
    setError(null)
    setDone(false)
  }

  function closeModal() {
    setSelected(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!company.trim() || !contact.trim()) {
      setError("Indiquez le nom de l'entreprise et de la personne à contacter.")
      return
    }
    if (!phone.trim()) {
      setError("Le numéro de téléphone est obligatoire.")
      return
    }

    setSubmitting(true)

    const result = await saveAdRequest({
      package: selected?.name ?? "",
      duration: duration.label,
      estimatedBudget,
      company,
      contact,
      phone,
      email: email || undefined,
      message: message || undefined,
    })
    if (!result.ok) {
      setSubmitting(false)
      setError(result.message ?? "La demande n’a pas pu être enregistrée.")
      return
    }

    const lines = [
      "*Coiffeurs225 — Demande de publicité*",
      "",
      `Package : ${selected?.name} (${selected?.price} ${selected?.period})`,
      `Durée : ${duration.label}`,
      `Budget estimé : ${estimatedBudget}`,
      `Entreprise : ${company}`,
      `Contact : ${contact}`,
      `Téléphone : ${phone}`,
      email ? `Email : ${email}` : null,
      message ? `\nMessage : ${message}` : null,
      "",
      "Paiement hors ligne après confirmation. Aucun engagement sans devis signé.",
    ].filter(Boolean)

    const link = buildWhatsappLink(WHATSAPP_NUMBER, lines.join("\n"))
    window.open(link, "_blank", "noopener,noreferrer")

    setSubmitting(false)
    setDone(true)
  }

  return (
    <section className="bg-card/40">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Megaphone className="size-3.5" />
            Annonceurs & marques
          </span>
          <div className="mt-4">
            <SectionHeading
              centered
              title="Faites de la publicité chez nous"
              subtitle="Touchez des milliers de clients à Abidjan qui réservent leur coiffeur chaque semaine. Choisissez le package adapté à votre budget."
            />
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                pkg.highlighted
                  ? "border-primary bg-card shadow-lg shadow-primary/10"
                  : "border-border bg-background"
              }`}
            >
              {pkg.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {pkg.badge}
                </span>
              )}
              <h3 className="font-heading text-xl font-bold uppercase">
                {pkg.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {pkg.tagline}
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-heading text-3xl font-bold text-primary">
                  {pkg.price}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  {pkg.period}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6"
                variant={pkg.highlighted ? "default" : "outline"}
                onClick={() => openModal(pkg)}
              >
                Choisir {pkg.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-background p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">6 emplacements</p>
              <p className="text-xs text-muted-foreground">
                disponibles sur nos plateformes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarRange className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Durées flexibles</p>
              <p className="text-xs text-muted-foreground">
                1 semaine, 1 mois, 3 mois, 6 mois
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Réponse sous 24h</p>
              <p className="text-xs text-muted-foreground">
                jours ouvrés
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Contact direct</p>
              <a
                href={`mailto:${COMMERCIAL_EMAIL}`}
                className="break-all text-xs text-primary underline-offset-2 hover:underline"
              >
                {COMMERCIAL_EMAIL}
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Paiement hors ligne après confirmation. Aucun engagement sans devis
          signé.
        </p>
      </div>

      {/* Modale : souscription au package */}
      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            onClick={closeModal}
            aria-hidden="true"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Package ${selected.name}`}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Fermer"
              className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            {done ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="size-12 text-primary" />
                <h3 className="mt-4 font-heading text-lg font-bold uppercase">
                  Demande envoyée
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Votre demande pour le package{" "}
                  <span className="font-semibold text-foreground">
                    {selected.name}
                  </span>{" "}
                  ({duration.label}) a été transmise à Coiffeurs225 via WhatsApp.
                  Notre équipe commerciale vous recontacte sous 24h ouvrées.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Paiement hors ligne après confirmation. Aucun engagement sans
                  devis signé.
                </p>
                <a
                  href={`mailto:${COMMERCIAL_EMAIL}`}
                  className="mt-2 break-all text-xs text-primary underline-offset-2 hover:underline"
                >
                  {COMMERCIAL_EMAIL}
                </a>
                <Button className="mt-6 w-full" onClick={closeModal}>
                  Fermer
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-heading text-lg font-bold uppercase">
                  Package {selected.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.price} {selected.period} · Choisissez la durée et
                  laissez vos coordonnées.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  <div className="space-y-1.5">
                    <Label>Durée de la campagne *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {durations.map((d) => (
                        <button
                          key={d.label}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                            duration.label === d.label
                              ? "border-primary bg-primary/10 font-medium text-foreground"
                              : "border-input bg-background text-muted-foreground hover:border-primary"
                          }`}
                        >
                          <span>{d.label}</span>
                          {d.note && (
                            <span className="ml-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              {d.note}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                    <span className="text-xs text-muted-foreground">
                      Budget estimé ({duration.label})
                    </span>
                    <span className="font-heading text-lg font-bold text-primary">
                      {estimatedBudget}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ad-company">Entreprise / Marque *</Label>
                    <Input
                      id="ad-company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ex : Orange CI"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ad-contact">Personne à contacter *</Label>
                    <Input
                      id="ad-contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Ex : Aya Koné"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ad-phone">Téléphone (WhatsApp) *</Label>
                    <Input
                      id="ad-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex : 07 00 00 00 00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ad-email">Email (optionnel)</Label>
                    <Input
                      id="ad-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex : contact@marque.ci"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ad-message">Message (optionnel)</Label>
                    <textarea
                      id="ad-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Décrivez votre campagne, vos objectifs…"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-destructive" role="alert">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MessageCircle className="size-4" />
                    )}
                    {submitting ? "Envoi en cours…" : "Envoyer ma demande"}
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Demande transmise par WhatsApp · Réponse sous 24h ouvrées ·
                    Paiement hors ligne après devis signé.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
