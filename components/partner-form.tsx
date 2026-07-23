"use client"

import { useState, useRef, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  MapPin,
  Upload,
  FileCheck,
} from "lucide-react"
import { zones } from "@/lib/data"
import { buildWhatsappLink } from "@/lib/site"
import { useContact } from "@/components/contact-provider"
import { savePartnerApplication } from "@/app/actions/submissions"

type HomeLocation = {
  latitude: number
  longitude: number
  mapsLink: string
}

type ActivityType = "Salon fixe" | "Coiffeur mobile" | "Les deux"

const SPECIALTIES = [
  "Dégradé / Fade",
  "Barbe & rasage",
  "Coupe classique",
  "Locks & twists",
  "Coloration",
  "Soins capillaires",
  "Coupe enfant",
  "Coiffure femme",
]

const EXPERIENCE_OPTIONS = [
  "Moins d'1 an",
  "1 à 3 ans",
  "3 à 5 ans",
  "Plus de 5 ans",
]

export function PartnerForm({ onSuccess }: { onSuccess?: () => void }) {
  const { whatsappNumber: WHATSAPP_NUMBER } = useContact()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [residence, setResidence] = useState("")
  const [activity, setActivity] = useState<ActivityType>("Coiffeur mobile")
  const [shopName, setShopName] = useState("")
  const [experience, setExperience] = useState(EXPERIENCE_OPTIONS[1])
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [hasEquipment, setHasEquipment] = useState(true)
  const [message, setMessage] = useState("")
  const [idFile, setIdFile] = useState<File | null>(null)
  const [homeLocation, setHomeLocation] = useState<HomeLocation | null>(null)
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "error">(
    "idle",
  )
  const [geoError, setGeoError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggle(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value]
  }

  function handleIdFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > 8 * 1024 * 1024) {
      setError("La pièce d'identité ne doit pas dépasser 8 Mo.")
      return
    }
    setError(null)
    setIdFile(file)
  }

  function locateHome() {
    setGeoError(null)
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("error")
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.")
      return
    }
    setGeoStatus("locating")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setHomeLocation({
          latitude,
          longitude,
          mapsLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
        })
        setGeoStatus("idle")
      },
      (err) => {
        setGeoStatus("error")
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Autorisez l'accès à votre position pour localiser votre domicile."
            : "Impossible de récupérer votre position. Réessayez.",
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim()) {
      setError("Veuillez renseigner au moins votre nom et votre téléphone.")
      return
    }
    if (selectedZones.length === 0) {
      setError("Sélectionnez au moins une zone d'intervention.")
      return
    }
    if (!idFile) {
      setError("Veuillez ajouter une copie de votre pièce d'identité.")
      return
    }
    if (!homeLocation) {
      setError("Veuillez partager la géolocalisation de votre domicile.")
      return
    }

    setSubmitting(true)

    const result = await savePartnerApplication({
      name,
      phone,
      email,
      activityType: activity,
      experience,
      hasEquipment: hasEquipment ? "Oui" : "Non",
      zones: selectedZones,
      specialties,
      idDocumentName: idFile.name,
      homeLat: homeLocation.latitude,
      homeLng: homeLocation.longitude,
      message: message || undefined,
    })
    if (!result.ok) {
      setSubmitting(false)
      setError(result.message ?? "La candidature n’a pas pu être enregistrée.")
      return
    }

    const lines = [
      "*Coiffeurs225 — Candidature partenaire*",
      "",
      `Nom : ${name}`,
      `Téléphone : ${phone}`,
      email ? `Email : ${email}` : null,
      residence ? `Quartier de résidence : ${residence}` : null,
      "",
      `Type d'activité : ${activity}`,
      activity !== "Coiffeur mobile" && shopName
        ? `Nom du salon : ${shopName}`
        : null,
      `Expérience : ${experience}`,
      `Matériel personnel : ${hasEquipment ? "Oui" : "Non"}`,
      "",
      `Zones d'intervention : ${selectedZones.join(", ")}`,
      specialties.length ? `Spécialités : ${specialties.join(", ")}` : null,
      "",
      `Domicile (géoloc) : ${homeLocation.mapsLink}`,
      `Pièce d'identité : ${idFile.name} (à joindre dans ce chat)`,
      message ? `\nMessage : ${message}` : null,
    ].filter(Boolean)

    const waLink = buildWhatsappLink(WHATSAPP_NUMBER, lines.join("\n"))
    window.open(waLink, "_blank", "noopener,noreferrer")

    setSubmitting(false)
    setDone(true)
    onSuccess?.()
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h3 className="mt-3 font-heading text-xl font-bold uppercase tracking-tight">
          Candidature envoyée
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre candidature a été transmise à Coiffeurs225 via WhatsApp. Appuyez
          sur <span className="font-semibold">Envoyer</span> dans WhatsApp pour
          finaliser. Notre équipe vous recontacte sous 48h.
        </p>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <MessageCircle className="size-4 text-primary" />
          Réponse rapide par téléphone ou WhatsApp.
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-left shadow-sm sm:p-8"
    >
      {/* Informations personnelles */}
      <fieldset className="space-y-4">
        <legend className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
          1. Vos informations
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pf-name">Nom complet *</Label>
            <Input
              id="pf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Kouassi Yao"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-phone">Téléphone (WhatsApp) *</Label>
            <Input
              id="pf-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07 00 00 00 00"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-email">Email (optionnel)</Label>
            <Input
              id="pf-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-residence">Quartier de résidence</Label>
            <Input
              id="pf-residence"
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
              placeholder="Ex : Cocody Angré"
            />
          </div>
        </div>
      </fieldset>

      {/* Activité */}
      <fieldset className="mt-8 space-y-4">
        <legend className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
          2. Votre activité
        </legend>
        <div className="space-y-1.5">
          <Label>Type d&apos;activité</Label>
          <div className="flex flex-wrap gap-2">
            {(["Salon fixe", "Coiffeur mobile", "Les deux"] as ActivityType[]).map(
              (opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setActivity(opt)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    activity === opt
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}
                >
                  {opt}
                </button>
              ),
            )}
          </div>
        </div>
        {activity !== "Coiffeur mobile" && (
          <div className="space-y-1.5">
            <Label htmlFor="pf-shop">Nom du salon</Label>
            <Input
              id="pf-shop"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Ex : Le Salon du Plateau"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Années d&apos;expérience</Label>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setExperience(opt)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  experience === opt
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={hasEquipment}
            onChange={(e) => setHasEquipment(e.target.checked)}
            className="size-4 accent-primary"
          />
          Je dispose de mon propre matériel (tondeuse, ciseaux, etc.)
        </label>
      </fieldset>

      {/* Zones */}
      <fieldset className="mt-8 space-y-3">
        <legend className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
          3. Zones d&apos;intervention *
        </legend>
        <div className="flex flex-wrap gap-2">
          {zones.map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setSelectedZones((prev) => toggle(prev, zone))}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selectedZones.includes(zone)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Spécialités */}
      <fieldset className="mt-8 space-y-3">
        <legend className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
          4. Vos spécialités
        </legend>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => setSpecialties((prev) => toggle(prev, spec))}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                specialties.includes(spec)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Pièce d'identité & domicile */}
      <fieldset className="mt-8 space-y-4">
        <legend className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
          5. Vérification d&apos;identité *
        </legend>

        {/* Upload pièce d'identité */}
        <div className="space-y-1.5">
          <Label>Copie de votre pièce d&apos;identité (CNI, passeport…)</Label>
          <input
            ref={fileInputRef}
            id="pf-id"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleIdFile}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex w-full items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-left text-sm transition-colors ${
              idFile
                ? "border-primary bg-primary/10 text-foreground"
                : "border-input bg-background text-muted-foreground hover:border-primary"
            }`}
          >
            {idFile ? (
              <FileCheck className="size-5 shrink-0 text-primary" />
            ) : (
              <Upload className="size-5 shrink-0" />
            )}
            <span className="truncate">
              {idFile ? idFile.name : "Ajouter une copie (photo ou PDF, max 8 Mo)"}
            </span>
          </button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Le fichier reste sur votre appareil : joignez-le directement dans la
            conversation WhatsApp qui s&apos;ouvrira après l&apos;envoi.
          </p>
        </div>

        {/* Géolocalisation du domicile */}
        <div className="space-y-1.5">
          <Label>Géolocalisation de votre domicile</Label>
          <Button
            type="button"
            variant={homeLocation ? "secondary" : "outline"}
            onClick={locateHome}
            disabled={geoStatus === "locating"}
            className="w-full"
          >
            {geoStatus === "locating" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : homeLocation ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <MapPin className="size-4" />
            )}
            {geoStatus === "locating"
              ? "Localisation en cours…"
              : homeLocation
                ? "Domicile localisé — relocaliser"
                : "Localiser mon domicile"}
          </Button>
          {homeLocation ? (
            <p className="flex items-center gap-1.5 text-[11px] text-primary">
              <CheckCircle2 className="size-3.5" />
              Position enregistrée et jointe à votre candidature.
            </p>
          ) : (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Permet de vérifier votre zone et d&apos;assurer la sécurité des
              clients.
            </p>
          )}
          {geoError && (
            <p className="text-[11px] text-destructive" role="status">
              {geoError}
            </p>
          )}
        </div>
      </fieldset>

      {/* Message */}
      <fieldset className="mt-8 space-y-1.5">
        <legend className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
          6. Message (optionnel)
        </legend>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Présentez-vous en quelques mots…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </fieldset>

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        disabled={submitting}
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MessageCircle className="size-4" />
        )}
        {submitting ? "Envoi en cours…" : "Envoyer ma candidature"}
      </Button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Votre candidature est transmise à Coiffeurs225 via WhatsApp. Aucune
        donnée n&apos;est stockée sur ce site.
      </p>
    </form>
  )
}
