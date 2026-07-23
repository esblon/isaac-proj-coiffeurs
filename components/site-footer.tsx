import { Scissors, Mail, MapPin, MessageCircle, Globe } from "lucide-react"
import { SITE_URL, WHATSAPP_URL, PHONE_DISPLAY } from "@/lib/site"

const siteLabel = SITE_URL.replace(/^https?:\/\//, "")

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Scissors className="size-5" />
              </span>
              <span className="font-heading text-xl font-bold tracking-wide">
                Coiffeurs<span className="text-primary">225</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              La plateforme de réservation de barbiers et coiffeurs N°1 à
              Abidjan.
            </p>
            <div className="mt-4 flex gap-3 text-muted-foreground">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Écrivez-nous sur WhatsApp"
                className="transition-colors hover:text-primary"
              >
                <MessageCircle className="size-5" />
              </a>
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Site web"
                className="transition-colors hover:text-primary"
              >
                <Globe className="size-5" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">
              Services
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-foreground">Services</a></li>
              <li><a href="#barbers" className="hover:text-foreground">Barbiers</a></li>
              <li><a href="#kit" className="hover:text-foreground">Kit coiffure</a></li>
              <li><a href="#abonnement" className="hover:text-foreground">Abonnement</a></li>
              <li><a href="#application" className="hover:text-foreground">Application</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">
              Abidjan
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Cocody</li>
              <li>Plateau</li>
              <li>Marcory</li>
              <li>Riviera</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MessageCircle className="size-4 text-primary" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {PHONE_DISPLAY}
                  <span className="ml-1 text-xs text-primary">(WhatsApp)</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <a href="mailto:isaacdosso@gmail.com" className="hover:text-foreground">
                  isaacdosso@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Abidjan, Côte d&apos;Ivoire
              </li>
              <li className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <a
                  href={SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {siteLabel}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 Coiffeurs225. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
