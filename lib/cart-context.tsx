"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type CartItemType = "produit" | "abonnement" | "reservation"

export type CartItem = {
  id: string
  name: string
  detail?: string
  price: number
  qty: number
  type: CartItemType
  image?: string
  recurring?: boolean
}

export type Order = {
  reference: string
  date: string
  items: CartItem[]
  total: number
  customer: { name: string; phone: string; payment: string }
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  count: number
  total: number
  lastOrder: Order | null
  recentlyAdded: string | null
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  checkout: (customer: Order["customer"]) => Order
  dismissRecentlyAdded: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "coiffeurs225-cart"

/** Convertit "24 000 FCFA" -> 24000 */
export function parsePrice(price: string): number {
  return Number.parseInt(price.replace(/[^\d]/g, ""), 10) || 0
}

/** Formate un nombre en "24 000 FCFA" */
export function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null)

  // Restaure le panier depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  // Persiste le panier
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items, hydrated])

  const addItem = useCallback<CartContextValue["addItem"]>((item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + qty } : i,
        )
      }
      return [...prev, { ...item, qty }]
    })
    // Affiche le choix « Aller au panier / Continuer mes achats »
    setRecentlyAdded(item.name)
  }, [])

  const dismissRecentlyAdded = useCallback(() => setRecentlyAdded(null), [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  )

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  )

  const checkout = useCallback<CartContextValue["checkout"]>(
    (customer) => {
      const order: Order = {
        reference: `C225-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        items,
        total,
        customer,
      }
      setLastOrder(order)
      setItems([])
      return order
    },
    [items, total],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      count,
      total,
      lastOrder,
      recentlyAdded,
      openCart: () => {
        setRecentlyAdded(null)
        setIsOpen(true)
      },
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      setQty,
      clear,
      checkout,
      dismissRecentlyAdded,
    }),
    [items, isOpen, count, total, lastOrder, recentlyAdded, addItem, removeItem, setQty, clear, checkout, dismissRecentlyAdded],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider")
  return ctx
}
