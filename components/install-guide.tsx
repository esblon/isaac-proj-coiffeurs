"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Scissors,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  ArrowLeft,
  Check,
} from "lucide-react"
import { InstallAppButton } from "@/components/install-app-button"

type Platform = "ios" | "android" | "desktop"

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop"
  const ua = navigator.userAgent || ""
  if (/iPad|iPhone|iPod/.test(ua)) return "ios"
  if (/Android/.test(ua)) return "android"
  return "desktop"
}

const benefits = [
  "Réservation en un clic, où que vous soyez",
  "Notifications de confirmation et de rappel",
  "Accès rapide à vos coiffeurs favoris",
  "Fonctionne hors connexion une fois installée",
]

export function InstallGuide() {
  const [platform, setPlatform] = useState<Platform>("desktop")
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        // iOS Safari
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true,
    )
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="mt-8 flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Scissors className="size-8" />
          </span>
          <h1 className="mt-5 text-balance font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Installez Coiffeurs225
          </h1>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Ajoutez l&apos;application à votre écran d&apos;accueil pour une
            expérience plein écran, rapide et installable — sur iPhone comme sur
            Android.
          </p>
        </div>

        {standalone ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-8 text-center">
            <Check className="size-10 text-primary" />
            <p className="font-heading text-lg font-bold uppercase">
              Application déjà installée
            </p>
            <p className="text-sm text-muted-foreground">
              Vous utilisez actuellement Coiffeurs225 en mode application. Bonne
              coupe&nbsp;!
            </p>
          </div>
        ) : (
          <>
            {/* Bouton d'installation direct (Android / Chrome) */}
            {platform !== "ios" && (
              <div className="mt-10 flex justify-center">
                <InstallAppButton />
              </div>
            )}

            <div className="mt-10 grid gap-5">
              <PlatformCard
                active={platform === "ios"}
                title="Sur iPhone / iPad (Safari)"
                steps={[
                  {
                    icon: <Share className="size-5" />,
                    text: "Touchez le bouton Partager dans la barre de Safari.",
                  },
                  {
                    icon: <PlusSquare className="size-5" />,
                    text: "Choisissez « Sur l'écran d'accueil ».",
                  },
                  {
                    icon: <Check className="size-5" />,
                    text: "Validez avec « Ajouter » : l'icône apparaît sur votre écran.",
                  },
                ]}
              />

              <PlatformCard
                active={platform === "android"}
                title="Sur Android (Chrome)"
                steps={[
                  {
                    icon: <Download className="size-5" />,
                    text: "Touchez « Installer l'app » ci-dessus, ou…",
                  },
                  {
                    icon: <MoreVertical className="size-5" />,
                    text: "Ouvrez le menu ⋮ de Chrome.",
                  },
                  {
                    icon: <PlusSquare className="size-5" />,
                    text: "Choisissez « Installer l'application » / « Ajouter à l'écran d'accueil ».",
                  },
                ]}
              />
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}

function PlatformCard({
  title,
  steps,
  active,
}: {
  title: string
  steps: { icon: React.ReactNode; text: string }[]
  active: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        active
          ? "border-primary bg-card shadow-lg shadow-primary/10"
          : "border-border bg-card/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-bold uppercase tracking-wide">
          {title}
        </h2>
        {active && (
          <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            Votre appareil
          </span>
        )}
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              {step.icon}
            </span>
            <span className="leading-snug text-foreground">{step.text}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
