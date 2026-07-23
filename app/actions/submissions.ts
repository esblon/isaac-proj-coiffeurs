"use server"

import { z } from "zod"
import { db } from "@/lib/db"
import { orders, partnerApplications, adRequests } from "@/lib/db/schema"
import { resolveCatalogItem } from "@/lib/catalog"
import { notifyOrder } from "@/lib/notifications"
import { rateLimit } from "@/lib/security/rate-limit"

const phoneSchema = z
  .string()
  .trim()
  .min(8)
  .max(24)
  .regex(/^[+\d\s().-]+$/)

const coordinateSchema = z.number().finite()

const orderSchema = z.object({
  reference: z.string().trim().regex(/^C225-\d{6}$/),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: phoneSchema,
  payment: z.enum([
    "Orange Money",
    "Wave",
    "MTN MoMo",
    "Moov Money",
    "Carte bancaire",
  ]),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(200),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
  locationLat: coordinateSchema.min(-90).max(90),
  locationLng: coordinateSchema.min(-180).max(180),
})

const partnerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  activityType: z.string().trim().max(80).optional(),
  experience: z.string().trim().max(80).optional(),
  hasEquipment: z.string().trim().max(80).optional(),
  zones: z.array(z.string().trim().min(1).max(80)).max(20),
  specialties: z.array(z.string().trim().min(1).max(80)).max(30),
  idDocumentName: z.string().trim().max(255).optional(),
  homeLat: coordinateSchema.min(-90).max(90).nullable().optional(),
  homeLng: coordinateSchema.min(-180).max(180).nullable().optional(),
  message: z.string().trim().max(2000).optional(),
})

const adSchema = z.object({
  package: z.enum(["Visibilité", "Croissance", "Prestige"]),
  duration: z.string().trim().max(50).optional(),
  estimatedBudget: z.string().trim().max(50).optional(),
  company: z.string().trim().min(2).max(150),
  contact: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional(),
})

export type SubmissionResult = {
  ok: boolean
  message?: string
  notification?: "whatsapp" | "sms" | "none"
  total?: number
}

export async function saveOrder(input: unknown): Promise<SubmissionResult> {
  const allowed = await rateLimit("order", 5, 10 * 60 * 1000)
  if (!allowed.ok) {
    return {
      ok: false,
      message: `Trop de tentatives. Réessayez dans ${allowed.retryAfterSeconds} secondes.`,
    }
  }

  const parsed = orderSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: "Les informations de commande sont invalides." }
  }

  const canonicalItems = parsed.data.items.map((item) => {
    const catalogItem = resolveCatalogItem(item.id)
    return catalogItem ? { ...catalogItem, qty: item.qty } : null
  })
  if (canonicalItems.some((item) => item === null)) {
    return { ok: false, message: "Un article de la commande n’est plus disponible." }
  }

  const items = canonicalItems.filter(
    (item): item is NonNullable<typeof item> => item !== null,
  )
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  try {
    await db.insert(orders).values({
      reference: parsed.data.reference,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      payment: parsed.data.payment,
      total,
      items,
      locationLat: parsed.data.locationLat,
      locationLng: parsed.data.locationLng,
    })
  } catch (error) {
    console.error("Order persistence failed", error)
    return { ok: false, message: "La commande n’a pas pu être enregistrée." }
  }

  const notification = await notifyOrder({
    reference: parsed.data.reference,
    total,
    customer: {
      name: parsed.data.customerName,
      phone: parsed.data.customerPhone,
      payment: parsed.data.payment,
    },
    items,
  })
  return { ok: true, total, notification }
}

export async function savePartnerApplication(
  input: unknown,
): Promise<SubmissionResult> {
  const allowed = await rateLimit("partner", 3, 60 * 60 * 1000)
  if (!allowed.ok) return { ok: false, message: "Trop de demandes. Réessayez plus tard." }

  const parsed = partnerSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Formulaire partenaire invalide." }

  try {
    await db.insert(partnerApplications).values({
      ...parsed.data,
      activityType: parsed.data.activityType || null,
      email: parsed.data.email || null,
      experience: parsed.data.experience || null,
      hasEquipment: parsed.data.hasEquipment || null,
      idDocumentName: parsed.data.idDocumentName || null,
      homeLat: parsed.data.homeLat ?? null,
      homeLng: parsed.data.homeLng ?? null,
      message: parsed.data.message || null,
    })
    return { ok: true }
  } catch (error) {
    console.error("Partner application persistence failed", error)
    return { ok: false, message: "La candidature n’a pas pu être enregistrée." }
  }
}

export async function saveAdRequest(input: unknown): Promise<SubmissionResult> {
  const allowed = await rateLimit("advertiser", 5, 60 * 60 * 1000)
  if (!allowed.ok) return { ok: false, message: "Trop de demandes. Réessayez plus tard." }

  const parsed = adSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: "Formulaire annonceur invalide." }

  try {
    await db.insert(adRequests).values({
      ...parsed.data,
      duration: parsed.data.duration || null,
      estimatedBudget: parsed.data.estimatedBudget || null,
      email: parsed.data.email || null,
      message: parsed.data.message || null,
    })
    return { ok: true }
  } catch (error) {
    console.error("Advertiser request persistence failed", error)
    return { ok: false, message: "La demande n’a pas pu être enregistrée." }
  }
}
