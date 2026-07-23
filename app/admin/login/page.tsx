import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin"

export const metadata = {
  title: "Connexion administrateur — Coiffeurs225",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  const { isAdmin } = await getAdminSession()
  if (isAdmin) redirect("/admin")
  redirect("/connexion?redirect=/admin")
}
