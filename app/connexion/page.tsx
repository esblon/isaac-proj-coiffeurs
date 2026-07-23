import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AuthForm } from "@/components/auth-form"

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const { redirect: redirectTo } = await searchParams
  if (session?.user) redirect(redirectTo || "/")

  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  )
}
