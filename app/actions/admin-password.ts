"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { sql } from "drizzle-orm"
import { isEmailConfigured } from "@/lib/email"
import { rateLimit } from "@/lib/security/rate-limit"

type ResetRequestResult = { ok: boolean; message: string }

/**
 * Demande de réinitialisation de mot de passe.
 * - Si aucun compte n'existe avec cet email → notifie clairement l'utilisateur.
 * - Si le compte existe → Better Auth envoie le lien de réinitialisation par email.
 */
export async function requestPasswordReset(
  emailRaw: string,
): Promise<ResetRequestResult> {
  const email = emailRaw.trim().toLowerCase()
  const genericMessage =
    "Si un compte correspond à cette adresse, un lien de réinitialisation sera envoyé."

  const allowed = await rateLimit("password-reset", 5, 15 * 60 * 1000)
  if (!allowed.ok) {
    return { ok: true, message: genericMessage }
  }

  if (!email || !email.includes("@")) {
    return { ok: false, message: "Veuillez saisir une adresse email valide." }
  }

  if (!isEmailConfigured()) {
    return {
      ok: false,
      message:
        "Le service d'email n'est pas correctement configuré (clé Resend invalide ou manquante). Le lien ne peut pas être envoyé pour l'instant.",
    }
  }

  // Vérifie l'existence du compte (recherche insensible à la casse).
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${email}`)
    .limit(1)

  if (existing.length === 0) {
    return { ok: true, message: genericMessage }
  }

  // Le compte existe → déclenche l'envoi du lien via Better Auth.
  try {
    await auth.api.requestPasswordReset({ body: { email } })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.log("[v0] Échec requestPasswordReset:", detail)
    return {
      ok: false,
      message:
        "L'envoi du lien a échoué (problème de service email). Réessayez plus tard ou contactez le support.",
    }
  }

  return {
    ok: true,
    message: genericMessage,
  }
}
