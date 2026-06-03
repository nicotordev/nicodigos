import prisma from "@/lib/prisma";

export function slugifyCategoryName(value: string): string {
  const base = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || "categoria";
}

export async function uniqueCategorySlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const root = slugifyCategoryName(name);
  let candidate = root;
  let suffix = 0;

  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}
