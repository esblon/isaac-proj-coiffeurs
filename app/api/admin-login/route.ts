import { NextResponse } from "next/server"
import {
  ADMIN_COOKIE_NAME,
  buildAdminCookieValue,
  isValidAdminToken,
} from "@/lib/admin"

const MAX_AGE = 60 * 60 * 24 * 30 // 30 jours

export async function GET(request: Request) {
  const url = new URL(request.url)

  // Déconnexion admin : ?logout=1
  if (url.searchParams.get("logout")) {
    const res = NextResponse.redirect(new URL("/admin/login", url.origin))
    res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 })
    return res
  }

  const email = url.searchParams.get("as")
  const token = url.searchParams.get("k")

  if (!isValidAdminToken(email, token)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", url.origin))
  }

  const res = NextResponse.redirect(new URL("/admin", url.origin))
  res.cookies.set(ADMIN_COOKIE_NAME, buildAdminCookieValue(email as string), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: MAX_AGE,
  })
  return res
}
