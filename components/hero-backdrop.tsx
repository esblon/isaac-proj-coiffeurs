"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const frames = [
  {
    src: "/images/hero.png",
    alt: "Barbier réalisant un dégradé sur un client dans un salon à Abidjan",
  },
  {
    src: "/images/hero-2.png",
    alt: "Gros plan sur une tondeuse réalisant un fade précis",
  },
  {
    src: "/images/hero-3.png",
    alt: "Client souriant découvrant sa nouvelle coupe dans le miroir",
  },
]

export function HeroBackdrop() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % frames.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="absolute inset-0">
      {frames.map((frame, index) => (
        <div
          key={frame.src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: index === active ? 1 : 0 }}
        >
          <Image
            src={frame.src || "/placeholder.svg"}
            alt={frame.alt}
            fill
            priority={index === 0}
            className={`object-cover object-right ${
              index === active ? "animate-kenburns" : ""
            }`}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}
