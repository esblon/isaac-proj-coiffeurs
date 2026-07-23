// URL publique servie par CloudFront/ALB sur AWS.
const FALLBACK_SITE_URL = "http://localhost:3000"

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL
).replace(/\/$/, "")

// Lien de l'application mobile.
// Le site est une PWA installable : ce lien ouvre/installe l'app sur le téléphone.
// Quand vos apps natives seront publiées, remplacez ces valeurs par les liens des stores.
export const APP_URL = SITE_URL
export const APP_STORE_URL = SITE_URL
export const PLAY_STORE_URL = SITE_URL

// Page d'installation : le QR code y renvoie. Elle détecte iOS / Android et
// affiche les instructions adaptées pour installer l'application.
export const INSTALL_URL = `${SITE_URL}/telecharger`

// Coordonnées de contact.
// WHATSAPP_NUMBER : numéro au format international, sans "+" ni espaces (pour wa.me).
export const WHATSAPP_NUMBER = "2250574688458"
export const PHONE_DISPLAY = "+225 05 74 68 84 58"
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Bonjour Coiffeurs225, je souhaite réserver un coiffeur.",
)}`

// Indicatif pays par défaut (Côte d'Ivoire) pour formater les numéros locaux.
const DEFAULT_COUNTRY_CODE = "225"

// Normalise un numéro saisi par le client au format international wa.me
// (chiffres uniquement, indicatif pays inclus). Ex: "07 01 02 03 04" -> "2250701020304".
export function toWhatsappNumber(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "")
  if (!digits) return ""
  // Retire un éventuel "00" international en préfixe.
  if (digits.startsWith("00")) digits = digits.slice(2)
  // Ajoute l'indicatif pays s'il manque.
  if (!digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    digits = DEFAULT_COUNTRY_CODE + digits
  }
  return digits
}

// Construit un lien wa.me click-to-chat avec un message pré-rempli.
export function buildWhatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
