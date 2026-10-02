CREATE TABLE "customer_accounts" (
	"email" text PRIMARY KEY NOT NULL,
	"opisto_client_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_pro" boolean DEFAULT false NOT NULL,
	"firstname" text,
	"company" text,
	"checked_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "account_email" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pro_discount_rate" numeric(4, 3);--> statement-breakpoint
CREATE INDEX "login_codes_email_idx" ON "login_codes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_account_idx" ON "orders" USING btree ("account_email");