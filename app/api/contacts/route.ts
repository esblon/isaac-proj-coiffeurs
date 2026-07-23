import { asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { contactNumbers } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

export async function GET() {
  const contacts = await db
    .select({
      id: contactNumbers.id,
      label: contactNumbers.label,
      number: contactNumbers.number,
    })
    .from(contactNumbers)
    .where(eq(contactNumbers.isActive, true))
    .orderBy(asc(contactNumbers.id))

  return Response.json(
    { contacts },
    { headers: { "Cache-Control": "no-store" } },
  )
}
