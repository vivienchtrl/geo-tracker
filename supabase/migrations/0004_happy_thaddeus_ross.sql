ALTER TABLE "ai_search_performance" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "ai_search_performance" CASCADE;--> statement-breakpoint
DROP INDEX "traffic_project_date_source_unique";--> statement-breakpoint
ALTER TABLE "traffic_sources" ADD COLUMN "medium" text;--> statement-breakpoint
CREATE UNIQUE INDEX "traffic_project_date_source_unique" ON "traffic_sources" USING btree ("project_id","date","source","medium");--> statement-breakpoint
ALTER TABLE "traffic_sources" DROP COLUMN "category";--> statement-breakpoint
DROP TYPE "public"."traffic_category";