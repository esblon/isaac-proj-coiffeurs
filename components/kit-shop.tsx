"use client"

import Image from "next/image"
import { Check, ShoppingBag, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { kitProducts } from "@/lib/data"
import { SectionHeading } from "@/components/section-heading"
import { useCart, parsePrice } from "@/lib/cart-context"

export function KitShop() {
  const { addItem } = useCart()
  return (
    <section id="kit" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        title="Kit de coiffure homme"
        subtitle="Entretenez votre style à la maison avec notre kit complet : tondeuse, brosse et shampoing. Livré partout à Abidjan."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        {/* Featured complete kit */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[16/10]">
            <Image
              src="/images/kit-complet.png"
              alt="Kit de coiffure homme complet : tondeuse, brosse et shampoing"
              fill
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Best-seller
            </span>
          </div>
          <div className="p-6">
            <h3 className="font-heading text-2xl font-bold uppercase">
              Kit complet 225
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tout le nécessaire pour une coupe nette et des cheveux soignés au
              quotidien.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Tondeuse professionnelle sans fil",
                "Brosse à cheveux en bois",
                "Shampoing fortifiant homme",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground line-through">
                  27 500 FCFA
                </p>
                <p className="font-heading text-3xl font-bold text-primary">
                  24 000 FCFA
                </p>
              </div>
              <Button
                size="lg"
                onClick={() =>
                  addItem({
                    id: "kit-complet-225",
                    name: "Kit complet 225",
                    detail: "Tondeuse + brosse + shampoing",
                    price: 24000,
                    type: "produit",
                    image: "/images/kit-complet.png",
                  })
                }
              >
                <ShoppingBag className="size-4" />
                Acheter le kit
              </Button>
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="size-4 text-primary" />
              Livraison gratuite dès 20 000 FCFA · Paiement Mobile Money
            </p>
          </div>
        </div>

        {/* Individual products */}
        <div className="grid gap-4">
          {kitProducts.map((product) => (
            <div
              key={product.name}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-heading text-lg font-semibold">
                  {product.name}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-heading font-bold text-primary">
                    {product.price}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addItem({
                        id: `produit-${product.name}`,
                        name: product.name,
                        price: parsePrice(product.price),
                        type: "produit",
                        image: product.image,
                      })
                    }
                  >
                    <ShoppingBag className="size-4" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
