import { barbers, kitProducts, priceForZone, services } from "@/lib/data"

export type CatalogItem = {
  id: string
  name: string
  price: number
  recurring: boolean
}

const subscriptionPrices = new Map([
  ["Essentiel", 9000],
  ["Premium", 15000],
  ["VIP", 25000],
  ["Famille", 35000],
])

function parsePrice(value: string): number {
  return Number.parseInt(value.replace(/[^\d]/g, ""), 10)
}

export function resolveCatalogItem(id: string): CatalogItem | null {
  if (id === "kit-complet-225") {
    return { id, name: "Kit complet 225", price: 24000, recurring: false }
  }

  const product = kitProducts.find((item) => id === `produit-${item.name}`)
  if (product) {
    return {
      id,
      name: product.name,
      price: parsePrice(product.price),
      recurring: false,
    }
  }

  const service = services.find((item) => id === `service-${item.name}`)
  if (service) {
    return {
      id,
      name: `Réservation — ${service.name}`,
      price: parsePrice(service.price),
      recurring: false,
    }
  }

  const barber = barbers.find((item) => id === `reservation-${item.name}`)
  if (barber) {
    return {
      id,
      name: `RDV — ${barber.name}`,
      price: parsePrice(priceForZone(barber.area)),
      recurring: false,
    }
  }

  const planName = Array.from(subscriptionPrices.keys()).find((name) =>
    id.startsWith(`abonnement-${name}`),
  )
  if (planName) {
    return {
      id,
      name: `Abonnement ${planName}`,
      price: subscriptionPrices.get(planName) as number,
      recurring: true,
    }
  }

  return null
}
