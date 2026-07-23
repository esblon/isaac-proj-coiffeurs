import { headers } from "next/headers"
import { auth } from "@/lib/auth"

/** Liste des emails administrateurs autorisés. */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@") && e.includes("."))
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}

/**
 * Récupère l'identité admin courante.
 * Seule une session Better Auth dont l'email figure dans ADMIN_EMAILS est admise.
 */
export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  const sessionEmail = session?.user?.email
  if (isAdminEmail(sessionEmail)) {
    return { isAdmin: true as const, email: sessionEmail as string, session }
  }

  return { isAdmin: false as const, email: sessionEmail ?? null, session }
}
