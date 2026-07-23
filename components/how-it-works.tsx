import { SectionHeading } from "@/components/section-heading"

const steps = [
  {
    title: "Choisissez votre barbier",
    text: "Parcourez les profils, les avis et les spécialités près de chez vous.",
  },
  {
    title: "Sélectionnez un créneau",
    text: "Trouvez un horaire qui vous convient et réservez instantanément.",
  },
  {
    title: "Profitez & payez",
    text: "Rendez-vous au salon ou à domicile, payez en espèces ou mobile money.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-card/40">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24">
        <SectionHeading
          title="Comment ça marche"
          subtitle="Réservez votre coupe en trois étapes simples."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-background p-6"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary font-heading text-xl font-bold text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
