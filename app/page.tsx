import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { Barbers } from "@/components/barbers"
import { Testimonials } from "@/components/testimonials"
import { Services } from "@/components/services"
import { KitShop } from "@/components/kit-shop"
import { Subscription } from "@/components/subscription"
import { MobileApp } from "@/components/mobile-app"
import { AdBanners } from "@/components/ad-banners"
import { HowItWorks } from "@/components/how-it-works"
import { PartnerCta } from "@/components/partner-cta"
import { Advertise } from "@/components/advertise"
import { SiteFooter } from "@/components/site-footer"
import { CartProvider } from "@/lib/cart-context"
import { CartDrawer } from "@/components/cart-drawer"
import { CartAddedToast } from "@/components/cart-added-toast"
import { CollapsibleSection } from "@/components/collapsible-section"
import { ThemeChooser } from "@/components/theme-chooser"
import { AvailabilityBrowser } from "@/components/availability-browser"

export default function Page() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main>
          {/* Sections principales toujours visibles */}
          <Hero />
          <Services />
          <KitShop />
          <Subscription />
          <AvailabilityBrowser />

          {/* Sections secondaires : repliées, à dérouler au clic */}
          <CollapsibleSection
            anchorId="barbers"
            title="Nos meilleurs coiffeurs"
            description="Découvrez les coiffeurs disponibles près de chez vous."
          >
            <Barbers />
          </CollapsibleSection>

          <CollapsibleSection
            anchorId="temoignages"
            title="Témoignages clients"
            description="Ils racontent leur expérience en vidéo."
          >
            <Testimonials />
          </CollapsibleSection>

          <CollapsibleSection
            anchorId="comment"
            title="Comment ça marche"
            description="Réservez votre coupe en trois étapes simples."
          >
            <HowItWorks />
          </CollapsibleSection>

          <CollapsibleSection
            anchorId="offres"
            title="Offres & promotions"
            description="Les bons plans de nos partenaires."
          >
            <AdBanners />
          </CollapsibleSection>

          <CollapsibleSection
            anchorId="application"
            title="Application mobile"
            description="Toute la plateforme dans votre poche."
          >
            <MobileApp />
          </CollapsibleSection>

          <CollapsibleSection
            anchorId="resultats"
            title="Coiffeurs 225 en chiffres"
            description="Notre communauté en quelques statistiques."
          >
            <Stats />
          </CollapsibleSection>

          <CollapsibleSection
            anchorId="partenaires"
            title="Devenir partenaire"
            description="Vous êtes coiffeur ou barbier ? Rejoignez-nous."
          >
            <PartnerCta />
          </CollapsibleSection>

          <CollapsibleSection
            anchorId="annonceurs"
            title="Annonceurs & publicité"
            description="Marques et entreprises : faites votre publicité sur nos plateformes."
          >
            <Advertise />
          </CollapsibleSection>

          <ThemeChooser />
        </main>
        <SiteFooter />
        <CartDrawer />
        <CartAddedToast />
      </div>
    </CartProvider>
  )
}
