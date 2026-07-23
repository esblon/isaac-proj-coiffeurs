"use server"

import { randomBytes, createHash } from "node:crypto"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  adminAuditEvents,
  adRequests,
  contactNumbers,
  orders,
  partnerApplications,
  partnerInvitations,
  partnerLedger,
  partners,
  user,
} from "@/lib/db/schema"
import { getAdminSession } from "@/lib/admin"
import { sendEmail } from "@/lib/email"

const decisionSchema = z.enum(["nouveau", "en_attente", "valide", "refuse"])
const orderStatusSchema = z.enum([
  "nouveau",
  "en_attente",
  "accepte",
  "termine",
  "annule",
])
const phoneSchema = z
  .string()
  .trim()
  .min(8)
  .max(24)
  .regex(/^[+\d\s().-]+$/)

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session.isAdmin) throw new Error("Accès réservé aux administrateurs.")
  return session.email
}

async function audit(
  actorEmail: string,
  entityType: string,
  entityId: string | number,
  action: string,
  details: Record<string, unknown> = {},
) {
  await db.insert(adminAuditEvents).values({
    actorEmail,
    entityType,
    entityId: String(entityId),
    action,
    details,
  })
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { isAdmin } = await getAdminSession()
  return isAdmin
}

export async function updatePartnerApplication(input: unknown) {
  const actor = await requireAdmin()
  const parsed = z
    .object({
      id: z.number().int().positive(),
      status: decisionSchema,
      response: z.string().trim().max(2000),
    })
    .parse(input)

  await db
    .update(partnerApplications)
    .set({
      status: parsed.status,
      adminResponse: parsed.response || null,
      reviewedAt: new Date(),
      reviewedBy: actor,
    })
    .where(eq(partnerApplications.id, parsed.id))
  await audit(actor, "partner_application", parsed.id, parsed.status, {
    response: parsed.response,
  })
  revalidatePath("/admin")
  return { ok: true }
}

export async function updateOrderRequest(input: unknown) {
  const actor = await requireAdmin()
  const parsed = z
    .object({
      id: z.number().int().positive(),
      status: orderStatusSchema,
      response: z.string().trim().max(2000),
      partnerId: z.number().int().positive().nullable().optional(),
    })
    .parse(input)

  await db
    .update(orders)
    .set({
      status: parsed.status,
      adminResponse: parsed.response || null,
      assignedPartnerId: parsed.partnerId ?? null,
    })
    .where(eq(orders.id, parsed.id))
  await audit(actor, "order", parsed.id, parsed.status, {
    response: parsed.response,
    partnerId: parsed.partnerId ?? null,
  })
  revalidatePath("/admin")
  return { ok: true }
}

export async function createPartnerAndInvite(input: unknown) {
  const actor = await requireAdmin()
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(254),
      phone: phoneSchema,
    })
    .parse(input)
  const email = parsed.email.toLowerCase()

  const existing = await db
    .select({ id: partners.id })
    .from(partners)
    .where(sql`lower(${partners.email}) = ${email}`)
    .limit(1)
  if (existing.length) throw new Error("Un partenaire utilise déjà cet email.")

  const token = randomBytes(32).toString("base64url")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

  const [partner] = await db
    .insert(partners)
    .values({
      name: parsed.name,
      email,
      phone: parsed.phone,
      status: "invite",
      invitedAt: new Date(),
    })
    .returning()
  await db.insert(partnerInvitations).values({
    partnerId: partner.id,
    tokenHash,
    expiresAt,
  })

  const baseURL = (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  )
  const inviteUrl = `${baseURL}/partenaire/invitation?token=${encodeURIComponent(token)}`
  const sent = await sendEmail({
    to: email,
    subject: "Votre invitation partenaire Coiffeurs225",
    text: `Bonjour ${parsed.name},\n\nCréez votre mot de passe partenaire avec ce lien valable 48 heures :\n${inviteUrl}`,
    html: `<p>Bonjour ${parsed.name},</p><p>Votre compte partenaire Coiffeurs225 est prêt.</p><p><a href="${inviteUrl}">Créer mon mot de passe</a></p><p>Ce lien expire dans 48 heures.</p>`,
  })
  if (!sent.ok) {
    await db.delete(partners).where(eq(partners.id, partner.id))
    throw new Error(sent.error ?? "L’invitation email n’a pas pu être envoyée.")
  }

  await audit(actor, "partner", partner.id, "invited", { email })
  revalidatePath("/admin")
  return { ok: true }
}

