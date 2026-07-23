import { describe, expect, it } from "vitest"
import { availabilityInputSchema, sectorSchema } from "@/lib/availability"

describe("availabilityInputSchema", () => {
  it("accepte un créneau valide", () => {
    const result = availabilityInputSchema.safeParse({
      startsAt: "2030-01-01T09:00:00.000Z",
      endsAt: "2030-01-01T10:00:00.000Z",
    })
    expect(result.success).toBe(true)
  })

  it("refuse une fin antérieure au début", () => {
    const result = availabilityInputSchema.safeParse({
      startsAt: "2030-01-01T10:00:00.000Z",
      endsAt: "2030-01-01T09:00:00.000Z",
    })
    expect(result.success).toBe(false)
  })

  it("refuse un créneau de plus de douze heures", () => {
    const result = availabilityInputSchema.safeParse({
      startsAt: "2030-01-01T08:00:00.000Z",
      endsAt: "2030-01-02T08:00:00.000Z",
    })
    expect(result.success).toBe(false)
  })
})

describe("sectorSchema", () => {
  it("normalise et valide un secteur", () => {
    expect(sectorSchema.parse("  Cocody  ")).toBe("Cocody")
  })
})
