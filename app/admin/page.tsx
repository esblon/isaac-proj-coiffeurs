import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin"
import { getAdminOverview } from "@/app/actions/admin"
import { AdminDashboard } from "@/components/admin-dashboard"

export const metadata = {
  title: "Administration — Coiffeurs225",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const { isAdmin, email } = await getAdminSession()

  // Non autorisé (ni session admin, ni cookie admin) → connexion admin en un clic
  if (!isAdmin) {
    redirect("/admin/login")
  }

  const overview = await getAdminOverview()

  return <AdminDashboard overview={overview} adminEmail={email ?? ""} />
}