export async function addPartnerLedgerEntry(input: unknown) {
  const actor = await requireAdmin()
  const parsed = z
    .object({
      partnerId: z.number().int().positive(),
      type: z.enum(["historique", "gain", "paiement"]),
      description: z.string().trim().min(2).max(500),
      amount: z.number().int().min(-10_000_000).max(10_000_000),
    })
    .parse(input)
  await db.insert(partnerLedger).values({ ...parsed, createdBy: actor })
  await audit(actor, "partner", parsed.partnerId, "ledger_entry", {
    type: parsed.type,
    amount: parsed.amount,
  })
  revalidatePath("/admin")
  return { ok: true }
}

export async function addContactNumber(input: unknown) {
  const actor = await requireAdmin()
  const parsed = z
    .object({
      label: z.string().trim().min(2).max(80),
      number: phoneSchema,
      isActive: z.boolean(),
    })
    .parse(input)
  const [contact] = await db
    .insert(contactNumbers)
    .values({ ...parsed, createdBy: actor, updatedBy: actor })
    .returning()
  await audit(actor, "contact_number", contact.id, "created", parsed)
  revalidatePath("/admin")
  return { ok: true }
}

export async function updateContactNumber(input: unknown) {
  const actor = await requireAdmin()
  const parsed = z
    .object({
      id: z.number().int().positive(),
      label: z.string().trim().min(2).max(80),
      number: phoneSchema,
      isActive: z.boolean(),
    })
    .parse(input)
  await db
    .update(contactNumbers)
    .set({ ...parsed, updatedBy: actor, updatedAt: new Date() })
    .where(eq(contactNumbers.id, parsed.id))
  await audit(actor, "contact_number", parsed.id, "updated", parsed)
  revalidatePath("/admin")
  return { ok: true }
}

export async function getAdminOverview() {
  await requireAdmin()
  const [
    ordersRows,
    applicationsRows,
    adsRows,
    usersRows,
    partnerRows,
    contactRows,
    ledgerRows,
    auditRows,
  ] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(partnerApplications).orderBy(desc(partnerApplications.createdAt)),
    db.select().from(adRequests).orderBy(desc(adRequests.createdAt)),
    db.select().from(user).orderBy(desc(user.createdAt)),
    db.select().from(partners).orderBy(desc(partners.createdAt)),
    db.select().from(contactNumbers).orderBy(desc(contactNumbers.updatedAt)),
    db.select().from(partnerLedger).orderBy(desc(partnerLedger.createdAt)),
    db.select().from(adminAuditEvents).orderBy(desc(adminAuditEvents.createdAt)).limit(100),
  ])

  const totalRevenue = ordersRows.reduce((sum, order) => sum + order.total, 0)
  const byDay = new Map<string, { revenue: number; orders: number }>()
  for (const order of ordersRows) {
    const day = new Date(order.createdAt).toISOString().slice(0, 10)
    const current = byDay.get(day) ?? { revenue: 0, orders: 0 }
    current.revenue += order.total
    current.orders += 1
    byDay.set(day, current)
  }

  return {
    metrics: {
      totalOrders: ordersRows.length,
      totalRevenue,
      totalPartners: partnerRows.length,
      totalApplications: applicationsRows.length,
      totalAds: adsRows.length,
      totalUsers: usersRows.length,
      avgOrderValue: ordersRows.length ? Math.round(totalRevenue / ordersRows.length) : 0,
    },
    revenueByDay: Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, value]) => ({ date, ...value })),
    orders: ordersRows,
    applications: applicationsRows,
    ads: adsRows,
    users: usersRows,
    partners: partnerRows.map((partner) => ({
      ...partner,
      ledger: ledgerRows.filter((entry) => entry.partnerId === partner.id),
    })),
    contacts: contactRows,
    audit: auditRows,
  }
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>
