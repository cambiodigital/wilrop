import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allCruises = await prisma.cruise.findMany({
    include: {
      cabins: true,
      destinations: true,
    }
  });
  console.log('--- ALL CRUISES ---');
  console.log(`Total cruises in DB: ${allCruises.length}`);
  allCruises.forEach(c => {
    console.log(`- ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}, Active: ${c.active}, isTemplate: ${c.isTemplate}, Cabins: ${c.cabins.length}, Featured: ${c.featured}`);
  });
  
  const activeNonTemplateCount = await prisma.cruise.count({
    where: { active: true, isTemplate: false }
  });
  console.log(`Active non-template count: ${activeNonTemplateCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
