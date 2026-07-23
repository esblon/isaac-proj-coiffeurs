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

/** Normalise un numéro ivoirien/international au format E.164 (ex: +2250700000000). */
function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  // Numéro local ivoirien à 10 chiffres -> ajoute l'indicatif +225
  if (digits.length === 10) digits = `225${digits}`
  return `+${digits}`
}

/** SMS court (160 caractères idéalement) avec le récap de commande. */
function buildMessage(order: OrderPayload): string {
  const articles = order.items
    .map((i) => `${i.qty}x ${i.name}${i.recurring ? " (/mois)" : ""}`)
    .join(", ")
  return [
    `Coiffeurs225 - Commande ${order.reference} VALIDEE.`,
    `${articles}.`,
    `Total: ${formatPrice(order.total)} (${order.customer.payment}).`,
    `Elle sera transmise a un coiffeur sous peu. Un conseiller vous recontacte. Merci ${order.customer.name}!`,
  ].join(" ")
}

export async function POST(req: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Configuration SMS manquante (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER).",
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

  const params = new URLSearchParams()
  params.append("To", to)
  params.append("From", fromNumber)
  params.append("Body", body)

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    )

    const data = await res.json()

    if (!res.ok) {
      console.log("[v0] Twilio SMS error:", JSON.stringify(data))
      return NextResponse.json(
        { ok: false, error: data?.message ?? "Échec de l'envoi du SMS." },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, sid: data?.sid ?? null })
  } catch (err) {
    console.log("[v0] Twilio fetch failed:", (err as Error).message)
    return NextResponse.json(
      { ok: false, error: "Erreur réseau lors de l'envoi du SMS." },
      { status: 502 },
    )
  }
}
