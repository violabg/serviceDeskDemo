import { config } from "dotenv"

config({ path: ".env.local" })
config()

async function main() {
  const [{ bootstrapAccessControl }, { prisma }] = await Promise.all([
    import("@/lib/access-control/server"),
    import("@/lib/prisma"),
  ])

  try {
    const result = await bootstrapAccessControl()

    console.log(
      `Seeded ${result.permissionCount} permissions and ${result.adminRole.name} role`,
    )

    if (result.adminUser) {
      console.log("Initial administrator role assigned")
    } else {
      console.log("INITIAL_ADMIN_EMAIL not set; administrator role not assigned")
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
