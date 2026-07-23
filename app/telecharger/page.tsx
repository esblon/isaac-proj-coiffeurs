import type { Metadata } from "next"
import { InstallGuide } from "@/components/install-guide"

export const metadata: Metadata = {
  title: "Installer l'application — Coiffeurs225",
  description:
    "Installez l'application Coiffeurs225 sur iOS et Android pour réserver vos coiffeurs à domicile, commander votre kit et gérer votre abonnement.",
}

export default function TelechargerPage() {
  return <InstallGuide />
}
