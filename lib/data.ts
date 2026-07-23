// Zones de service disponibles + tarif uniforme par zone (déplacement inclus).
// Le tarif est identique pour tous les coiffeurs d'une même zone.
export const zonePrices = {
  Cocody: "7 000 FCFA",
  Riviera: "7 000 FCFA",
  Angré: "6 500 FCFA",
  "2 Plateaux": "6 500 FCFA",
  Bingerville: "8 000 FCFA",
  "Zone 4": "7 500 FCFA",
  Biétry: "7 500 FCFA",
  "Marcory résidentiel": "7 000 FCFA",
} as const

export type Zone = keyof typeof zonePrices

export const zones = Object.keys(zonePrices) as Zone[]

export function priceForZone(zone: Zone): string {
  return zonePrices[zone]
}

export type Barber = {
  name: string
  shop: string
  area: Zone
  rating: number
  reviews: number
  tags: string[]
  image: string
  top?: boolean
  /** Professionnel vérifié par Coiffeurs225 (pièce d'identité + domicile). */
  verified?: boolean
  /** Années d'expérience. */
  experience: number
  /** Nombre de coupes réalisées via la plateforme. */
  completed: number
}

export const barbers: Barber[] = [
  {
    name: "Rafik",
    shop: "Élite Cuts Abidjan",
    area: "Cocody",
    rating: 4.9,
    reviews: 312,
    tags: ["Dégradé", "Barbe", "Lignes"],
    image: "/images/barber-1.jpg",
    top: true,
    verified: true,
    experience: 9,
    completed: 1840,
  },
  {
    name: "Digbeu",
    shop: "Studio Style & Barbe",
    area: "Marcory résidentiel",
    rating: 4.8,
    reviews: 248,
    tags: ["Coupe homme", "Barbe", "Soins"],
    image: "/images/barber-2.jpg",
    top: true,
    verified: true,
    experience: 7,
    completed: 1320,
  },
  {
    name: "Kouassi",
    shop: "Le Salon du Plateau",
    area: "2 Plateaux",
    rating: 4.7,
    reviews: 189,
    tags: ["Coupe classique", "Rasage", "Barbe"],
    image: "/images/barber-3.jpg",
    verified: true,
    experience: 5,
    completed: 760,
  },
  {
    name: "Medhy",
    shop: "Fresh Look Barbershop",
    area: "Riviera",
    rating: 4.9,
    reviews: 276,
    tags: ["Twists", "Dégradé", "Coloration"],
    image: "/images/barber-4.jpg",
    top: true,
    verified: true,
    experience: 8,
    completed: 1510,
  },
  {
    name: "Abou",
    shop: "Naturelle Coiffure",
    area: "Angré",
    rating: 4.6,
    reviews: 154,
    tags: ["Cheveux naturels", "Soins", "Locks"],
    image: "/images/barber-5.jpg",
    verified: true,
    experience: 6,
    completed: 920,
  },
  {
    name: "Abdul Karim",
    shop: "King's Cut Studio",
    area: "Zone 4",
    rating: 4.8,
    reviews: 203,
    tags: ["High top", "Dégradé", "Barbe"],
    image: "/images/barber-6.jpg",
    verified: true,
    experience: 7,
    completed: 1180,
  },
]

export type Service = {
  name: string
  duration: number
  price: string
}

export const services: Service[] = [
  { name: "Dégradé / Fade", duration: 40, price: "7 000 FCFA" },
  { name: "Coupe classique", duration: 30, price: "5 500 FCFA" },
  { name: "Taille de barbe", duration: 20, price: "4 000 FCFA" },
  { name: "Tresses & nattes", duration: 90, price: "10 000 FCFA" },
  { name: "Coupe enfant", duration: 25, price: "5 000 FCFA" },
  { name: "Coupe + barbe (combo)", duration: 55, price: "9 000 FCFA" },
]

export type Testimonial = {
  name: string
  role: string
  area: Zone | string
  quote: string
  rating: number
  image: string
  /** Durée du témoignage filmé (mm:ss). */
  duration: string
}

export const testimonials: Testimonial[] = [
  {
    name: "Yann K.",
    role: "Client depuis 1 an",
    area: "Cocody",
    quote:
      "Le coiffeur est venu chez moi en 30 minutes, dégradé parfait. Je ne retournerai plus jamais faire la queue au salon.",
    rating: 5,
    image: "/images/client-1.png",
    duration: "0:42",
  },
  {
    name: "Aïcha D.",
    role: "Cliente fidèle",
    area: "Riviera",
    quote:
      "Mes tresses ont tenu des semaines et la coiffeuse était super pro. Réservation hyper simple via l'app.",
    rating: 5,
    image: "/images/client-2.png",
    duration: "1:05",
  },
  {
    name: "Serge B.",
    role: "Client régulier",
    area: "Zone 4",
    quote:
      "Prix transparent, déplacement inclus, et le résultat est toujours au top. Coiffeurs225 a changé ma routine.",
    rating: 5,
    image: "/images/client-3.png",
    duration: "0:53",
  },
]

export type Product = {
  name: string
  description: string
  price: string
  image: string
}

export const kitProducts: Product[] = [
  {
    name: "Tondeuse Pro 225",
    description:
      "Tondeuse professionnelle sans fil, lames en acier inoxydable, 5 sabots de précision.",
    price: "18 000 FCFA",
    image: "/images/produit-tondeuse.png",
  },
  {
    name: "Brosse à cheveux",
    description:
      "Brosse en bois véritable, picots renforcés pour démêler et faire briller.",
    price: "4 500 FCFA",
    image: "/images/produit-brosse.png",
  },
  {
    name: "Shampoing fortifiant",
    description:
      "Shampoing homme enrichi en kératine, idéal pour cheveux et barbe au quotidien.",
    price: "5 000 FCFA",
    image: "/images/produit-shampoing.png",
  },
  {
    name: "After-shave apaisant",
    description:
      "Lotion après-rasage apaisante, referme les pores et laisse un parfum frais longue tenue.",
    price: "6 000 FCFA",
    image: "/images/produit-aftershave.png",
  },
  {
    name: "Sporting Wave",
    description:
      "Brosse à vagues (360 waves) en bois, poils naturels pour dessiner et entretenir les vagues.",
    price: "5 500 FCFA",
    image: "/images/produit-sporting-wave.png",
  },
]
