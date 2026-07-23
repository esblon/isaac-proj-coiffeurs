"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Check } from "lucide-react"

const options = [
  {
    value: "light",
    label: "Clair",
    description: "Fond clair, idéal en plein jour.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Sombre",
    description: "Ambiance ambrée, repose les yeux.",
    icon: Moon,
  },
] as const

export function ThemeChooser() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <section className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-balance sm:text-3xl">
          Choisissez votre thème
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Personnalisez l&apos;apparence du site selon votre préférence. Votre
          choix est mémorisé sur cet appareil.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {options.map((option) => {
            const isActive = mounted && theme === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                aria-pressed={isActive}
                className={`group relative flex items-center gap-4 rounded-2xl border p-5 text-left transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <option.icon className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-heading text-lg font-bold uppercase">
                    {option.label}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                {isActive && (
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-4" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
