"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { acceptPartnerInvitation } from "@/app/actions/partner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PartnerInvitationForm({ token }: { token: string }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  return (
    <form
      className="mx-auto w-full max-w-md space-y-4 rounded-xl border bg-card p-6"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        startTransition(async () => {
          const result = await acceptPartnerInvitation({
            token,
            password: data.get("password"),
          })
          setMessage(result.message)
          setSuccess(result.ok)
        })
      }}
    >
      <div>
        <h1 className="font-heading text-2xl font-bold">Activer mon compte partenaire</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisissez votre mot de passe pour accéder à votre historique et vos gains.
        </p>
      </div>
      {!success && (
        <div className="space-y-2">
          <Label htmlFor="partner-password">Mot de passe</Label>
          <Input
            id="partner-password"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
      )}
      {message && <p className="text-sm" role="status">{message}</p>}
      {success ? (
        <Button nativeButton={false} render={<Link href="/connexion?redirect=/partenaire" />} className="w-full">
          Se connecter
        </Button>
      ) : (
        <Button disabled={pending} className="w-full">
          {pending ? "Activation…" : "Activer mon compte"}
        </Button>
      )}
    </form>
  )
}
