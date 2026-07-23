import Link from "next/link"
import { getPartnerDashboard } from "@/app/actions/partner"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Espace partenaire — Coiffeurs225",
  robots: { index: false, follow: false },
}

const money = (value: number) => `${value.toLocaleString("fr-FR")} FCFA`

export default async function PartnerPage() {
  const dashboard = await getPartnerDashboard()

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="font-heading text-2xl font-bold">Espace partenaire</h1>
            <p className="text-sm text-muted-foreground">{dashboard.partner.name}</p>
          </div>
          <Button nativeButton={false} render={<Link href="/" />} variant="outline">
            Retour au site
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Gains cumulés</p>
            <p className="mt-2 text-2xl font-bold">{money(dashboard.gains)}</p>
          </article>
          <article className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Statut</p>
            <p className="mt-2 text-2xl font-bold capitalize">{dashboard.partner.status}</p>
          </article>
        </section>
        <section className="rounded-xl border bg-card">
          <div className="border-b p-4">
            <h2 className="font-heading text-lg font-bold">Mon historique</h2>
          </div>
          <div className="divide-y">
            {dashboard.ledger.map((entry) => (
              <article key={entry.id} className="flex justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{entry.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString("fr-FR")} · {entry.type}
                  </p>
                </div>
                <p className="font-semibold">{money(entry.amount)}</p>
              </article>
            ))}
            {!dashboard.ledger.length && (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Aucun historique pour le moment.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
