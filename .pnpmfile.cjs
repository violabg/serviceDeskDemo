// TypeScript 7 keeps the fast app/build CLI, but no longer exposes the compiler
// API used by ESLint. Give those tools their own supported TypeScript SDK.
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (
        pkg.name?.startsWith("@typescript-eslint/") ||
        pkg.name === "typescript-eslint" ||
        pkg.name === "ts-api-utils"
      ) {
        pkg.dependencies = { ...pkg.dependencies, typescript: "6.0.3" }
        if (pkg.peerDependencies) delete pkg.peerDependencies.typescript
      }
      // Give auth plugins their required peers without inheriting the UI's
      // separate better-call version or another dependency's Zod 3.
      if (pkg.name === "@better-auth/api-key" && pkg.version === "1.6.23") {
        pkg.dependencies = { ...pkg.dependencies, "better-call": "1.3.7" }
        if (pkg.peerDependencies) delete pkg.peerDependencies["better-call"]
      }
      if (pkg.name === "better-call" && pkg.version === "1.3.7") {
        pkg.dependencies = { ...pkg.dependencies, zod: "4.3.6" }
        if (pkg.peerDependencies) delete pkg.peerDependencies.zod
      }
      return pkg
    },
  },
}
