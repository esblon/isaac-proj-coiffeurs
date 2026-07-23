export function SectionHeading({
  title,
  subtitle,
  centered,
}: {
  title: string
  subtitle?: string
  centered?: boolean
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 hidden text-muted-foreground sm:block ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
