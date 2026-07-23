import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"
import { sendEmail } from "@/lib/email"

const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL ?? "http://localhost:3000")

export const auth = betterAuth({
  database: pool,
  baseURL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 heure
    sendResetPassword: async ({ user, token }) => {
      // Lien qui ramène l'utilisateur sur notre page de saisie du nouveau mot de passe.
      const resetUrl = `${baseURL.replace(/\/$/, "")}/admin/reinitialiser?token=${token}`
      const res = await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe — Coiffeurs225",
        text: [
          "Bonjour,",
          "",
          "Vous avez demandé à réinitialiser votre mot de passe Coiffeurs225.",
          "Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :",
          resetUrl,
          "",
          "Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
          "",
          "— Coiffeurs225",
        ].join("\n"),
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
            <h2 style="font-size:18px">Réinitialisation de votre mot de passe</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe Coiffeurs225.</p>
            <p style="margin:24px 0">
              <a href="${resetUrl}" style="background:#c2410c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
                Définir un nouveau mot de passe
              </a>
            </p>
            <p style="font-size:13px;color:#666;word-break:break-all">Ou copiez ce lien : ${resetUrl}</p>
            <p style="font-size:13px;color:#666">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
          </div>
        `,
      })
      if (!res.ok) {
        throw new Error(res.error || "Échec de l'envoi de l'email.")
      }
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // En dev (iframe d'aperçu v0), force les cookies cross-site
          // pour que le cookie de session soit conservé par le navigateur.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
