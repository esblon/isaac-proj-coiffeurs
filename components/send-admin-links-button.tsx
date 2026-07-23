"use client"

import { useState } from "react"
import { Mail, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendAdminLinks } from "@/app/actions/admin-email"

export function SendAdminLinksButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  )
  const [message, setMessage] = useState("")

  async function handleSend() {
    setStatus("loading")
    setMessage("")
    try {
      const res = await sendAdminLinks()
      setStatus(res.ok ? "ok" : "error")
      setMessage(res.message)
    } catch (err) {
      setStatus("error")
      setMessage(
        err instanceof Error ? err.message : "Erreur lors de l'envoi.",
      )
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={handleSend}
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Mail className="size-4" />
        )}
        Recevoir le lien par email
      </Button>
      {message && (
        <p
          className={`flex items-start gap-1.5 text-xs ${
            status === "error" ? "text-destructive" : "text-primary"
          }`}
        >
          {status === "ok" ? (
            <Check className="mt-0.5 size-3.5 shrink-0" />
          ) : status === "error" ? (
            <X className="mt-0.5 size-3.5 shrink-0" />
          ) : null}
          <span className="text-pretty">{message}</span>
        </p>
      )}
    </div>
  )
}
