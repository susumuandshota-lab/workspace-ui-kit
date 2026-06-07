CREATE TABLE IF NOT EXISTS "meetings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "held_on" date NOT NULL,
  "theme" text NOT NULL,
  "folder_slug" text NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "meetings_slug_idx" ON "meetings" ("slug");
CREATE INDEX IF NOT EXISTS "meetings_held_on_idx" ON "meetings" ("held_on");
CREATE INDEX IF NOT EXISTS "meetings_status_idx" ON "meetings" ("status");

CREATE TABLE IF NOT EXISTS "meeting_sections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "meeting_id" uuid NOT NULL,
  "section_type" text NOT NULL,
  "body" text DEFAULT '' NOT NULL,
  "sort_order" integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "meeting_sections_meeting_type_idx"
  ON "meeting_sections" ("meeting_id", "section_type");

CREATE TABLE IF NOT EXISTS "meeting_materials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "meeting_id" uuid NOT NULL,
  "label" text NOT NULL,
  "url" text NOT NULL,
  "sort_order" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "meeting_materials_meeting_idx"
  ON "meeting_materials" ("meeting_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meeting_sections_meeting_id_meetings_id_fk'
  ) THEN
    ALTER TABLE "meeting_sections"
      ADD CONSTRAINT "meeting_sections_meeting_id_meetings_id_fk"
      FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meeting_materials_meeting_id_meetings_id_fk'
  ) THEN
    ALTER TABLE "meeting_materials"
      ADD CONSTRAINT "meeting_materials_meeting_id_meetings_id_fk"
      FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
