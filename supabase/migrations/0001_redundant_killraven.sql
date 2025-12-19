ALTER TABLE "projects" RENAME COLUMN "user_id" TO "owner_id";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "projects_user_unique";--> statement-breakpoint
ALTER TABLE "ai_search" ADD COLUMN "is_mentioned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "ai_search" ADD COLUMN "sentiment_score" integer;--> statement-breakpoint
ALTER TABLE "ai_search" ADD COLUMN "sentiment_label" text;--> statement-breakpoint
ALTER TABLE "ai_search" ADD COLUMN "rank" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "projects_owner_unique" ON "projects" USING btree ("owner_id");