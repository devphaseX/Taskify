CREATE TABLE IF NOT EXISTS "board" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
