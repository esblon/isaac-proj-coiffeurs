import { z } from "zod"

export const availabilityStatusSchema = z.enum([
  "disponible",
  "reserve",
  "indisponible",
])

export const availabilityInputSchema = z
  .object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine(({ startsAt, endsAt }) => endsAt > startsAt, {
    message: "L'heure de fin doit être postérieure à l'heure de début.",
  })
  .refine(
    ({ startsAt, endsAt }) =>
      endsAt.getTime() - startsAt.getTime() <= 12 * 60 * 60 * 1000,
    { message: "Un créneau ne peut pas dépasser 12 heures." },
  )

export const sectorSchema = z.string().trim().min(2).max(80)
