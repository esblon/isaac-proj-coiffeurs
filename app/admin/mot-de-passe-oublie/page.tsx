import Link from "next/link"
import { KeyRound, ArrowLeft } from "lucide-react"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const metadata = {
  title: "Mot de passe oublié — Coiffeurs225",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="size-6 text-primary" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold uppercase tracking-tight">
            Mot de passe oublié
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            Saisissez votre adresse email. Si un compte existe, vous recevrez un
            lien pour définir un nouveau mot de passe.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-6 text-center">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </main>
  )
}
