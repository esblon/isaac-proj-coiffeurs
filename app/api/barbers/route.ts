import { and, asc, eq, gt, ilike } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { partnerAvailabilities, partners } from "@/lib/db/schema"

const querySchema = z.object({
  sector: z.string().trim().max(80).optional().default(""),
})

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    sector: url.searchParams.get("sector") ?? "",
  })
  if (!parsed.success) {
    return NextResponse.json({ error: "Secteur invalide." }, { status: 400 })
  }

  const conditions = [
    eq(partners.status, "actif"),
    eq(partnerAvailabilities.status, "disponible"),
    gt(partnerAvailabilities.startsAt, new Date()),
  ]
  if (parsed.data.sector) {
    conditions.push(ilike(partners.sector, `%${parsed.data.sector}%`))
  }

  const rows = await db
    .select({
      partnerId: partners.id,
      name: partners.name,
      sector: partners.sector,
      startsAt: partnerAvailabilities.startsAt,
      endsAt: partnerAvailabilities.endsAt,
    })
    .from(partners)
    .innerJoin(
      partnerAvailabilities,
      eq(partnerAvailabilities.partnerId, partners.id),
    )
    .where(and(...conditions))
    .orderBy(asc(partnerAvailabilities.startsAt))
    .limit(100)

  const grouped = new Map<
    number,
    {
      id: number
      name: string
      sector: string
      availabilities: { startsAt: Date; endsAt: Date }[]
    }
  >()
  for (const row of rows) {
    const barber = grouped.get(row.partnerId) ?? {
      id: row.partnerId,
      name: row.name,
      sector: row.sector ?? "Secteur non précisé",
      availabilities: [],
    }
    barber.availabilities.push({ startsAt: row.startsAt, endsAt: row.endsAt })
    grouped.set(row.partnerId, barber)
  }

  return NextResponse.json(
    { barbers: Array.from(grouped.values()) },
    { headers: { "Cache-Control": "private, no-store" } },
  )
}
