import { describe, expect, it } from "vitest"
import { resolveCatalogItem } from "@/lib/catalog"

describe("resolveCatalogItem", () => {
  it("preserves every subscription package and canonical price", () => {
    expect(resolveCatalogItem("abonnement-Essentiel")?.price).toBe(9000)
    expect(resolveCatalogItem("abonnement-Premium")?.price).toBe(15000)
    expect(resolveCatalogItem("abonnement-VIP")?.price).toBe(25000)
    expect(resolveCatalogItem("abonnement-Famille")?.price).toBe(35000)
  })

  it("supports gift subscription identifiers without trusting their price", () => {
    expect(
      resolveCatalogItem("abonnement-Premium-cadeau-0700000000"),
    ).toMatchObject({ price: 15000, recurring: true })
  })

  it("rejects unknown client-controlled identifiers", () => {
    expect(resolveCatalogItem("produit-inconnu")).toBeNull()
  })
})
