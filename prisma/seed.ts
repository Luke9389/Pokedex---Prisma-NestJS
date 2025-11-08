import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed Pokemon database...');

  // First, seed all the types
  const typeNames = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  console.log('Creating types...');
  for (const typeName of typeNames) {
    await prisma.type.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
  }
  console.log('✓ Types created\n');

  // Fetch and create all 151 original Pokemon
  for (let number = 1; number <= 151; number++) {
    try {
      // Check if Pokemon already exists
      const existing = await prisma.pokemon.findUnique({
        where: { number },
      });

      if (existing) {
        console.log(`Pokemon #${number} already exists, skipping...`);
        continue;
      }

      // Fetch from PokeAPI
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number}`);

      if (!response.ok) {
        console.error(`Failed to fetch Pokemon #${number}`);
        continue;
      }

      const data = await response.json();

      // Extract type names from PokeAPI response
      const typeNames = data.types.map((t: any) => t.type.name);

      // Create Pokemon with type mappings
      await prisma.pokemon.create({
        data: {
          number: data.id,
          name: data.name,
          imageUrl: data.sprites.front_default,
          caught: false,
          seen: false,
          types: {
            create: typeNames.map((typeName: string) => ({
              type: {
                connect: { name: typeName }
              }
            }))
          }
        },
      });

      console.log(`✓ Added Pokemon #${number}: ${data.name} (${typeNames.join(', ')})`);
    } catch (error) {
      console.error(`Error processing Pokemon #${number}:`, error);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
