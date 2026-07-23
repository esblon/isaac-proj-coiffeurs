import { PartnerInvitationForm } from "@/components/partner-invitation-form"

export const metadata = {
  title: "Invitation partenaire — Coiffeurs225",
  robots: { index: false, follow: false },
}

export default async function PartnerInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const token = (await searchParams).token ?? ""
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      {token ? (
        <PartnerInvitationForm token={token} />
      ) : (
        <p className="rounded-xl border bg-card p-6">Lien d’invitation invalide.</p>
      )}
    </main>
  )
}
