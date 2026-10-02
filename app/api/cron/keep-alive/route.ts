import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Max allowable duration on Vercel Hobby

/**
 * GET /api/cron/keep-alive
 *
 * Daily Cron job to keep Supabase PostgreSQL active and prevent
 * free-tier inactivity pausing (Supabase pauses after 7 days without traffic).
 *
 * Configured in vercel.json to run once every 24 hours at 2:00 AM IST (20:30 UTC).
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verify Vercel Cron Authorization if CRON_SECRET is configured
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("⚠️ [Cron Keep-Alive] Unauthorized attempt to invoke cron endpoint.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();

    // 2. Perform database keep-alive queries
    // Both raw query and Prisma count to ensure full connection pool and schema health
    const [rawPing, carCount, leadCount] = await Promise.all([
      prisma.$queryRaw<{ ping: number }[]>`SELECT 1 as ping;`,
      prisma.carListing.count(),
      prisma.sellerLead.count(),
    ]);

    const durationMs = Date.now() - startTime;

    console.log(
      `✅ [Supabase Keep-Alive Cron]: DB Ping Successful in ${durationMs}ms | Live Cars: ${carCount} | Seller Leads: ${leadCount}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Supabase PostgreSQL keep-alive ping successful. Inactivity pause prevented.",
        timestamp: new Date().toISOString(),
        durationMs,
        stats: {
          rawPing: rawPing?.[0]?.ping === 1 ? "OK" : "UNKNOWN",
          totalCars: carCount,
          totalLeads: leadCount,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("❌ [Supabase Keep-Alive Cron Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to ping Supabase database";
    return NextResponse.json(
      {
        success: false,
        error: msg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
