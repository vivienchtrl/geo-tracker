CREATE TYPE "public"."traffic_category" AS ENUM('social', 'ai', 'search', 'direct', 'referral', 'email', 'other');--> statement-breakpoint
CREATE TABLE "analytics_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"date" date NOT NULL,
	"sessions" integer DEFAULT 0,
	"total_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"new_users" integer DEFAULT 0,
	"screen_page_views" integer DEFAULT 0,
	"engagement_rate" double precision DEFAULT 0,
	"average_session_duration" double precision DEFAULT 0,
	"bounce_rate" double precision DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "search_console_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"date" date NOT NULL,
	"clicks" integer DEFAULT 0,
	"impressions" integer DEFAULT 0,
	"ctr" double precision DEFAULT 0,
	"position" double precision DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_search_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"date" date NOT NULL,
	"source" text NOT NULL,
	"mentions" integer DEFAULT 0,
	"referral_traffic" integer DEFAULT 0,
	"sentiment_score" double precision,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_crawler_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"date" date NOT NULL,
	"bot_name" text NOT NULL,
	"user_agent" text,
	"requests_count" integer DEFAULT 0,
	"blocked_requests" integer DEFAULT 0,
	"avg_response_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "traffic_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"date" date NOT NULL,
	"source" text NOT NULL,
	"category" "traffic_category" NOT NULL,
	"visits" integer DEFAULT 0,
	"visitors" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "acquisition_source" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "acquisition_medium" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "acquisition_campaign" text;--> statement-breakpoint
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_console_metrics" ADD CONSTRAINT "search_console_metrics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_search_performance" ADD CONSTRAINT "ai_search_performance_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_crawler_logs" ADD CONSTRAINT "ai_crawler_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_sources" ADD CONSTRAINT "traffic_sources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "analytics_project_date_unique" ON "analytics_metrics" USING btree ("project_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "search_console_project_date_unique" ON "search_console_metrics" USING btree ("project_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_perf_project_date_source_unique" ON "ai_search_performance" USING btree ("project_id","date","source");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_crawl_project_date_bot_unique" ON "ai_crawler_logs" USING btree ("project_id","date","bot_name");--> statement-breakpoint
CREATE UNIQUE INDEX "traffic_project_date_source_unique" ON "traffic_sources" USING btree ("project_id","date","source");