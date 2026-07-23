"use client"

import { useEffect, useRef, useState } from "react"
import { Users, CalendarCheck, Star, MapPin } from "lucide-react"

type Stat = {
  /** Valeur cible numérique pour l'animation. */
  target: number
  /** Décimales à afficher (note moyenne). */
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
  icon: typeof Users
}

const stats: Stat[] = [
  {
    target: 500,
    suffix: "+",
    label: "Barbiers vérifiés",
    icon: Users,
  },
  {
    target: 12,
    suffix: "k+",
    label: "Réservations",
    icon: CalendarCheck,
  },
  {
    target: 4.8,
    decimals: 1,
    suffix: "/5",
    label: "Note moyenne",
    icon: Star,
  },
  {
    target: 8,
    label: "Quartiers couverts",
    icon: MapPin,
  },
]

function useCountUp(target: number, decimals: number, run: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!run) return
    let raf = 0
    const duration = 1600
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // easing easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
      else setValue(target)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run])

  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const display = useCountUp(stat.target, stat.decimals ?? 0, run)
  const Icon = stat.icon
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-2 size-6 text-primary" />
      <p className="font-heading text-3xl font-bold text-primary sm:text-4xl tabular-nums">
        {stat.prefix}
        {display}
        {stat.suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
    </div>
  )
}

export function Stats() {
  const [run, setRun] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRun(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="border-y border-border bg-card/40">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8"
      >
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} run={run} />
        ))}
      </div>
    </section>
  )
}
