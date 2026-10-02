import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Normalizes the database connection URL for Supabase connection pooling (PgBouncer).
 *
 * CRITICAL VERCEL / SUPABASE FIX:
 * When Next.js builds on Vercel or runs in serverless functions, multiple parallel
 * static generation workers query the database concurrently.
 * If connecting to Supabase PgBouncer pooler (port 6543) in transaction mode without `pgbouncer=true`,
 * PostgreSQL throws:
 * `ConnectorError(PostgresError { code: "42P05", message: "prepared statement \"s0\" already exists" })`
 *
 * Ensuring `pgbouncer=true` disables prepared statements in Prisma's query engine,
 * permanently resolving this issue.
 */
function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  try {
    const parsed = new URL(url.replace(/^postgres:/, "postgresql:"));
    if (!parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "5");
    }
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return url.includes("pgbouncer=true")
      ? url
      : `${url}${separator}pgbouncer=true&connection_limit=5`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Persist the singleton client instance across hot reloads and worker executions
globalForPrisma.prisma = prisma;

/**
 * PUBLIC_CAR_SELECT defines the strict projection for all public-facing queries.
 * CRITICAL SECURITY CONSTRAINT:
 * - `registrationNumber` is strictly OMITTED to prevent exposing sensitive RTO registration identifiers.
 * - Admin relation IDs (`createdById`) are omitted.
 */
export const PUBLIC_CAR_SELECT = {
  id: true,
  slug: true,
  title: true,
  brand: true,
  model: true,
  variant: true,
  bodyType: true,
  manufacturingYear: true,
  registrationYear: true,
  registrationState: true,
  ownerType: true,
  kmDriven: true,
  fuelType: true,
  transmission: true,
  colour: true,
  insuranceStatus: true,
  insuranceValidTill: true,
  price: true,
  discountedPrice: true,
  discountPercent: true,
  currency: true,
  description: true,
  highlightTags: true,
  status: true,
  isFeatured: true,
  isNewArrival: true,
  coverImage: true,
  images: {
    select: {
      id: true,
      url: true,
      order: true,
      isCover: true,
    },
    orderBy: {
      order: "asc" as const,
    },
  },
} as const;

export type PublicCarListing = Prisma.CarListingGetPayload<{
  select: typeof PUBLIC_CAR_SELECT;
}>;

export default prisma;

