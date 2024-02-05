DO $$ BEGIN
 CREATE TYPE "action" AS ENUM('create', 'delete', 'update');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "entity_type" AS ENUM('board', 'card', 'list');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_title" varchar(256) NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"action" "action" NOT NULL,
	"user_id" text NOT NULL,
	"user_image" text,
	"user_name" varchar(256),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
