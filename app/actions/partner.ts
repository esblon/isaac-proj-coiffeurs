"use server"

import { createHash } from "node:crypto"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { and, desc, eq, gt } from "drizzle-orm"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  partnerInvitations,
  partnerLedger,
  partners,
} from "@/lib/db/schema"

export async function acceptPartnerInvitation(input: unknown) {
  const parsed = z
    .object({
      token: z.string().min(20).max(500),
      password: z.string().min(8).max(128),
    })
    .parse(input)
  const tokenHash = createHash("sha256").update(parsed.token).digest("hex")
  const rows = await db
    .select({ invitation: partnerInvitations, partner: partners })
    .from(partnerInvitations)
    .innerJoin(partners, eq(partnerInvitations.partnerId, partners.id))
    .where(
      and(
        eq(partnerInvitations.tokenHash, tokenHash),
        gt(partnerInvitations.expiresAt, new Date()),
      ),
    )
    .limit(1)
  const row = rows[0]
  if (!row || row.invitation.acceptedAt) {
    return { ok: false, message: "Invitation invalide ou expirée." }
  }

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: row.partner.email,
        password: parsed.password,
        name: row.partner.name,
      },
    })
    await db.transaction(async (tx) => {
      await tx
        .update(partners)
        .set({
          userId: result.user.id,
          status: "actif",
          activatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(partners.id, row.partner.id))
      await tx
        .update(partnerInvitations)
        .set({ acceptedAt: new Date() })
        .where(eq(partnerInvitations.id, row.invitation.id))
      await tx.insert(partnerLedger).values({
        partnerId: row.partner.id,
        type: "historique",
        description: "Compte partenaire activé",
      })
    })
    return { ok: true, message: "Compte activé. Vous pouvez vous connecter." }
  } catch {
    return {
      ok: false,
      message: "Ce compte existe peut-être déjà. Utilisez mot de passe oublié.",
    }
  }
}

export async function getPartnerSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, session.user.id))
    .limit(1)
  return partner ? { session, partner } : null
}

export async function getPartnerDashboard() {
  const identity = await getPartnerSession()
  if (!identity) redirect("/connexion?redirect=/partenaire")
  const ledger = await db
    .select()
    .from(partnerLedger)
    .where(eq(partnerLedger.partnerId, identity.partner.id))
    .orderBy(desc(partnerLedger.createdAt))
  return {
    partner: identity.partner,
    ledger,
    gains: ledger.reduce((sum, entry) => sum + entry.amount, 0),
  }
}
