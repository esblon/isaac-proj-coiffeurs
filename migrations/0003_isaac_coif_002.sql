ALTER TABLE "partners"
  ADD COLUMN "sector" text;

CREATE TABLE "partner_availabilities" (
  "id" serial PRIMARY KEY,
  "partner_id" integer NOT NULL REFERENCES "partners"("id") ON DELETE CASCADE,
  "starts_at" timestamptz NOT NULL,
  "ends_at" timestamptz NOT NULL,
  "status" text NOT NULL DEFAULT 'disponible',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "partner_availabilities_valid_range" CHECK ("ends_at" > "starts_at"),
  CONSTRAINT "partner_availabilities_status_check"
    CHECK ("status" IN ('disponible', 'reserve', 'indisponible'))
);

CREATE UNIQUE INDEX "partner_availabilities_slot_unique"
  ON "partner_availabilities" ("partner_id", "starts_at", "ends_at");

CREATE INDEX "partner_availabilities_search_idx"
  ON "partner_availabilities" ("status", "starts_at", "partner_id");
