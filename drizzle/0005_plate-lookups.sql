CREATE TABLE "plate_lookups" (
	"plate" text PRIMARY KEY NOT NULL,
	"found" boolean NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "parts_ktype_idx" ON "parts" USING btree ("ktype");