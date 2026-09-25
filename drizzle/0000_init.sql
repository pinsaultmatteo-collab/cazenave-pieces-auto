CREATE TABLE "brands" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"vehicle_type" integer,
	"can_be_sold" boolean DEFAULT true NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opisto_tokens" (
	"env" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" integer PRIMARY KEY NOT NULL,
	"casse_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category_id" integer,
	"category_name" text,
	"sub_category_id" integer,
	"sub_category_name" text,
	"condition" integer DEFAULT 0 NOT NULL,
	"manufacturer_reference" text,
	"adaptable_reference" text,
	"manufacturer_price" numeric(10, 2),
	"price_ht" numeric(10, 4) NOT NULL,
	"vat_rate" numeric(5, 2) NOT NULL,
	"price_ttc" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"warranty_months" integer DEFAULT 0 NOT NULL,
	"weight" numeric(8, 2),
	"shipping_available" boolean DEFAULT false NOT NULL,
	"shipping_id" integer,
	"shipping_cost" numeric(8, 2),
	"shipping_cost_ht" numeric(8, 2),
	"shipping_delay_min" integer,
	"shipping_delay_max" integer,
	"shippings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photos_medium" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"vignette" text,
	"available" boolean DEFAULT true NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"for_sale" boolean DEFAULT true NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	"is_in_parc" boolean,
	"availability_status" integer,
	"can_be_purchased" boolean,
	"location_area_code" text,
	"location_city" text,
	"vehicle_id" integer,
	"brand_id" integer,
	"range_id" integer,
	"model_id" integer,
	"brand_name" text,
	"model_name" text,
	"version" text,
	"energy" text,
	"gearbox" text,
	"engine_code" text,
	"gearbox_code" text,
	"ktype" integer,
	"mileage" integer,
	"color" text,
	"year" integer,
	"first_registration" timestamp with time zone,
	"characteristics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"search_text" text DEFAULT '' NOT NULL,
	"opisto_created_at" timestamp with time zone,
	"opisto_updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ranges" (
	"id" integer PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" integer PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"can_be_sold" boolean DEFAULT true NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"mode" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"requests" integer DEFAULT 0 NOT NULL,
	"parts_upserted" integer DEFAULT 0 NOT NULL,
	"parts_deleted" integer DEFAULT 0 NOT NULL,
	"vehicles_upserted" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"error" text,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "sync_state" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" integer PRIMARY KEY NOT NULL,
	"casse_id" integer NOT NULL,
	"slug" text NOT NULL,
	"brand_id" integer,
	"range_id" integer,
	"model_id" integer,
	"identification_id" integer,
	"brand_name" text,
	"range_name" text,
	"model_name" text,
	"version" text,
	"energy" text,
	"gearbox" text,
	"engine_code" text,
	"gearbox_code" text,
	"power" integer,
	"displacement" integer,
	"ktype" integer,
	"cnit" text,
	"type_mine" text,
	"vin" text,
	"year" integer,
	"mileage" integer,
	"color" text,
	"first_registration" timestamp with time zone,
	"for_sale" boolean DEFAULT false NOT NULL,
	"status" text,
	"expert_price" numeric(10, 2),
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"vignette" text,
	"police_id" integer,
	"parts_count" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "parts_category_idx" ON "parts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "parts_sub_category_idx" ON "parts" USING btree ("sub_category_id");--> statement-breakpoint
CREATE INDEX "parts_brand_idx" ON "parts" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "parts_range_idx" ON "parts" USING btree ("range_id");--> statement-breakpoint
CREATE INDEX "parts_vehicle_idx" ON "parts" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "parts_created_idx" ON "parts" USING btree ("opisto_created_at");--> statement-breakpoint
CREATE INDEX "parts_available_idx" ON "parts" USING btree ("available","in_stock","for_sale","blocked","deleted_at");--> statement-breakpoint
CREATE INDEX "parts_ref_idx" ON "parts" USING btree ("manufacturer_reference");--> statement-breakpoint
CREATE INDEX "ranges_brand_slug_idx" ON "ranges" USING btree ("brand_id","slug");--> statement-breakpoint
CREATE INDEX "ranges_brand_idx" ON "ranges" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "subcategories_slug_idx" ON "subcategories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "subcategories_category_idx" ON "subcategories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "vehicles_brand_idx" ON "vehicles" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "vehicles_for_sale_idx" ON "vehicles" USING btree ("for_sale");