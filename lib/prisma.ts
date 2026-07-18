import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

function getNeonAdapterConnectionString() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL must be set before creating PrismaClient")
  }

  const url = new URL(connectionString)
  url.searchParams.delete("channel_binding")

  return url.toString()
}

const createPrismaClient = () => {
  const adapter = new PrismaNeon({
    connectionString: getNeonAdapterConnectionString(),
  })

  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
