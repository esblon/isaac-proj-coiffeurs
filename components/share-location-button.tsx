"use client"

import { useState } from "react"
import { MapPin, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContact } from "@/components/contact-provider"

type Status = "idle" | "locating" | "error" | "done"

export type LocationInfo = {
  latitude: number
  longitude: number
  mapsLink: string
}

export function ShareLocationButton({
  className,
  variant = "outline",
  onLocated,
  customerName,
}: {
  className?: string
  variant?: "default" | "outline" | "secondary"
  /** Appelé lorsque la position a été capturée et envoyée. */
  onLocated?: (info: LocationInfo) => void
  /** Nom du client, ajouté au message WhatsApp si fourni. */
  customerName?: string
}) {
  const { whatsappNumber: WHATSAPP_NUMBER } = useContact()
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState<string | null>(null)

  function shareLocation() {
    setMessage(null)

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error")
      setMessage(
        "La géolocalisation n'est pas disponible sur cet appareil.",
      )
      return
    }

    setStatus("locating")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`
        const text = encodeURIComponent(
          [
            customerName
              ? `Bonjour Coiffeurs225, ${customerName} partage sa localisation pour le service à domicile :`
              : "Bonjour Coiffeurs225, voici ma localisation pour le service à domicile :",
            mapsLink,
            "",
            "Je souhaite réserver un coiffeur près de cette position.",
          ].join("\n"),
        )
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
        window.open(waUrl, "_blank", "noopener,noreferrer")
        setStatus("done")
        onLocated?.({ latitude, longitude, mapsLink })
      },
      (err) => {
        setStatus("error")
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "Autorisez l'accès à votre position pour l'envoyer."
            : "Impossible de récupérer votre position. Réessayez.",
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={status === "done" ? "secondary" : variant}
        onClick={shareLocation}
        disabled={status === "locating"}
        className="w-full"
      >
        {status === "locating" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : status === "done" ? (
          <CheckCircle2 className="size-4 text-primary" />
        ) : (
          <MapPin className="size-4" />
        )}
        {status === "locating"
          ? "Localisation en cours…"
          : status === "done"
            ? "Localisation envoyée — renvoyer"
            : "Envoyer ma localisation"}
      </Button>
      {message && (
        <p
          role="status"
          className="mt-2 text-xs leading-relaxed text-muted-foreground"
        >
          {message}
        </p>
      )}
    </div>
  )
}
