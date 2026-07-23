"use client"

import { useState } from "react"
import Link from "next/link"
import type { AdminOverview } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
  ShoppingBag,
  Users,
  Megaphone,
  Scissors,
  Wallet,
  TrendingUp,
  ArrowLeft,
  MapPin,
  LogOut,
} from "lucide-react"

function formatFcfa(n: number): string {
  return `${n.toLocaleString("fr-FR")} FCFA`
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type Tab = "orders" | "partners" | "ads" | "users"

export function AdminDashboard({
  overview,
  adminEmail,
}: {
  overview: AdminOverview
  adminEmail: string
}) {
  const [tab, setTab] = useState<Tab>("orders")
  const { metrics, revenueByDay, orders, partners, ads, users } = overview

  const maxRevenue = Math.max(1, ...revenueByDay.map((d) => d.revenue))

  const metricCards = [
    {
      label: "Chiffre d'affaires",
      value: formatFcfa(metrics.totalRevenue),
      icon: Wallet,
    },
    {
      label: "Commandes",
      value: metrics.totalOrders.toLocaleString("fr-FR"),
      icon: ShoppingBag,
    },
    {
      label: "Panier moyen",
      value: formatFcfa(metrics.avgOrderValue),
      icon: TrendingUp,
    },
    {
      label: "Candidatures coiffeurs",
      value: metrics.totalPartners.toLocaleString("fr-FR"),
      icon: Scissors,
    },
    {
      label: "Demandes annonceurs",
      value: metrics.totalAds.toLocaleString("fr-FR"),
      icon: Megaphone,
    },
    {
      label: "Comptes clients",
      value: metrics.totalUsers.toLocaleString("fr-FR"),
      icon: Users,
    },
  ]

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "orders", label: "Commandes", count: orders.length },
    { id: "partners", label: "Coiffeurs", count: partners.length },
    { id: "ads", label: "Annonceurs", count: ads.length },
    { id: "users", label: "Utilisateurs", count: users.length },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* En-tête */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-sm text-muted-foreground">
              Vue complète du site et de l&apos;application · {adminEmail}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Retour au site
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href="/api/admin-login?logout=1">
                <LogOut className="size-4" />
                Quitter
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Cartes métriques */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {metricCards.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <m.icon className="size-4 text-primary" />
                <span className="text-xs font-medium">{m.label}</span>
              </div>
              <p className="mt-2 font-heading text-2xl font-bold tabular-nums">
                {m.value}
              </p>
            </div>
          ))}
        </section>

        {/* Graphique revenu par jour */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-bold uppercase tracking-tight">
            Revenu des 14 derniers jours
          </h2>
          {revenueByDay.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aucune commande enregistrée pour le moment.
            </p>
          ) : (
            <div className="mt-6 flex h-48 items-end gap-2">
              {revenueByDay.map((d) => (
                <div
                  key={d.date}
                  className="flex flex-1 flex-col items-center gap-2"
                  title={`${formatFcfa(d.revenue)} · ${d.orders} commande(s)`}
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-primary transition-all"
                      style={{
                        height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(d.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Onglets de données */}
        <section className="mt-8">
          <div className="flex flex-wrap gap-2 border-b border-border">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            {tab === "orders" && <OrdersTable rows={orders} />}
            {tab === "partners" && <PartnersTable rows={partners} />}
            {tab === "ads" && <AdsTable rows={ads} />}
            {tab === "users" && <UsersTable rows={users} />}
          </div>
        </section>
      </div>
    </main>
  )

  function EmptyRow({ cols, label }: { cols: number; label: string }) {
    return (
      <tr>
        <td
          colSpan={cols}
          className="px-4 py-8 text-center text-sm text-muted-foreground"
        >
          {label}
        </td>
      </tr>
    )
  }

  function OrdersTable({ rows }: { rows: AdminOverview["orders"] }) {
    return (
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Référence</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Téléphone</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Paiement</th>
            <th className="px-4 py-3">Position</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <EmptyRow cols={7} label="Aucune commande." />
          ) : (
            rows.map((o) => (
              <tr key={o.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{o.reference}</td>
                <td className="px-4 py-3 font-medium">{o.customerName}</td>
                <td className="px-4 py-3">{o.customerPhone}</td>
                <td className="px-4 py-3 font-semibold">
                  {formatFcfa(o.total)}
                </td>
                <td className="px-4 py-3">{o.payment ?? "—"}</td>
                <td className="px-4 py-3">
                  {o.locationLat && o.locationLng ? (
                    <a
                      href={`https://www.google.com/maps?q=${o.locationLat},${o.locationLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <MapPin className="size-3.5" />
                      Carte
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(o.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )
  }

  function PartnersTable({ rows }: { rows: AdminOverview["partners"] }) {
    return (
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Téléphone</th>
            <th className="px-4 py-3">Activité</th>
            <th className="px-4 py-3">Zones</th>
            <th className="px-4 py-3">Pièce ID</th>
            <th className="px-4 py-3">Domicile</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <EmptyRow cols={7} label="Aucune candidature." />
          ) : (
            rows.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.phone}</td>
                <td className="px-4 py-3">{p.activityType ?? "—"}</td>
                <td className="px-4 py-3 text-xs">
                  {(p.zones as string[]).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {p.idDocumentName ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {p.homeLat && p.homeLng ? (
                    <a
                      href={`https://www.google.com/maps?q=${p.homeLat},${p.homeLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <MapPin className="size-3.5" />
                      Carte
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(p.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )
  }

  function AdsTable({ rows }: { rows: AdminOverview["ads"] }) {
    return (
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Entreprise</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Téléphone</th>
            <th className="px-4 py-3">Package</th>
            <th className="px-4 py-3">Durée</th>
            <th className="px-4 py-3">Budget</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <EmptyRow cols={7} label="Aucune demande annonceur." />
          ) : (
            rows.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{a.company}</td>
                <td className="px-4 py-3">{a.contact}</td>
                <td className="px-4 py-3">{a.phone}</td>
                <td className="px-4 py-3">{a.package}</td>
                <td className="px-4 py-3">{a.duration ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">
                  {a.estimatedBudget ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(a.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )
  }

  function UsersTable({ rows }: { rows: AdminOverview["users"] }) {
    return (
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Vérifié</th>
            <th className="px-4 py-3">Inscription</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <EmptyRow cols={4} label="Aucun utilisateur." />
          ) : (
            rows.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.emailVerified ? "Oui" : "Non"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(u.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )
  }
}
