"use server"

import { db } from "@/lib/db"
import { orders, partnerApplications, adRequests } from "@/lib/db/schema"

type OrderItemInput = {
  name: string
  qty: number
  price: number
  recurring?: boolean
}

export async function saveOrder(input: {
  reference: string
  customerName: string
  customerPhone: string
  payment?: string
  total: number
  items: OrderItemInput[]
  locationLat?: number | null
  locationLng?: number | null
}) {
  try {
    await db.insert(orders).values({
      reference: input.reference,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      payment: input.payment ?? null,
      total: Math.round(input.total),
      items: input.items,
      locationLat: input.locationLat ?? null,
      locationLng: input.locationLng ?? null,
    })
    return { ok: true }
  } catch (err) {
    console.log("[v0] saveOrder error:", (err as Error).message)
    return { ok: false }
  }
}

export async function savePartnerApplication(input: {
  name: string
  phone: string
  activityType?: string
  experience?: string
  hasEquipment?: string
  zones: string[]
  specialties: string[]
  idDocumentName?: string
  homeLat?: number | null
  homeLng?: number | null
  message?: string
}) {
  try {
    await db.insert(partnerApplications).values({
      name: input.name,
      phone: input.phone,
      activityType: input.activityType ?? null,
      experience: input.experience ?? null,
      hasEquipment: input.hasEquipment ?? null,
      zones: input.zones,
      specialties: input.specialties,
      idDocumentName: input.idDocumentName ?? null,
      homeLat: input.homeLat ?? null,
      homeLng: input.homeLng ?? null,
      message: input.message ?? null,
    })
    return { ok: true }
  } catch (err) {
    console.log("[v0] savePartnerApplication error:", (err as Error).message)
    return { ok: false }
  }
}

export async function saveAdRequest(input: {
  package: string
  duration?: string
  estimatedBudget?: string
  company: string
  contact: string
  phone: string
  email?: string
  message?: string
}) {
  try {
    await db.insert(adRequests).values({
      package: input.package,
      duration: input.duration ?? null,
      estimatedBudget: input.estimatedBudget ?? null,
      company: input.company,
      contact: input.contact,
      phone: input.phone,
      email: input.email ?? null,
      message: input.message ?? null,
    })
    return { ok: true }
  } catch (err) {
    console.log("[v0] saveAdRequest error:", (err as Error).message)
    return { ok: false }
  }
}
