import { redirect } from "next/navigation"
import {
  getAdminEmails,
  buildAdminLink,
  buildAdminLinkAbsolute,
  getAdminSession,
} from "@/lib/admin"
import { ShieldCheck, AlertTriangle } from "lucide-react"
import { SendAdminLinksButton } from "@/components/send-admin-links-button"
import { AdminLoginLinks } from "@/components/admin-login-links"

export const metadata = {
  title: "Connexion administrateur — Coiffeurs225",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Déjà connecté en admin → aller directement au tableau de bord.
  const { isAdmin } = await getAdminSession()
  if (isAdmin) redirect("/admin")

  const { error } = await searchParams
  const emails = getAdminEmails()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-6 text-primary" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold uppercase tracking-tight">
            Connexion administrateur
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            Cliquez sur votre adresse pour accéder au tableau de bord en un clic.
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
            Lien invalide ou expiré. Utilisez un des accès ci-dessous.
          </p>
        )}

        <div className="mt-6">
          {emails.length === 0 ? (
            <p className="rounded-lg border border-border bg-background px-4 py-3 text-center text-sm text-muted-foreground">
              Aucun email administrateur configuré (variable{" "}
              <code className="font-mono">ADMIN_EMAILS</code>).
            </p>
          ) : (
            <AdminLoginLinks
              links={emails.map((email) => ({
                email,
                link: buildAdminLink(email),
                absolute: buildAdminLinkAbsolute(email),
              }))}
            />
          )}
        </div>

        {emails.length > 0 && <SendAdminLinksButton />}

        <div className="mt-6 flex items-start gap-2 rounded-lg bg-secondary/60 px-4 py-3 text-xs text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-pretty">
            Conservez ces liens privés : toute personne y ayant accès peut ouvrir
            l&apos;administration sans mot de passe. Vous pouvez les mettre en
            favori pour vous reconnecter en un clic.
          </p>
        </div>
      </div>
    </main>
  )
}
