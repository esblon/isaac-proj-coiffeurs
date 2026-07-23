"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  PHONE_DISPLAY,
  WHATSAPP_NUMBER,
  buildWhatsappLink,
} from "@/lib/site"

type Contact = { id: number; label: string; number: string }
type ContactContextValue = {
  contacts: Contact[]
  phoneDisplay: string
  whatsappNumber: string
  whatsappUrl: string
}

const fallback: ContactContextValue = {
  contacts: [],
  phoneDisplay: PHONE_DISPLAY,
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappUrl: buildWhatsappLink(WHATSAPP_NUMBER, "Bonjour Coiffeurs225"),
}

const ContactContext = createContext<ContactContextValue>(fallback)

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    fetch("/api/contacts", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data?.contacts)) setContacts(data.contacts)
      })
      .catch(() => undefined)
  }, [])

  const value = useMemo(() => {
    const primary = contacts[0]
    if (!primary) return fallback
    const whatsappNumber = primary.number.replace(/\D/g, "")
    return {
      contacts,
      phoneDisplay: primary.number,
      whatsappNumber,
      whatsappUrl: buildWhatsappLink(whatsappNumber, "Bonjour Coiffeurs225"),
    }
  }, [contacts])

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
}

export function useContact() {
  return useContext(ContactContext)
}
