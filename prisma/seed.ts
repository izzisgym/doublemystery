import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { SEED_DATA } from "../src/lib/seed-data.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.order.deleteMany();
  await prisma.blindboxSession.deleteMany();
  await prisma.item.deleteMany();
  await prisma.box.deleteMany();
  await prisma.universe.deleteMany();

  for (const [slug, data] of Object.entries(SEED_DATA)) {
    const universe = await prisma.universe.create({
      data: {
        slug,
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        gradient: data.gradient,
      },
    });

    console.log(`  Created universe: ${universe.name}`);

    for (const boxData of data.boxes) {
      const box = await prisma.box.create({
        data: {
          name: boxData.name,
          img: boxData.img,
          universeId: universe.id,
        },
      });

      console.log(`    Created box: ${box.name}`);

      for (const itemName of boxData.items) {
        await prisma.item.create({
          data: {
            name: itemName,
            boxId: box.id,
          },
        });
      }

      console.log(`      Created ${boxData.items.length} items`);
    }
  }

  const counts = {
    universes: await prisma.universe.count(),
    boxes: await prisma.box.count(),
    items: await prisma.item.count(),
  };

  console.log("\nSeed complete!");
  console.log(
    `  ${counts.universes} universes, ${counts.boxes} boxes, ${counts.items} items`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
