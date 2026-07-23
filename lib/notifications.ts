export type NotificationOrder = {
  reference: string
  total: number
  customer: { name: string; phone: string; payment: string }
  items: { name: string; qty: number; price: number; recurring: boolean }[]
}

function normalizePhone(raw: string, withPlus = false): string {
  let digits = raw.replace(/[^\d]/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  if (digits.length === 10) digits = `225${digits}`
  return withPlus ? `+${digits}` : digits
}

function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`
}

function message(order: NotificationOrder): string {
  return [
    `Coiffeurs225 — Commande ${order.reference} enregistrée.`,
    ...order.items.map(
      (item) =>
        `${item.qty}x ${item.name}${item.recurring ? " (/mois)" : ""} — ${formatPrice(item.price * item.qty)}`,
    ),
    `Total: ${formatPrice(order.total)} (${order.customer.payment}).`,
    `Merci ${order.customer.name}. Un conseiller vous recontactera pour confirmer.`,
  ].join("\n")
}

async function sendWhatsapp(order: NotificationOrder): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneNumberId) return false

  const response = await fetch(
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
        to: normalizePhone(order.customer.phone),
        type: "text",
        text: { preview_url: false, body: message(order) },
      }),
      signal: AbortSignal.timeout(8000),
    },
  )
  return response.ok
}

async function sendSms(order: NotificationOrder): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  if (!accountSid || !authToken || !fromNumber) return false

  const params = new URLSearchParams({
    To: normalizePhone(order.customer.phone, true),
    From: fromNumber,
    Body: message(order).replace(/\n/g, " "),
  })
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
      signal: AbortSignal.timeout(8000),
    },
  )
  return response.ok
}

export async function notifyOrder(
  order: NotificationOrder,
): Promise<"whatsapp" | "sms" | "none"> {
  try {
    if (await sendWhatsapp(order)) return "whatsapp"
  } catch (error) {
    console.error("WhatsApp notification failed", error)
  }

  try {
    if (await sendSms(order)) return "sms"
  } catch (error) {
    console.error("SMS notification failed", error)
  }

  return "none"
}
