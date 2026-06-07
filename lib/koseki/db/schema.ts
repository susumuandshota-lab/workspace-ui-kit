import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    heldOn: date("held_on").notNull(),
    theme: text("theme").notNull(),
    folderSlug: text("folder_slug").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("meetings_slug_idx").on(table.slug),
    index("meetings_held_on_idx").on(table.heldOn),
    index("meetings_status_idx").on(table.status),
  ]
);

export const meetingSections = pgTable(
  "meeting_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    sectionType: text("section_type").notNull(),
    body: text("body").notNull().default(""),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    uniqueIndex("meeting_sections_meeting_type_idx").on(
      table.meetingId,
      table.sectionType
    ),
  ]
);

export const meetingMaterials = pgTable(
  "meeting_materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [index("meeting_materials_meeting_idx").on(table.meetingId)]
);

export type DbMeeting = typeof meetings.$inferSelect;
export type DbMeetingSection = typeof meetingSections.$inferSelect;
export type DbMeetingMaterial = typeof meetingMaterials.$inferSelect;
