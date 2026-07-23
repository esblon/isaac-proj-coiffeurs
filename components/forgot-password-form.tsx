"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { requestPasswordReset } from "@/app/actions/admin-password"
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setResult(null)
    const res = await requestPasswordReset(email)
    setResult(res)
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="reset-email" className="text-sm font-medium">
          Adresse email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="reset-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            autoComplete="email"
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none ring-ring/50 focus-visible:ring-2"
          />
        </div>
      </div>

      {result && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
            result.ok
              ? "border border-primary/40 bg-primary/10 text-foreground"
              : "border border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <p className="text-pretty">{result.message}</p>
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
      </Button>
    </form>
  )
}
