import Link from "next/link"
import { KeyRound, AlertTriangle } from "lucide-react"
import { ResetPasswordForm } from "@/components/reset-password-form"

export const metadata = {
  title: "Nouveau mot de passe — Coiffeurs225",
  robots: { index: false, follow: false },
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="size-6 text-primary" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold uppercase tracking-tight">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p className="text-pretty">
              Lien invalide ou incomplet. Veuillez refaire une demande de
              réinitialisation depuis la page{" "}
              <Link href="/admin/mot-de-passe-oublie" className="underline">
                mot de passe oublié
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
