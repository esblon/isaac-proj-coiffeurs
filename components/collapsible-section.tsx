"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

type CollapsibleSectionProps = {
  /** Ancre utilisée par le menu (ex: "barbers" pour #barbers) */
  anchorId: string
  title: string
  description?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  anchorId,
  title,
  description,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const sectionRef = useRef<HTMLElement>(null)

  // Ouvre la section et y défile quand son ancre est ciblée (clic dans le menu).
  useEffect(() => {
    function openIfTargeted() {
      if (window.location.hash === `#${anchorId}`) {
        setOpen(true)
        // Laisse le temps au contenu de s'afficher avant de défiler.
        requestAnimationFrame(() => {
          sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
      }
    }
    openIfTargeted()
    window.addEventListener("hashchange", openIfTargeted)
    return () => window.removeEventListener("hashchange", openIfTargeted)
  }, [anchorId])

  return (
    <section
      ref={sectionRef}
      id={anchorId}
      className="scroll-mt-20 border-b border-border"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${anchorId}-panel`}
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-6 text-left transition-colors hover:bg-card/40 sm:px-6 lg:px-8"
      >
        <span>
          <span className="block font-heading text-xl font-bold uppercase tracking-tight sm:text-2xl">
            {title}
          </span>
          {description && (
            <span className="mt-1 block text-sm text-muted-foreground">
              {description}
            </span>
          )}
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-primary">
          <ChevronDown
            className={`size-5 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <div id={`${anchorId}-panel`} className="animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </section>
  )
}
