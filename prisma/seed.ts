import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Phase 0: placeholder — seed data starts in Phase 2 (Location) and Phase 3 (Taxonomy)
  console.log("Seed completed (Phase 0 — no business data)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
