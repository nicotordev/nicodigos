import prisma from "@/lib/prisma";
import { slugify } from "@/lib/admin/products/slugify";

export { slugify };

export async function uniqueProductSlug(name: string): Promise<string> {
  const root = slugify(name);
  let candidate = root;
  let suffix = 0;

  while (await prisma.product.findUnique({ where: { slug: candidate } })) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }

  return candidate;
}

export async function resolveImportProductSlug(
  fallbackName: string,
  preferredSlug?: string,
): Promise<{ slug: string } | { error: string }> {
  if (preferredSlug?.trim()) {
    const slug = slugify(preferredSlug);
    if (!slug) {
      return { error: "El slug no es válido." };
    }

    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return { error: `El slug "${slug}" ya está en uso.` };
    }

    return { slug };
  }

  return { slug: await uniqueProductSlug(fallbackName) };
}
