CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"email" text NOT NULL,
	"customer" jsonb NOT NULL,
	"billing" jsonb NOT NULL,
	"delivery" jsonb,
	"delivery_mode" text DEFAULT 'pickup' NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subtotal_ttc" numeric(10, 2) NOT NULL,
	"shipping_ttc" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_ttc" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'eur' NOT NULL,
	"note" text,
	"payment_provider" text DEFAULT 'stripe' NOT NULL,
	"payment_session_id" text,
	"payment_intent_id" text,
	"paid_at" timestamp with time zone,
	"opisto_client_id" integer,
	"opisto_order_id" integer,
	"opisto_payment_id" integer,
	"opisto_error" text,
	"customer_email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "orders_ref_idx" ON "orders" USING btree ("ref");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_session_idx" ON "orders" USING btree ("payment_session_id");