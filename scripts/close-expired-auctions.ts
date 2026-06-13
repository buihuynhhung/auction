import { closeExpiredAuctions } from "../src/lib/close-auctions";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await closeExpiredAuctions();
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
