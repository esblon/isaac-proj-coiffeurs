import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

type OrderItem = {
  name: string
  qty: number
  price: number
  recurring?: boolean
}

type OrderPayload = {
  reference: string
  total: number
  customer: { name: string; phone: string; payment: string }
  items: OrderItem[]
}

function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`
}

/** Normalise un numéro ivoirien/international en format E.164 sans "+" (ex: 2250700000000). */
function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "")
  // Retire un éventuel "00" international
  if (digits.startsWith("00")) digits = digits.slice(2)
  // Ajoute l'indicatif Côte d'Ivoire si absent (numéros locaux à 10 chiffres)
  if (digits.length === 10) digits = `225${digits}`
  return digits
}

function buildMessage(order: OrderPayload): string {
  const lines = [
    "*Coiffeurs225 — Commande validée ✅*",
    "",
    `Bonjour ${order.customer.name},`,
    "Votre commande est *validée* et sera transmise à un coiffeur sous peu. Voici le récapitulatif :",
    "",
    `Référence : ${order.reference}`,
    ...order.items.map(
      (i) =>
        `• ${i.qty}x ${i.name}${i.recurring ? " (/mois)" : ""} — ${formatPrice(
          i.price * i.qty,
        )}`,
    ),
    "",
    `Total : ${formatPrice(order.total)}`,
    `Paiement : ${order.customer.payment}`,
    "",
    "Un conseiller vous recontacte très bientôt pour finaliser le rendez-vous ou la livraison. Merci de votre confiance !",
  ]
  return lines.join("\n")
}

export async function POST(req: NextRequest) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Configuration WhatsApp manquante (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID).",
      },
      { status: 500 },
    )
  }

  let order: OrderPayload
  try {
    order = (await req.json()) as OrderPayload
  } catch {
    return NextResponse.json({ ok: false, error: "Payload invalide." }, { status: 400 })
  }

  if (!order?.customer?.phone) {
    return NextResponse.json(
      { ok: false, error: "Numéro du client manquant." },
      { status: 400 },
    )
  }

  const to = normalizePhone(order.customer.phone)
  const body = buildMessage(order)

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body },
        }),
      },
    )

    const data = await res.json()

    if (!res.ok) {
      console.log("[v0] WhatsApp API error:", JSON.stringify(data))
      return NextResponse.json(
        {
          ok: false,
          error: data?.error?.message ?? "Échec de l'envoi WhatsApp.",
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, id: data?.messages?.[0]?.id ?? null })
  } catch (err) {
    console.log("[v0] WhatsApp fetch failed:", (err as Error).message)
    return NextResponse.json(
      { ok: false, error: "Erreur réseau lors de l'envoi WhatsApp." },
      { status: 502 },
    )
  }
}
