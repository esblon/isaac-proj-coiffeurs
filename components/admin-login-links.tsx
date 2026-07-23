"use client"

import { useState } from "react"
import { LogIn, Copy, Check } from "lucide-react"

type AdminLink = { email: string; link: string; absolute: string }

export function AdminLoginLinks({ links }: { links: AdminLink[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(email: string, absolute: string) {
    try {
      await navigator.clipboard.writeText(absolute)
      setCopied(email)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {links.map(({ email, link, absolute }) => (
        <div
          key={email}
          className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"
        >
          <a
            href={link}
            className="flex flex-1 items-center gap-2 truncate text-sm font-medium transition-colors hover:text-primary"
          >
            <LogIn className="size-4 shrink-0 text-primary" />
            <span className="truncate">{email}</span>
          </a>
          <button
            type="button"
            onClick={() => copy(email, absolute)}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-secondary"
            aria-label={`Copier le lien de connexion pour ${email}`}
          >
            {copied === email ? (
              <>
                <Check className="size-3.5 text-primary" />
                Copié
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copier
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
