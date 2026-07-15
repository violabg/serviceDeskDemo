import { config } from "dotenv"

import { bootstrapAccessControl } from "@/lib/access-control/server"
import { prisma } from "@/lib/prisma"

config({ path: ".env.local" })
config()

async function main() {
  const result = await bootstrapAccessControl()

  console.log(
    `Seeded ${result.permissionCount} permissions and ${result.adminRole.name} role`,
  )

  if (result.adminUser) {
    console.log("Initial administrator role assigned")
  } else {
    console.log("INITIAL_ADMIN_EMAIL not set; administrator role not assigned")
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
