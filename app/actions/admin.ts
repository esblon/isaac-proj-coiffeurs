"use server"

import { db } from "@/lib/db"
import {
  orders,
  partnerApplications,
  adRequests,
  user,
} from "@/lib/db/schema"
import { getAdminSession } from "@/lib/admin"
import { desc } from "drizzle-orm"

async function requireAdmin() {
  const { isAdmin } = await getAdminSession()
  if (!isAdmin) throw new Error("Accès réservé aux administrateurs.")
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { isAdmin } = await getAdminSession()
  return isAdmin
}

export async function getAdminOverview() {
  await requireAdmin()

  const [ordersRows, partnersRows, adsRows, usersRows] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db
      .select()
      .from(partnerApplications)
      .orderBy(desc(partnerApplications.createdAt)),
    db.select().from(adRequests).orderBy(desc(adRequests.createdAt)),
    db.select().from(user).orderBy(desc(user.createdAt)),
  ])

  const totalRevenue = ordersRows.reduce((sum, o) => sum + (o.total ?? 0), 0)

  // Revenu par jour (14 derniers jours) pour le graphique.
  const byDay = new Map<string, { revenue: number; orders: number }>()
  for (const o of ordersRows) {
    const day = new Date(o.createdAt).toISOString().slice(0, 10)
    const cur = byDay.get(day) ?? { revenue: 0, orders: 0 }
    cur.revenue += o.total ?? 0
    cur.orders += 1
    byDay.set(day, cur)
  }
  const revenueByDay = Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }))

  return {
    metrics: {
      totalOrders: ordersRows.length,
      totalRevenue,
      totalPartners: partnersRows.length,
      totalAds: adsRows.length,
      totalUsers: usersRows.length,
      avgOrderValue: ordersRows.length
        ? Math.round(totalRevenue / ordersRows.length)
        : 0,
    },
    revenueByDay,
    orders: ordersRows,
    partners: partnersRows,
    ads: adsRows,
    users: usersRows,
  }
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>
