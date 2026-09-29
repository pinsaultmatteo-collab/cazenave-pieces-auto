ALTER TABLE "parts" ADD COLUMN "phase_name" text;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "year_from" integer;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "year_to" integer;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "doors" integer;--> statement-breakpoint
CREATE INDEX "parts_model_idx" ON "parts" USING btree ("model_id");