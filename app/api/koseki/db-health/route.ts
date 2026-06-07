import { NextResponse } from "next/server";

import { getDb, getDatabaseUrl, isDatabaseConfigured } from "@/lib/koseki/db/client";
import { meetings } from "@/lib/koseki/db/schema";
import { getKosekiDataSource } from "@/lib/koseki/meetings";

export async function GET() {
  const dataSource = getKosekiDataSource();
  const configured = isDatabaseConfigured();

  if (!configured) {
    return NextResponse.json({
      ok: true,
      dataSource,
      database: { configured: false },
    });
  }

  try {
    const db = getDb();
    const rows = await db.select({ slug: meetings.slug }).from(meetings).limit(1);
    return NextResponse.json({
      ok: true,
      dataSource,
      database: {
        configured: true,
        connected: true,
        host: maskDatabaseHost(getDatabaseUrl()),
        hasData: rows.length > 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        dataSource,
        database: {
          configured: true,
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

function maskDatabaseHost(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.host;
  } catch {
    return null;
  }
}
