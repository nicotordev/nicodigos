/**
 * Crea categorías de prueba y asigna productos existentes para testear el admin.
 *
 *   bun --env-file=.env run scripts/seed-test-categories.ts
 *   bun --env-file=.env run scripts/seed-test-categories.ts -- --clean
 */

import "dotenv/config";

import { slugifyCategoryName } from "../lib/admin/categories/slug";
import prisma from "../lib/prisma";

const TEST_SLUG_PREFIX = "test-";

/** URLs directas de Unsplash / Pexels (solo para seeds de QA). */
const TEST_CATEGORY_DEFS = [
  {
    name: "[TEST] Acción y aventura",
    sortOrder: 10,
    imageUrl:
      "https://images.pexels.com/photos/791535/pexels-photo-791535.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
    bannerUrl:
      "https://images.pexels.com/photos/791535/pexels-photo-791535.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
    descriptions: [
      "Keys de acción y aventura para probar listados y filtros en el admin.",
      "Categoría temporal de QA — juegos de acción, plataformas y mundo abierto.",
    ],
  },
  {
    name: "[TEST] Terror y survival",
    sortOrder: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1509248194763-37d9fbcb9d8c?w=256&h=256&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1509248194763-37d9fbcb9d8c?w=1200&h=400&fit=crop",
    descriptions: [
      "Horror y supervivencia. Útil para validar asignación masiva desde el board.",
      "Categoría de prueba con productos variados de terror y survival.",
    ],
  },
  {
    name: "[TEST] RPG y estrategia",
    sortOrder: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=256&h=256&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop",
    descriptions: [
      "RPG y estrategia en turnos o tiempo real.",
      "Seed de QA para comprobar paginación y filtros por categoría.",
    ],
  },
  {
    name: "[TEST] Steam",
    sortOrder: 40,
    imageUrl:
      "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=256&h=256&fit=crop",
    bannerUrl:
      "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop",
    descriptions: [
      "Productos con plataforma Steam (asignación por regla de plataforma).",
      "Categoría de prueba orientada a keys de Steam.",
    ],
    matchPlatform: /steam/i,
  },
  {
    name: "[TEST] Destacados tienda",
    sortOrder: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b4823f2c?w=256&h=256&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b4823f2c?w=1200&h=400&fit=crop",
    descriptions: [
      "Mezcla aleatoria de productos para pruebas de bulk assign.",
      "Categoría catch-all de testing en Nicodigos.",
    ],
  },
] as const;

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function testSlug(name: string): string {
  const base = slugifyCategoryName(name.replace(/^\[TEST\]\s*/i, ""));
  return `${TEST_SLUG_PREFIX}${base}`;
}

async function cleanTestCategories(): Promise<void> {
  const deleted = await prisma.category.deleteMany({
    where: { slug: { startsWith: TEST_SLUG_PREFIX } },
  });
  console.log(
    `[seed-test-categories] Eliminadas ${deleted.count} categorías test.`,
  );
}

async function seedTestCategories(): Promise<void> {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, platform: true },
    orderBy: { updatedAt: "desc" },
    take: 120,
  });

  if (products.length === 0) {
    console.error(
      "[seed-test-categories] No hay productos en la BD. Importa algunos desde Kinguin primero.",
    );
    process.exit(1);
  }

  const categories = [];

  for (const def of TEST_CATEGORY_DEFS) {
    const slug = testSlug(def.name);
    const category = await prisma.category.upsert({
      where: { slug },
      create: {
        name: def.name,
        slug,
        sortOrder: def.sortOrder,
        description: `<p>${pick(def.descriptions)}</p>`,
        imageUrl: def.imageUrl,
        bannerUrl: def.bannerUrl,
      },
      update: {
        name: def.name,
        sortOrder: def.sortOrder,
        description: `<p>${pick(def.descriptions)}</p>`,
        imageUrl: def.imageUrl,
        bannerUrl: def.bannerUrl,
      },
      select: { id: true, name: true, slug: true },
    });
    categories.push({ ...category, matchPlatform: (def as any).matchPlatform as RegExp | undefined });
    console.log(
      `[seed-test-categories] Categoría: ${category.name} (${category.slug}) · imagen OK`,
    );
  }

  const shuffled = shuffle(products);
  const assignments = new Map<string, Set<string>>();

  for (const category of categories) {
    assignments.set(category.id, new Set());
  }

  for (let index = 0; index < shuffled.length; index += 1) {
    const product = shuffled[index]!;
    const category = categories[index % categories.length]!;
    assignments.get(category.id)!.add(product.id);
  }

  for (const category of categories) {
    if (!category.matchPlatform) {
      continue;
    }

    for (const product of products) {
      if (category.matchPlatform.test(product.platform)) {
        assignments.get(category.id)!.add(product.id);
      }
    }
  }

  let connected = 0;

  for (const [categoryId, productIds] of assignments) {
    const ids = [...productIds];
    if (ids.length === 0) {
      continue;
    }

    await prisma.$transaction(
      ids.map((productId) =>
        prisma.product.update({
          where: { id: productId },
          data: {
            categories: { connect: { id: categoryId } },
          },
        }),
      ),
    );

    connected += ids.length;
    const categoryName =
      categories.find((item) => item.id === categoryId)?.name ?? categoryId;
    console.log(
      `[seed-test-categories]   → ${ids.length} productos en «${categoryName}»`,
    );
  }

  console.log(
    `[seed-test-categories] Listo: ${categories.length} categorías, ${connected} asignaciones (algunos productos pueden estar en varias).`,
  );
  console.log(
    "[seed-test-categories] Filtra en /admin/products con el selector de categoría o asigna más desde el board.",
  );
}

async function main() {
  const shouldClean = process.argv.includes("--clean");

  if (shouldClean) {
    await cleanTestCategories();
    return;
  }

  await seedTestCategories();
}

main()
  .catch((error) => {
    console.error("[seed-test-categories] Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
