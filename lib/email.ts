import { Resend } from "resend"

type SendArgs = {
  to: string
  subject: string
  text: string
  html: string
}

type SendResult = { ok: boolean; error?: string }

/**
 * Indique si le service d'email est correctement configuré.
 * Une clé Resend valide commence par "re_". Cela permet de détecter en amont
 * une variable mal renseignée (ex. un numéro de téléphone).
 */
export function isEmailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY ?? ""
  return key.startsWith("re_") && key.length >= 20
}

/**
 * Envoie un email via Resend. Centralise la configuration pour la
 * réinitialisation de mot de passe et les liens admin.
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Service d'email non configuré (RESEND_API_KEY manquante).",
    }
  }

  const resend = new Resend(apiKey)
  const from =
    process.env.ADMIN_EMAIL_FROM ?? "Coiffeurs225 <onboarding@resend.dev>"

  try {
    const { error } = await resend.emails.send({ from, to, subject, text, html })
    if (error) {
      return { ok: false, error: error.message || JSON.stringify(error) }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
