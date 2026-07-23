"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === "accepted") setInstalled(true)
      setDeferred(null)
    } else {
      // Navigateurs sans support du prompt (iOS Safari) : on guide l'utilisateur.
      alert(
        "Pour installer l'application : ouvrez le menu de votre navigateur puis choisissez « Ajouter à l'écran d'accueil ».",
      )
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-3 rounded-xl bg-primary px-5 py-3 text-primary-foreground transition-opacity hover:opacity-90"
    >
      <Download className="size-6" />
      <span className="text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-wide">
          {installed ? "Application" : "Installer"}
        </span>
        <span className="block text-base font-semibold">
          {installed ? "Déjà installée" : "Installer l'app"}
        </span>
      </span>
    </button>
  )
}
