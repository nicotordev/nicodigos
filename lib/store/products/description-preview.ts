export function plainDescriptionPreview(
  html: string | null | undefined,
  maxLength = 280,
): string | null {
  if (!html) {
    return null;
  }

  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return null;
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function buildProductHighlights(product: {
  platform: string;
  regionName: string | null;
  genres: string[];
  languages: string[];
  isPreorder: boolean;
}): string[] {
  const items: string[] = [
    `Key digital para ${product.platform}`,
    "Te llega al tiro en tu cuenta y correo",
    "Pago seguro con Flow (Webpay, MACH y más)",
  ];

  if (product.regionName) {
    items.push(
      `Región: ${product.regionName === "Global" ? "Global" : product.regionName}`,
    );
  }

  if (product.genres.length > 0) {
    items.push(`Géneros: ${product.genres.slice(0, 3).join(", ")}`);
  }

  if (product.languages.length > 0) {
    items.push(`Idiomas: ${product.languages.slice(0, 4).join(", ")}`);
  }

  if (product.isPreorder) {
    items.push("Preventa: se entrega al lanzamiento oficial");
  }

  return items;
}
