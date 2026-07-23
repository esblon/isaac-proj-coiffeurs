"use server"

import { Resend } from "resend"
import { getAdminEmails, buildAdminLinkAbsolute } from "@/lib/admin"

type SendResult = { ok: boolean; message: string }

/**
 * Envoie le lien de connexion admin en un clic à CHAQUE adresse autorisée
 * (ADMIN_EMAILS). N'envoie jamais à une adresse arbitraire : les destinataires
 * sont toujours les emails admin configurés — donc sûr à déclencher publiquement.
 */
export async function sendAdminLinks(): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      message:
        "Service d'email non configuré (RESEND_API_KEY manquante). Ajoutez la clé dans les variables d'environnement.",
    }
  }

  const emails = getAdminEmails()
  if (emails.length === 0) {
    return { ok: false, message: "Aucun email admin configuré (ADMIN_EMAILS)." }
  }

  const resend = new Resend(apiKey)
  const from =
    process.env.ADMIN_EMAIL_FROM ?? "Coiffeurs225 <onboarding@resend.dev>"

  const results = await Promise.allSettled(
    emails.map((email) => {
      const link = buildAdminLinkAbsolute(email)
      return resend.emails.send({
        from,
        to: email,
        subject: "Votre accès administrateur Coiffeurs225",
        text: [
          "Bonjour,",
          "",
          "Voici votre lien de connexion administrateur en un clic pour Coiffeurs225 :",
          link,
          "",
          "Cliquez sur le lien pour accéder directement au tableau de bord, sans mot de passe.",
          "Gardez ce lien strictement confidentiel : toute personne qui y accède peut ouvrir l'administration.",
          "",
          "— Coiffeurs225",
        ].join("\n"),
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
            <h2 style="font-size:18px">Votre accès administrateur Coiffeurs225</h2>
            <p>Cliquez sur le bouton ci-dessous pour accéder directement au tableau de bord, <strong>sans mot de passe</strong>.</p>
            <p style="margin:24px 0">
              <a href="${link}" style="background:#c2410c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
                Accéder à l'administration
              </a>
            </p>
            <p style="font-size:13px;color:#666;word-break:break-all">Ou copiez ce lien : ${link}</p>
            <p style="font-size:13px;color:#b91c1c">Gardez ce lien confidentiel : toute personne qui y accède peut ouvrir l'administration.</p>
          </div>
        `,
      })
    }),
  )

  const sent: string[] = []
  const failed: string[] = []
  let firstReason = ""
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && !r.value.error) {
      sent.push(emails[i])
    } else {
      failed.push(emails[i])
      const reason =
        r.status === "rejected"
          ? String(r.reason)
          : r.value.error?.message || JSON.stringify(r.value.error)
      if (!firstReason) firstReason = reason
      console.log("[v0] Échec envoi lien admin à", emails[i], reason)
    }
  })

  if (failed.length === 0) {
    return { ok: true, message: `Liens envoyés à : ${sent.join(", ")}.` }
  }
  if (sent.length === 0) {
    return {
      ok: false,
      message: `Échec de l'envoi. Détail : ${firstReason}`,
    }
  }
  return {
    ok: true,
    message: `Envoyé à : ${sent.join(", ")}. Échec pour : ${failed.join(", ")} (${firstReason}).`,
  }
}
