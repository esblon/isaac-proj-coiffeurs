import { sql } from "drizzle-orm"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await db.execute(sql`select 1`)

    return Response.json(
      { application: "ok", database: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Health check database probe failed", error)

    return Response.json(
      { application: "ok", database: "error" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }
}
