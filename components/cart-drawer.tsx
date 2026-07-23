"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  RefreshCw,
  Scissors,
  Package,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart, formatPrice, type CartItemType } from "@/lib/cart-context"
import {
  toWhatsappNumber,
  buildWhatsappLink,
} from "@/lib/site"
import { useContact } from "@/components/contact-provider"
import {
  ShareLocationButton,
  type LocationInfo,
} from "@/components/share-location-button"
import { saveOrder } from "@/app/actions/submissions"

const typeIcon: Record<CartItemType, typeof Package> = {
  produit: Package,
  abonnement: RefreshCw,
  reservation: Scissors,
}

const typeLabel: Record<CartItemType, string> = {
  produit: "Produit",
  abonnement: "Abonnement",
  reservation: "Réservation",
}

const paymentOptions = ["Orange Money", "Wave", "MTN MoMo", "Moov Money", "Carte bancaire"]

export function CartDrawer() {
  const { phoneDisplay: PHONE_DISPLAY } = useContact()
  const {
    items,
    isOpen,
    total,
    closeCart,
    removeItem,
    setQty,
    checkout,
    lastOrder,
  } = useCart()

  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [payment, setPayment] = useState(paymentOptions[0])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [smsStatus, setSmsStatus] = useState<
    "whatsapp" | "sms" | "whatsapp-link" | "failed" | null
  >(null)
  const [location, setLocation] = useState<LocationInfo | null>(null)

  // Verrouille le scroll du body quand le tiroir est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      // réinitialise sur l'étape panier à la fermeture
      setStep("cart")
      setSmsStatus(null)
      setSubmitError(null)
      setLocation(null)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  async function handleCheckout(e: FormEvent) {
    e.preventDefault()
    // La localisation est obligatoire avant toute validation/paiement.
    if (!location) return
    setSubmitting(true)
    setSubmitError(null)
    const reference = `C225-${Date.now().toString().slice(-6)}`
    const result = await saveOrder({
      reference,
      customerName: name,
      customerPhone: phone,
      payment,
      items: items.map((item) => ({ id: item.id, qty: item.qty })),
      locationLat: location.latitude,
      locationLng: location.longitude,
    })

    if (!result.ok) {
      setSubmitting(false)
      setSubmitError(result.message ?? "La commande n’a pas pu être enregistrée.")
      return
    }

    const order = checkout({ name, phone, payment })
    order.reference = reference
    if (typeof result.total === "number") order.total = result.total
    setName("")
    setPhone("")

    try {
      if (result.notification === "whatsapp") {
        setSmsStatus("whatsapp")
      } else if (result.notification === "sms") {
        setSmsStatus("sms")
      } else {
        // Repli sans configuration : ouvre WhatsApp côté client avec la
        // confirmation pré-remplie, adressée au numéro du client.
        const clientNumber = toWhatsappNumber(order.customer.phone)
        if (clientNumber) {
          const message = [
            "Coiffeurs225 — Commande validée ✅",
            "",
            `Bonjour ${order.customer.name}, votre commande est validée et sera transmise à un coiffeur sous peu.`,
            "",
            `Référence : ${order.reference}`,
            ...order.items.map(
              (i) =>
                `• ${i.qty}x ${i.name}${i.recurring ? " (/mois)" : ""} — ${formatPrice(i.price * i.qty)}`,
            ),
            "",
            `Total : ${formatPrice(order.total)} (${order.customer.payment})`,
          ].join("\n")
          window.open(
            buildWhatsappLink(clientNumber, message),
            "_blank",
            "noopener,noreferrer",
          )
          setSmsStatus("whatsapp-link")
        } else {
          setSmsStatus("failed")
        }
      }
    } finally {
      setSubmitting(false)
      setStep("done")
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panneau */}
      <aside
        role="dialog"
        aria-label="Votre commande"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-border bg-card shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold uppercase">
            <ShoppingBag className="size-5 text-primary" />
            {step === "done" ? "Commande confirmée" : "Votre commande"}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Confirmation */}
        {step === "done" && lastOrder ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <CheckCircle2 className="size-16 text-primary" />
            <div>
              <p className="font-heading text-xl font-bold">Merci {lastOrder.customer.name || ""} !</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Votre commande est validée et sera transmise à un coiffeur sous
                peu.
              </p>
            </div>
            <div className="w-full rounded-xl border border-border bg-background p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Référence</span>
                <span className="font-semibold text-primary">{lastOrder.reference}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-semibold">{formatPrice(lastOrder.total)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Paiement</span>
                <span className="font-semibold">{lastOrder.customer.payment}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Statut</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <CheckCircle2 className="size-4" />
                  Débité
                </span>
              </div>
            </div>
            <p className="w-full rounded-lg border border-dashed border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground">
              Démo de test : le débit de {formatPrice(lastOrder.total)} via{" "}
              {lastOrder.customer.payment} est simulé, aucun montant réel
              n&apos;est prélevé.
            </p>
            {smsStatus === "whatsapp" ? (
              <div className="flex w-full items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-left text-sm text-foreground">
                <MessageCircle className="size-5 shrink-0 text-primary" />
                <span>
                  Un message WhatsApp de confirmation vient de vous être envoyé
                  sur le{" "}
                  <span className="font-semibold">
                    {lastOrder.customer.phone}
                  </span>
                  .
                </span>
              </div>
            ) : smsStatus === "sms" ? (
              <div className="flex w-full items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-left text-sm text-foreground">
                <MessageCircle className="size-5 shrink-0 text-primary" />
                <span>
                  Un SMS de confirmation a été envoyé sur votre téléphone depuis le{" "}
                  <span className="font-semibold">{PHONE_DISPLAY}</span>.
                </span>
              </div>
            ) : smsStatus === "whatsapp-link" ? (
              <div className="flex w-full items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-left text-sm text-foreground">
                <MessageCircle className="size-5 shrink-0 text-primary" />
                <span>
                  WhatsApp s&apos;est ouvert avec votre confirmation
                  pré-remplie : appuyez sur{" "}
                  <span className="font-semibold">Envoyer</span> pour la recevoir
                  sur le{" "}
                  <span className="font-semibold">
                    {lastOrder.customer.phone}
                  </span>
                  .
                </span>
              </div>
            ) : (
              <div className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm text-muted-foreground">
                Votre commande est validée. L&apos;envoi automatique de la
                confirmation n&apos;a pas pu aboutir — un conseiller vous
                recontacte rapidement au numéro indiqué.
              </div>
            )}
            <Button className="w-full" onClick={closeCart}>
              Continuer
            </Button>
          </div>
        ) : items.length === 0 ? (
          /* Panier vide */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
            <ShoppingBag className="size-12 opacity-40" />
            <p className="font-medium">Votre panier est vide</p>
            <p className="text-sm">
              Réservez un barbier, ajoutez un kit ou choisissez un abonnement pour
              commencer.
            </p>
          </div>
        ) : (
          <>
            {/* Liste des articles */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-3">
                {items.map((item) => {
                  const Icon = typeIcon[item.type]
                  return (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-xl border border-border bg-background p-3"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {typeLabel[item.type]}
                              {item.detail ? ` · ${item.detail}` : ""}
                              {item.recurring ? " · / mois" : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Retirer ${item.name}`}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty - 1)}
                              aria-label="Diminuer la quantité"
                              className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty + 1)}
                              aria-label="Augmenter la quantité"
                              className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <p className="font-heading font-bold text-primary">
                            {formatPrice(item.price * item.qty)}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Pied : total + checkout */}
            <footer className="border-t border-border px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-heading text-xl font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              {step === "cart" ? (
                <Button className="w-full" size="lg" onClick={() => setStep("checkout")}>
                  Passer la commande
                </Button>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-3">
                  <div>
                    <label htmlFor="cart-name" className="mb-1 block text-xs font-medium">
                      Nom complet
                    </label>
                    <input
                      id="cart-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex : Kouamé Stéphane"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="cart-phone" className="mb-1 block text-xs font-medium">
                      Téléphone (SMS de confirmation)
                    </label>
                    <input
                      id="cart-phone"
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex : +225 07 00 00 00 00"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="cart-payment" className="mb-1 block text-xs font-medium">
                      Moyen de paiement
                    </label>
                    <select
                      id="cart-payment"
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {paymentOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                      <span className="text-destructive">*</span>
                      Localisation requise pour valider la commande
                    </p>
                    <ShareLocationButton
                      variant="default"
                      customerName={name || undefined}
                      onLocated={setLocation}
                    />
                    {location ? (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-primary">
                        <CheckCircle2 className="size-3.5" />
                        Position transmise à Coiffeurs225 via WhatsApp.
                      </p>
                    ) : (
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        Partagez votre position pour que le coiffeur vous trouve.
                        Obligatoire avant le paiement.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("cart")}
                      disabled={submitting}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={submitting || !location}
                    >
                      {submitting
                        ? "Envoi en cours…"
                        : !location
                          ? "Localisation requise"
                          : `Payer ${formatPrice(total)}`}
                    </Button>
                  </div>
                  {submitError && (
                    <p className="text-center text-xs text-destructive" role="alert">
                      {submitError}
                    </p>
                  )}
                  <p className="text-center text-[11px] text-muted-foreground">
                    Démo de test — aucun paiement réel n&apos;est effectué.
                  </p>
                </form>
              )}
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
