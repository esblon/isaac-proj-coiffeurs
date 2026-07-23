"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Scissors, MessageCircle, Menu, X, ShoppingBag, LogOut, User, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContact } from "@/components/contact-provider"
import { useCart } from "@/lib/cart-context"
import { authClient } from "@/lib/auth-client"
import { isCurrentUserAdmin } from "@/app/actions/admin"

const navLinks = [
  { label: "Barbiers", href: "#barbers" },
  { label: "Services", href: "#services" },
  { label: "Kit coiffure", href: "#kit" },
  { label: "Abonnement", href: "#abonnement" },
  { label: "Partenaires", href: "#partenaires" },
  { label: "Application", href: "#application" },
]

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/50"
      aria-label={`Ouvrir la commande (${count} article${count > 1 ? "s" : ""})`}
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  )
}

export function SiteHeader() {
  const { whatsappUrl: WHATSAPP_URL, phoneDisplay: PHONE_DISPLAY } = useContact()
  const [open, setOpen] = useState(false)
  const { count, openCart } = useCart()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  // Statut admin via session Better Auth OU cookie admin (connexion en un clic).
  const { data: isAdmin } = useSWR("is-admin", () => isCurrentUserAdmin())

  async function handleSignOut() {
    await authClient.signOut()
    router.refresh()
  }

  const firstName = session?.user?.name?.split(" ")[0]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scissors className="size-5" />
          </span>
          <span className="font-heading text-xl font-bold tracking-wide">
            Coiffeurs<span className="text-primary">225</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className="size-4 text-primary" />
            {PHONE_DISPLAY}
          </a>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href="/admin" />}
            >
              <LayoutDashboard className="size-4" />
              Admin
            </Button>
          )}
          {!isPending && session?.user ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <User className="size-4 text-primary" />
                {firstName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                aria-label="Se déconnecter"
              >
                <LogOut className="size-4" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<a href="/connexion" />}
            >
              Se connecter
            </Button>
          )}
          <CartButton count={count} onClick={openCart} />
          <Button size="sm" nativeButton={false} render={<a href="#barbers" />}>
            Réserver
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartButton count={count} onClick={openCart} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            {isAdmin && (
              <a
                href="/admin"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-md px-2 py-3 text-sm font-medium text-primary transition-colors hover:bg-secondary"
              >
                <LayoutDashboard className="size-4" />
                Tableau de bord admin
              </a>
            )}
            <div className="mt-2 flex gap-3">
              {!isPending && session?.user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setOpen(false)
                    handleSignOut()
                  }}
                >
                  <LogOut className="size-4" />
                  Déconnexion
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  nativeButton={false}
                  render={
                    <a href="/connexion" onClick={() => setOpen(false)} />
                  }
                >
                  Se connecter
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1"
                nativeButton={false}
                render={
                  <a href="#barbers" onClick={() => setOpen(false)} />
                }
              >
                Réserver
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
