ALTER TABLE "orders"
  ADD COLUMN "admin_response" text,
  ADD COLUMN "assigned_partner_id" integer;

ALTER TABLE "partner_applications"
  ADD COLUMN "email" text,
  ADD COLUMN "admin_response" text,
  ADD COLUMN "reviewed_at" timestamptz,
  ADD COLUMN "reviewed_by" text;

CREATE TABLE "partners" (
  "id" serial PRIMARY KEY,
  "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "status" text NOT NULL DEFAULT 'invite',
  "invited_at" timestamptz,
  "activated_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "partners_email_unique" ON "partners" ("email");
CREATE UNIQUE INDEX "partners_user_id_unique" ON "partners" ("user_id");

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_assigned_partner_id_partners_id_fk"
  FOREIGN KEY ("assigned_partner_id") REFERENCES "partners"("id") ON DELETE SET NULL;

CREATE TABLE "partner_invitations" (
  "id" serial PRIMARY KEY,
  "partner_id" integer NOT NULL REFERENCES "partners"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "accepted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "partner_invitations_token_hash_unique"
  ON "partner_invitations" ("token_hash");

CREATE TABLE "partner_ledger" (
  "id" serial PRIMARY KEY,
  "partner_id" integer NOT NULL REFERENCES "partners"("id") ON DELETE CASCADE,
  "type" text NOT NULL DEFAULT 'historique',
  "description" text NOT NULL,
  "amount" integer NOT NULL DEFAULT 0,
  "created_by" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "contact_numbers" (
  "id" serial PRIMARY KEY,
  "label" text NOT NULL,
  "number" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_by" text,
  "updated_by" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

INSERT INTO "contact_numbers" ("label", "number", "is_active")
VALUES ('WhatsApp principal', '+225 05 74 68 84 58', true);

CREATE TABLE "admin_audit_events" (
  "id" serial PRIMARY KEY,
  "actor_email" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "action" text NOT NULL,
  "details" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "admin_audit_events_entity_idx"
  ON "admin_audit_events" ("entity_type", "entity_id", "created_at");

CREATE INDEX "partner_ledger_partner_idx"
  ON "partner_ledger" ("partner_id", "created_at");
