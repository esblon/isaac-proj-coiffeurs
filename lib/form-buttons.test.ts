import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const formComponents = [
  "components/admin-dashboard.tsx",
  "components/availability-browser.tsx",
  "components/partner-schedule.tsx",
  "components/partner-invitation-form.tsx",
]

describe("boutons des formulaires interactifs", () => {
  it.each(formComponents)("%s déclare explicitement le type de chaque Button", (file) => {
    const source = readFileSync(resolve(process.cwd(), file), "utf8")
    const forms = source.match(/<form\b[\s\S]*?<\/form>/g) ?? []

    for (const form of forms) {
      const buttons = form.match(/<Button\b[^>]*>/g) ?? []
      for (const button of buttons) {
        expect(button, `${file}: ${button}`).toMatch(/\btype="(?:submit|button)"/)
      }
    }
  })
})
