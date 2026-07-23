CREATE TABLE "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE TABLE "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "orders" (
  "id" serial PRIMARY KEY,
  "reference" text NOT NULL,
  "customer_name" text NOT NULL,
  "customer_phone" text NOT NULL,
  "payment" text,
  "total" integer NOT NULL DEFAULT 0,
  "items" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "location_lat" double precision,
  "location_lng" double precision,
  "status" text NOT NULL DEFAULT 'nouveau',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "partner_applications" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "activity_type" text,
  "experience" text,
  "has_equipment" text,
  "zones" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "specialties" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "id_document_name" text,
  "home_lat" double precision,
  "home_lng" double precision,
  "message" text,
  "status" text NOT NULL DEFAULT 'nouveau',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "ad_requests" (
  "id" serial PRIMARY KEY,
  "package" text NOT NULL,
  "duration" text,
  "estimated_budget" text,
  "company" text NOT NULL,
  "contact" text NOT NULL,
  "phone" text NOT NULL,
  "email" text,
  "message" text,
  "status" text NOT NULL DEFAULT 'nouveau',
  "created_at" timestamptz NOT NULL DEFAULT now()
);
