"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  addContactNumber,
  addPartnerLedgerEntry,
  createPartnerAndInvite,
  updateContactNumber,
  updateOrderRequest,
  updatePartnerApplication,
  type AdminOverview,
} from "@/app/actions/admin"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  ClipboardList,
  LogOut,
  Scissors,
  Users,
  Wallet,
} from "lucide-react"

type Tab = "orders" | "applications" | "partners" | "contacts" | "history"

const money = (value: number) => `${value.toLocaleString("fr-FR")} FCFA`
const date = (value: string | Date) =>
  new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })

export function AdminDashboard({
  overview,
  adminEmail,
}: {
  overview: AdminOverview
  adminEmail: string
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("orders")
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function run(action: () => Promise<unknown>) {
    setMessage(null)
    startTransition(async () => {
      try {
        await action()
        setMessage("Modification enregistrée.")
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Une erreur est survenue.")
      }
    })
  }

  const cards = [
    ["Revenus", money(overview.metrics.totalRevenue), Wallet],
    ["Demandes", String(overview.metrics.totalOrders), ClipboardList],
    ["Candidatures", String(overview.metrics.totalApplications), Scissors],
    ["Partenaires", String(overview.metrics.totalPartners), Users],
  ] as const

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase">Administration</h1>
            <p className="text-sm text-muted-foreground">{adminEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button nativeButton={false} render={<Link href="/" />} variant="outline" size="sm">
              <ArrowLeft className="size-4" /> Site
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await authClient.signOut()
                location.assign("/admin/login")
              }}
            >
              <LogOut className="size-4" /> Quitter
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-7">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <article key={label} className="rounded-xl border bg-card p-4">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="size-4 text-primary" /> {label}
              </p>
              <p className="mt-2 text-xl font-bold">{value}</p>
            </article>
          ))}
        </section>

        <nav className="flex flex-wrap gap-2 border-b pb-3">
          {([
            ["orders", "Demandes coiffure"],
            ["applications", "Candidatures"],
            ["partners", "Partenaires"],
            ["contacts", "Contacts"],
            ["history", "Historique admin"],
          ] as [Tab, string][]).map(([id, label]) => (
            <Button
              key={id}
              variant={tab === id ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(id)}
            >
              {label}
            </Button>
          ))}
        </nav>

        {message && (
          <p className="rounded-lg border bg-card px-4 py-3 text-sm" role="status">
            {message}
          </p>
        )}

        {tab === "orders" && (
          <section className="space-y-3">
            {overview.orders.map((order) => (
              <article key={order.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{order.reference} · {order.customerName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {order.customerPhone} · {money(order.total)} · {date(order.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{order.status}</span>
                </div>
                <form
                  className="mt-4 grid gap-2 md:grid-cols-[180px_1fr_200px_auto]"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const data = new FormData(event.currentTarget)
                    run(() =>
                      updateOrderRequest({
                        id: order.id,
                        status: data.get("status"),
                        response: data.get("response"),
                        partnerId: data.get("partnerId")
                          ? Number(data.get("partnerId"))
                          : null,
                      }),
                    )
                  }}
                >
                  <select name="status" defaultValue={order.status} className="rounded-md border bg-background px-3">
                    <option value="nouveau">Nouveau</option>
                    <option value="en_attente">En attente</option>
                    <option value="accepte">Accepté</option>
                    <option value="termine">Terminé</option>
                    <option value="annule">Annulé</option>
                  </select>
                  <Input name="response" defaultValue={order.adminResponse ?? ""} placeholder="Réponse au client" />
                  <select
                    name="partnerId"
                    defaultValue={order.assignedPartnerId ?? ""}
                    className="rounded-md border bg-background px-3"
                  >
                    <option value="">Non assigné</option>
                    {overview.partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>{partner.name}</option>
                    ))}
                  </select>
                  <Button disabled={pending}>Enregistrer</Button>
                </form>
              </article>
            ))}
            {!overview.orders.length && <Empty label="Aucune demande de coiffure." />}
          </section>
        )}

        {tab === "applications" && (
          <section className="space-y-3">
            {overview.applications.map((application) => (
              <article key={application.id} className="rounded-xl border bg-card p-4">
                <h2 className="font-semibold">{application.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {application.phone} · {application.email ?? "email non fourni"} · {application.activityType ?? "activité non précisée"}
                </p>
                <p className="mt-2 text-sm">{application.message}</p>
                <form
                  className="mt-4 grid gap-2 md:grid-cols-[180px_1fr_auto]"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const data = new FormData(event.currentTarget)
                    run(() =>
                      updatePartnerApplication({
                        id: application.id,
                        status: data.get("status"),
                        response: data.get("response"),
                      }),
                    )
                  }}
                >
                  <select name="status" defaultValue={application.status} className="rounded-md border bg-background px-3">
                    <option value="nouveau">Nouveau</option>
                    <option value="en_attente">En attente</option>
                    <option value="valide">Validé</option>
                    <option value="refuse">Refusé</option>
                  </select>
                  <Input name="response" defaultValue={application.adminResponse ?? ""} placeholder="Réponse au candidat" />
                  <Button disabled={pending}>Enregistrer</Button>
                </form>
              </article>
            ))}
            {!overview.applications.length && <Empty label="Aucune candidature." />}
          </section>
        )}

        {tab === "partners" && (
          <section className="space-y-5">
            <form
              className="grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const data = new FormData(form)
                run(async () => {
                  await createPartnerAndInvite({
                    name: data.get("name"),
                    email: data.get("email"),
                    phone: data.get("phone"),
                  })
                  form.reset()
                })
              }}
            >
              <Input name="name" placeholder="Nom du partenaire" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="phone" placeholder="Téléphone" required />
              <Button disabled={pending}>Créer et inviter</Button>
            </form>

            {overview.partners.map((partner) => (
              <article key={partner.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{partner.name}</h2>
                    <p className="text-sm text-muted-foreground">{partner.email} · {partner.phone}</p>
                  </div>
                  <span className="text-sm font-medium">{partner.status}</span>
                </div>
                <p className="mt-3 text-sm font-semibold">
                  Gains : {money(partner.ledger.reduce((sum, item) => sum + item.amount, 0))}
                </p>
                <form
                  className="mt-3 grid gap-2 md:grid-cols-[150px_1fr_160px_auto]"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const data = new FormData(event.currentTarget)
                    run(() =>
                      addPartnerLedgerEntry({
                        partnerId: partner.id,
                        type: data.get("type"),
                        description: data.get("description"),
                        amount: Number(data.get("amount")),
                      }),
                    )
                  }}
                >
                  <select name="type" className="rounded-md border bg-background px-3">
                    <option value="historique">Historique</option>
                    <option value="gain">Gain</option>
                    <option value="paiement">Paiement</option>
                  </select>
                  <Input name="description" placeholder="Description" required />
                  <Input name="amount" type="number" defaultValue="0" />
                  <Button disabled={pending}>Ajouter</Button>
                </form>
              </article>
            ))}
          </section>
        )}

        {tab === "contacts" && (
          <section className="space-y-4">
            <form
              className="grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-[1fr_1fr_160px_auto]"
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const data = new FormData(form)
                run(async () => {
                  await addContactNumber({
                    label: data.get("label"),
                    number: data.get("number"),
                    isActive: data.get("isActive") === "true",
                  })
                  form.reset()
                })
              }}
            >
              <Input name="label" placeholder="Libellé (WhatsApp, support…)" required />
              <Input name="number" placeholder="+225…" required />
              <select name="isActive" className="rounded-md border bg-background px-3">
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
              <Button disabled={pending}>Ajouter</Button>
            </form>
            {overview.contacts.map((contact) => (
              <form
                key={contact.id}
                className="grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-[1fr_1fr_160px_auto]"
                onSubmit={(event) => {
                  event.preventDefault()
                  const data = new FormData(event.currentTarget)
                  run(() =>
                    updateContactNumber({
                      id: contact.id,
                      label: data.get("label"),
                      number: data.get("number"),
                      isActive: data.get("isActive") === "true",
                    }),
                  )
                }}
              >
                <Input name="label" defaultValue={contact.label} required />
                <Input name="number" defaultValue={contact.number} required />
                <select name="isActive" defaultValue={String(contact.isActive)} className="rounded-md border bg-background px-3">
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
                <Button disabled={pending}>Modifier</Button>
              </form>
            ))}
          </section>
        )}

        {tab === "history" && (
          <section className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr><th className="p-3">Date</th><th>Admin</th><th>Objet</th><th>Action</th></tr>
              </thead>
              <tbody className="divide-y">
                {overview.audit.map((event) => (
                  <tr key={event.id}>
                    <td className="p-3">{date(event.createdAt)}</td>
                    <td>{event.actorEmail}</td>
                    <td>{event.entityType} #{event.entityId}</td>
                    <td>{event.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}
