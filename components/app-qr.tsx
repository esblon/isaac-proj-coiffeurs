"use client"

import { QRCodeSVG } from "qrcode.react"
import { INSTALL_URL } from "@/lib/site"

export function AppQr({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="rounded-2xl border border-border bg-card/80 p-5 text-center shadow-xl backdrop-blur">
        <div className="mx-auto w-fit rounded-xl bg-white p-3">
          <QRCodeSVG
            value={INSTALL_URL}
            size={148}
            level="M"
            marginSize={0}
            bgColor="#ffffff"
            fgColor="#1a1714"
          />
        </div>
        <p className="mt-4 font-heading text-sm font-bold uppercase tracking-wide">
          Scannez pour installer
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Pointez l&apos;appareil photo de votre téléphone : l&apos;application
          Coiffeurs225 s&apos;installe sur iOS et Android.
        </p>
      </div>
    </div>
  )
}
