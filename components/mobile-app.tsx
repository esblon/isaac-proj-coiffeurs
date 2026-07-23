import { Bell, Calendar, MapPin, Smartphone, Star, BadgeCheck } from "lucide-react"
import { InstallAppButton } from "@/components/install-app-button"
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/site"

const appFeatures = [
  {
    icon: Calendar,
    title: "Réservation en 1 clic",
    text: "Réservez votre barbier et gérez vos rendez-vous où que vous soyez.",
  },
  {
    icon: Bell,
    title: "Rappels & notifications",
    text: "Recevez des rappels avant chaque rendez-vous et des offres exclusives.",
  },
  {
    icon: MapPin,
    title: "Coiffeurs/barbiers près de chez vous",
    text: "Géolocalisez les meilleurs coiffeurs de votre zone en temps réel.",
  },
]

export function MobileApp() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <Smartphone className="size-3.5" />
            Nouveau · Version 2.0
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold uppercase tracking-tight text-balance sm:text-4xl">
            L&apos;application mobile Coiffeurs 225
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Toute la plateforme dans votre poche. Réservez, payez et gérez votre
            abonnement depuis votre smartphone, disponible sur iOS et Android.
          </p>

          <ul className="mt-8 space-y-5">
            {appFeatures.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <InstallAppButton />
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-foreground px-5 py-3 text-background transition-opacity hover:opacity-90"
            >
              <AppleIcon />
              <span className="text-left leading-tight">
                <span className="block text-[10px] uppercase tracking-wide">
                  Télécharger sur
                </span>
                <span className="block text-base font-semibold">App Store</span>
              </span>
            </a>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-foreground px-5 py-3 text-background transition-opacity hover:opacity-90"
            >
              <PlayIcon />
              <span className="text-left leading-tight">
                <span className="block text-[10px] uppercase tracking-wide">
                  Disponible sur
                </span>
                <span className="block text-base font-semibold">
                  Google Play
                </span>
              </span>
            </a>
          </div>
          <p className="mt-4 max-w-xl text-xs text-muted-foreground">
            L&apos;application est une web-app installable : appuyez sur
            « Installer l&apos;app » pour l&apos;ajouter à votre écran
            d&apos;accueil, sans passer par un store.
          </p>
        </div>

        <div className="flex justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" className="size-7" aria-hidden="true" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 512 512" className="size-7" aria-hidden="true" fill="currentColor">
      <path d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l220.7-221.3 60.1 60.1L104.6 499z" />
    </svg>
  )
}

function PhoneMockup() {
  return (
    <div className="relative w-[280px] rounded-[2.5rem] border-[10px] border-foreground/90 bg-background shadow-2xl">
      <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-foreground/90" />
      <div className="overflow-hidden rounded-[1.8rem]">
        {/* App header */}
        <div className="bg-primary px-5 pb-5 pt-9 text-primary-foreground">
          <p className="text-xs opacity-80">Bonjour 👋</p>
          <p className="font-heading text-lg font-bold">Trouvez votre barbier</p>
          <div className="mt-3 rounded-lg bg-background/20 px-3 py-2 text-xs">
            Rechercher un service, un quartier…
          </div>
        </div>

        {/* App body */}
        <div className="space-y-3 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Près de vous
          </p>
          {[
            { name: "Rafik", area: "Cocody", rating: "4.9" },
            { name: "Medhy", area: "Riviera", rating: "4.9" },
            { name: "Abdul Karim", area: "Zone 4", rating: "4.8" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <MapPin className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-medium">
                  {item.name}
                  <BadgeCheck className="size-3.5 shrink-0 text-primary" />
                </p>
                <p className="text-xs text-muted-foreground">{item.area}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold">
                <Star className="size-3 fill-primary text-primary" />
                {item.rating}
              </span>
            </div>
          ))}
          <div className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
            Réserver maintenant
          </div>
        </div>
      </div>
    </div>
  )
}
