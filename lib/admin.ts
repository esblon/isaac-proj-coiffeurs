import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies, headers } from "next/headers"
import { auth } from "@/lib/auth"

/**
 * Emails administrateurs par défaut (non secrets : la sécurité repose sur la
 * signature HMAC + le cookie signé). Sert de repli si ADMIN_EMAILS est absent
 * ou mal renseigné.
 */
const DEFAULT_ADMIN_EMAILS = [
  "isaacdosso@gmail.com",
  "ebene.blon@gmail.com",
]

/** Liste des emails administrateurs autorisés. */
export function getAdminEmails(): string[] {
  // On ne garde que des entrées ressemblant à un email (ignore p.ex. un numéro).
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@") && e.includes("."))

  return fromEnv.length > 0 ? fromEnv : DEFAULT_ADMIN_EMAILS
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}

// --- Session admin légère par cookie signé (connexion en un clic, sans mot de passe) ---

const ADMIN_COOKIE = "c225_admin"

function adminSecret(): string {
  return process.env.BETTER_AUTH_SECRET ?? "coiffeurs225-admin-dev-secret"
}

/** Signature HMAC d'un email admin — sert de jeton secret pour le lien en un clic. */
export function signAdminEmail(email: string): string {
  return createHmac("sha256", adminSecret())
    .update(email.trim().toLowerCase())
    .digest("hex")
}

/** Vérifie qu'un couple (email, jeton) est valide et autorisé. */
export function isValidAdminToken(email?: string | null, token?: string | null): boolean {
  if (!email || !token || !isAdminEmail(email)) return false
  const expected = signAdminEmail(email)
  const a = Buffer.from(expected)
  const b = Buffer.from(token)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Construit le lien de connexion admin en un clic pour un email donné. */
export function buildAdminLink(email: string): string {
  const e = email.trim().toLowerCase()
  return `/api/admin-login?as=${encodeURIComponent(e)}&k=${signAdminEmail(e)}`
}

/** URL de base absolue de l'application (production, aperçu Vercel, ou v0). */
export function getBaseUrl(): string {
  const url =
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL) ??
    "http://localhost:3000"
  return url.replace(/\/$/, "")
}

/** Lien de connexion admin en un clic, en URL absolue (pour les emails). */
export function buildAdminLinkAbsolute(email: string): string {
  return `${getBaseUrl()}${buildAdminLink(email)}`
}

/** Valeur de cookie signée : "<emailBase64Url>.<signature>". */
export function buildAdminCookieValue(email: string): string {
  const e = email.trim().toLowerCase()
  const encoded = Buffer.from(e).toString("base64url")
  return `${encoded}.${signAdminEmail(e)}`
}

/** Lit l'email admin depuis le cookie signé, ou null si absent/invalide. */
async function getAdminEmailFromCookie(): Promise<string | null> {
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!raw || !raw.includes(".")) return null
  const [encoded, sig] = raw.split(".")
  let email: string
  try {
    email = Buffer.from(encoded, "base64url").toString("utf8")
  } catch {
    return null
  }
  return isValidAdminToken(email, sig) ? email : null
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE

/**
 * Récupère l'identité admin courante.
 * Autorise via : (1) session Better Auth dont l'email est admin, ou
 * (2) cookie admin signé (connexion en un clic). Retourne { isAdmin, email }.
 */
export async function getAdminSession() {
  // 1) Session Better Auth classique (email + mot de passe)
  const session = await auth.api.getSession({ headers: await headers() })
  const sessionEmail = session?.user?.email
  if (isAdminEmail(sessionEmail)) {
    return { isAdmin: true as const, email: sessionEmail as string, session }
  }

  // 2) Cookie admin signé (lien / bouton en un clic)
  const cookieEmail = await getAdminEmailFromCookie()
  if (cookieEmail) {
    return { isAdmin: true as const, email: cookieEmail, session }
  }

  return { isAdmin: false as const, email: sessionEmail ?? null, session }
}
