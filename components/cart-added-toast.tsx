"use client"

import { useEffect } from "react"
import { CheckCircle2, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

export function CartAddedToast() {
  const { recentlyAdded, openCart, dismissRecentlyAdded } = useCart()

  // Ferme automatiquement la notification après quelques secondes
  useEffect(() => {
    if (!recentlyAdded) return
    const timer = setTimeout(dismissRecentlyAdded, 8000)
    return () => clearTimeout(timer)
  }, [recentlyAdded, dismissRecentlyAdded])

  if (!recentlyAdded) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-sm rounded-xl border border-border bg-card p-4 shadow-xl sm:inset-x-auto sm:right-6"
    >
      <button
        type="button"
        onClick={dismissRecentlyAdded}
        aria-label="Fermer"
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Ajouté au panier</p>
          <p className="truncate text-xs text-muted-foreground">{recentlyAdded}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={dismissRecentlyAdded}
        >
          Continuer mes achats
        </Button>
        <Button size="sm" className="flex-1" onClick={openCart}>
          <ShoppingBag className="size-4" />
          Aller au panier
        </Button>
      </div>
    </div>
  )
}
