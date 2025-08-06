import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "app_configuration" (
  	"id" text PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone NOT NULL,
  	"name" text NOT NULL,
  	"theme" text,
  	"auth_required_email_verification" boolean DEFAULT false NOT NULL,
  	"auth_require_organization" boolean DEFAULT true NOT NULL,
  	"auth_require_name" boolean DEFAULT true NOT NULL,
  	"analytics_simple_analytics" boolean DEFAULT false NOT NULL,
  	"analytics_plausible_analytics" boolean DEFAULT false NOT NULL,
  	"analytics_google_analytics_tracking_id" text,
  	"subscription_required" boolean DEFAULT true NOT NULL,
  	"subscription_allow_subscribe_before_sign_up" boolean DEFAULT true NOT NULL,
  	"subscription_allow_sign_up_before_subscribe" boolean DEFAULT true NOT NULL,
  	"branding_logo" text,
  	"branding_logo_dark_mode" text,
  	"branding_icon" text,
  	"branding_icon_dark_mode" text,
  	"branding_favicon" text,
  	"head_scripts" text,
  	"body_scripts" text
  );
  
  CREATE TABLE "checkout_session_status" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"updated_at" timestamp(3) with time zone NOT NULL,
  	"pending" boolean DEFAULT true NOT NULL,
  	"email" text NOT NULL,
  	"from_url" text NOT NULL,
  	"from_user_id" text,
  	"from_tenant_id" text,
  	"created_user_id" text,
  	"created_tenant_id" text
  );
  
  CREATE TABLE "credit" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp (3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"tenant_id" text NOT NULL,
  	"user_id" text,
  	"amount" integer NOT NULL,
  	"type" text NOT NULL,
  	"object_id" text
  );
  
  CREATE TABLE "permission" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"updated_at" timestamp(3) with time zone NOT NULL,
  	"name" text NOT NULL,
  	"description" text NOT NULL,
  	"type" text NOT NULL,
  	"is_default" boolean NOT NULL,
  	"order" integer NOT NULL
  );
  
  CREATE TABLE "role" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"updated_at" timestamp(3) with time zone NOT NULL,
  	"name" text NOT NULL,
  	"description" text NOT NULL,
  	"type" text NOT NULL,
  	"assign_to_new_users" boolean NOT NULL,
  	"is_default" boolean NOT NULL,
  	"order" integer NOT NULL
  );
  
  CREATE TABLE "role_permission" (
  	"id" text PRIMARY KEY NOT NULL,
  	"role_id" text NOT NULL,
  	"permission_id" text NOT NULL
  );
  
  CREATE TABLE "subscription_feature" (
  	"id" text PRIMARY KEY NOT NULL,
  	"subscription_product_id" text NOT NULL,
  	"order" integer NOT NULL,
  	"title" text NOT NULL,
  	"name" text NOT NULL,
  	"type" integer NOT NULL,
  	"value" integer NOT NULL,
  	"href" text,
  	"badge" text,
  	"accumulate" boolean DEFAULT false NOT NULL
  );
  
  CREATE TABLE "subscription_price" (
  	"id" text PRIMARY KEY NOT NULL,
  	"subscription_product_id" text NOT NULL,
  	"stripe_id" text NOT NULL,
  	"type" integer NOT NULL,
  	"billing_period" integer NOT NULL,
  	"price" double precision NOT NULL,
  	"currency" text NOT NULL,
  	"trial_days" integer NOT NULL,
  	"active" boolean NOT NULL
  );
  
  CREATE TABLE "subscription_product" (
  	"id" text PRIMARY KEY NOT NULL,
  	"stripe_id" text NOT NULL,
  	"order" integer NOT NULL,
  	"title" text NOT NULL,
  	"active" boolean NOT NULL,
  	"model" integer NOT NULL,
  	"public" boolean NOT NULL,
  	"group_title" text,
  	"group_description" text,
  	"description" text,
  	"badge" text,
  	"billing_address_collection" text DEFAULT 'auto' NOT NULL,
  	"has_quantity" boolean DEFAULT false NOT NULL,
  	"can_buy_again" boolean DEFAULT false NOT NULL
  );
  
  CREATE TABLE "subscription_usage_based_price" (
  	"id" text PRIMARY KEY NOT NULL,
  	"subscription_product_id" text NOT NULL,
  	"stripe_id" text NOT NULL,
  	"billing_period" integer NOT NULL,
  	"currency" text NOT NULL,
  	"unit" text NOT NULL,
  	"unit_title" text NOT NULL,
  	"unit_title_plural" text NOT NULL,
  	"usage_type" text NOT NULL,
  	"aggregate_usage" text NOT NULL,
  	"tiers_mode" text NOT NULL,
  	"billing_scheme" text NOT NULL
  );
  
  CREATE TABLE "subscription_usage_based_tier" (
  	"id" text PRIMARY KEY NOT NULL,
  	"subscription_usage_based_price_id" text NOT NULL,
  	"from" integer NOT NULL,
  	"to" integer,
  	"perUnitPrice" double precision,
  	"flatFeePrice" double precision
  );
  
  CREATE TABLE "tenant" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"updated_at" timestamp(3) with time zone NOT NULL,
  	"slug" text NOT NULL,
  	"name" text NOT NULL,
  	"icon" text,
  	"subscription_id" text,
  	"active" boolean DEFAULT false NOT NULL
  );
  
  CREATE TABLE "tenant_subscription" (
  	"id" text PRIMARY KEY NOT NULL,
  	"tenant_id" text NOT NULL,
  	"stripe_customer_id" text
  );
  
  CREATE TABLE "tenant_subscription_product" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"tenant_subscription_id" text NOT NULL,
  	"subscription_product_id" text NOT NULL,
  	"cancelled_at" timestamp(3),
  	"ends_at" timestamp(3),
  	"stripe_subscription_id" text,
  	"quantity" integer,
  	"from_checkout_session_id" text,
  	"current_period_start" timestamp(3),
  	"current_period_end" timestamp(3)
  );
  
  CREATE TABLE "tenant_subscription_product_price" (
  	"id" text PRIMARY KEY NOT NULL,
  	"tenant_subscription_product_id" text NOT NULL,
  	"subscription_price_id" text,
  	"subscription_usage_based_price_id" text
  );
  
  CREATE TABLE "tenant_subscription_usage_record" (
  	"id" text PRIMARY KEY NOT NULL,
  	"tenant_subscription_product_price_id" text NOT NULL,
  	"timestamp" integer NOT NULL,
  	"quantity" integer NOT NULL,
  	"stripe_subscription_item_id" text
  );
  
  CREATE TABLE "tenant_user" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"tenant_id" text NOT NULL,
  	"user_id" text NOT NULL
  );
  
  CREATE TABLE "tenant_user_invitation" (
  	"id" text PRIMARY KEY NOT NULL,
  	"tenant_id" text NOT NULL,
  	"email" text NOT NULL,
  	"first_name" text NOT NULL,
  	"last_name" text NOT NULL,
  	"pending" boolean NOT NULL,
  	"created_user_id" text,
  	"from_user_id" text
  );
  
  CREATE TABLE "user" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"updated_at" timestamp(3) with time zone NOT NULL,
  	"email" text NOT NULL,
  	"hash" text NOT NULL,
  	"first_name" text NOT NULL,
  	"last_name" text NOT NULL,
  	"avatar" text,
  	"phone" text,
  	"default_tenant_id" text,
  	"verify_token" text,
  	"locale" text,
  	"active" boolean DEFAULT false NOT NULL,
  	"admin" boolean DEFAULT false NOT NULL
  );
  
  CREATE TABLE "user_registration_attempt" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"email" text NOT NULL,
  	"first_name" text NOT NULL,
  	"last_name" text NOT NULL,
  	"slug" text,
  	"token" text NOT NULL,
  	"ip_address" text,
  	"company" text,
  	"created_tenant_id" text
  );
  
  CREATE TABLE "user_role" (
  	"id" text PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  	"user_id" text NOT NULL,
  	"role_id" text NOT NULL,
  	"tenant_id" text
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"phone" varchar,
  	"avatar_url" varchar,
  	"locale" varchar,
  	"default_tenant_id" varchar,
  	"verify_token" varchar,
  	"active" boolean DEFAULT false,
  	"admin" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "credit" ADD CONSTRAINT "credit_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "credit" ADD CONSTRAINT "credit_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;
  ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "subscription_feature" ADD CONSTRAINT "subscription_feature_subscription_product_id_fk" FOREIGN KEY ("subscription_product_id") REFERENCES "public"."subscription_product"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "subscription_price" ADD CONSTRAINT "subscription_price_subscription_product_id_fk" FOREIGN KEY ("subscription_product_id") REFERENCES "public"."subscription_product"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "subscription_usage_based_price" ADD CONSTRAINT "subscription_usage_based_price_subscription_product_id_fk" FOREIGN KEY ("subscription_product_id") REFERENCES "public"."subscription_product"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "subscription_usage_based_tier" ADD CONSTRAINT "subscription_usage_based_tier_subscription_usage_based_price_id_fk" FOREIGN KEY ("subscription_usage_based_price_id") REFERENCES "public"."subscription_usage_based_price"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "tenant_subscription" ADD CONSTRAINT "tenant_subscription_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "tenant_subscription_product" ADD CONSTRAINT "tenant_subscription_product_tenant_subscription_id_fk" FOREIGN KEY ("tenant_subscription_id") REFERENCES "public"."tenant_subscription"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "tenant_subscription_product" ADD CONSTRAINT "tenant_subscription_product_subscription_product_id_fk" FOREIGN KEY ("subscription_product_id") REFERENCES "public"."subscription_product"("id") ON DELETE restrict ON UPDATE cascade;
  ALTER TABLE "tenant_subscription_product_price" ADD CONSTRAINT "tenant_subscription_product_price_tenant_subscription_product_id_fk" FOREIGN KEY ("tenant_subscription_product_id") REFERENCES "public"."tenant_subscription_product"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "tenant_subscription_product_price" ADD CONSTRAINT "tenant_subscription_product_price_subscription_price_id_fk" FOREIGN KEY ("subscription_price_id") REFERENCES "public"."subscription_price"("id") ON DELETE set null ON UPDATE cascade;
  ALTER TABLE "tenant_subscription_product_price" ADD CONSTRAINT "tenant_subscription_product_price_subscription_usage_based_price_fk" FOREIGN KEY ("subscription_usage_based_price_id") REFERENCES "public"."subscription_usage_based_price"("id") ON DELETE set null ON UPDATE cascade;
  ALTER TABLE "tenant_subscription_usage_record" ADD CONSTRAINT "tenant_subscription_usage_record_tenant_subscription_product_price_fk" FOREIGN KEY ("tenant_subscription_product_price_id") REFERENCES "public"."tenant_subscription_product_price"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "tenant_user" ADD CONSTRAINT "tenant_user_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "tenant_user" ADD CONSTRAINT "tenant_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "tenant_user_invitation" ADD CONSTRAINT "tenant_user_invitation_from_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;
  ALTER TABLE "tenant_user_invitation" ADD CONSTRAINT "tenant_user_invitation_created_user_id_fk" FOREIGN KEY ("created_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;
  ALTER TABLE "tenant_user_invitation" ADD CONSTRAINT "tenant_user_invitation_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "user_registration_attempt" ADD CONSTRAINT "user_registration_attempt_created_tenant_id_fk" FOREIGN KEY ("created_tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "user_role" ADD CONSTRAINT "user_role_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "checkout_session_status_id_key" ON "checkout_session_status" USING btree ("id" text_ops);
  CREATE INDEX "credit_tenant_id_created_at_idx" ON "credit" USING btree ("tenant_id" text_ops,"created_at" timestamptz_ops);
  CREATE INDEX "credit_tenant_id_user_id_idx" ON "credit" USING btree ("tenant_id" text_ops,"user_id" text_ops);
  CREATE UNIQUE INDEX "permission_name_key" ON "permission" USING btree ("name" text_ops);
  CREATE UNIQUE INDEX "role_name_key" ON "role" USING btree ("name" text_ops);
  CREATE INDEX "tenant_slug_idx" ON "tenant" USING btree ("slug" text_ops);
  CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant" USING btree ("slug" text_ops);
  CREATE UNIQUE INDEX "tenant_subscription_tenant_id_key" ON "tenant_subscription" USING btree ("tenant_id" text_ops);
  CREATE UNIQUE INDEX "tenant_user_tenant_id_user_id_key" ON "tenant_user" USING btree ("tenant_id" text_ops,"user_id" text_ops);
  CREATE UNIQUE INDEX "tenant_user_invitation_created_user_id_key" ON "tenant_user_invitation" USING btree ("created_user_id" text_ops);
  CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email" text_ops);
  CREATE UNIQUE INDEX "user_registration_attempt_created_tenant_id_key" ON "user_registration_attempt" USING btree ("created_tenant_id" text_ops);
  CREATE UNIQUE INDEX "user_registration_attempt_email_key" ON "user_registration_attempt" USING btree ("email" text_ops);
  CREATE UNIQUE INDEX "user_registration_attempt_token_key" ON "user_registration_attempt" USING btree ("token" text_ops);
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "app_configuration" CASCADE;
  DROP TABLE "checkout_session_status" CASCADE;
  DROP TABLE "credit" CASCADE;
  DROP TABLE "permission" CASCADE;
  DROP TABLE "role" CASCADE;
  DROP TABLE "role_permission" CASCADE;
  DROP TABLE "subscription_feature" CASCADE;
  DROP TABLE "subscription_price" CASCADE;
  DROP TABLE "subscription_product" CASCADE;
  DROP TABLE "subscription_usage_based_price" CASCADE;
  DROP TABLE "subscription_usage_based_tier" CASCADE;
  DROP TABLE "tenant" CASCADE;
  DROP TABLE "tenant_subscription" CASCADE;
  DROP TABLE "tenant_subscription_product" CASCADE;
  DROP TABLE "tenant_subscription_product_price" CASCADE;
  DROP TABLE "tenant_subscription_usage_record" CASCADE;
  DROP TABLE "tenant_user" CASCADE;
  DROP TABLE "tenant_user_invitation" CASCADE;
  DROP TABLE "user" CASCADE;
  DROP TABLE "user_registration_attempt" CASCADE;
  DROP TABLE "user_role" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;`)
}
