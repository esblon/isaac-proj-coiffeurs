import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AuthForm } from "@/components/auth-form"

export default async function InscriptionPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/")

  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  )
}
