import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CategoryPage } from "@/components/shop/category/category-page";
import type { CategoryProduct, SortValue } from "@/components/shop/category/types";
import { getConsumerPrice } from "@/lib/store/products/pricing";

export const revalidate = 60; // Revalidate cache every 60 seconds

type CategoryPageProps = {
  readonly params: Promise<{
    slug: string;
  }>;
  readonly searchParams: Promise<{
    sort?: string;
    platform?: string;
    genre?: string;
    minPrice?: string;
    maxPrice?: string;
    availability?: string;
    region?: string;
    featured?: string;
    offer?: string;
    preorder?: string;
  }>;
};

// Coefficient to reverse-calculate raw DB prices from target consumer CLP prices
const CONSUMER_TO_DB_FACTOR = 1.23517359;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      seoMetadata: {
        select: {
          document: true,
        },
      },
    },
  });

  if (!category) {
    return {
      title: "Categoría no encontrada | Nicodigos",
    };
  }

  const title = `${category.name} | Códigos digitales en Chile`;
  const plainDescription = category.description
    ? category.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
    : "";

  const description =
    plainDescription ||
    `Compra ${category.name}, juegos digitales, gift cards, software keys y suscripciones con entrega rápida en Chile.`;

  // Safely cast or parse existing JSON SEO metadata
  const documentMetadata = (category.seoMetadata?.document as Record<string, unknown>) ?? {};

  return {
    title,
    description,
    ...documentMetadata,
    openGraph: {
      title,
      description,
      type: "website",
      ...(documentMetadata.openGraph as Record<string, unknown>),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(documentMetadata.twitter as Record<string, unknown>),
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // 1. Fetch category
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  // 2. Fetch sibling categories for sidebar filter
  const siblingCategoriesRaw = await prisma.category.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" }
    ],
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  const siblingCategories = siblingCategoriesRaw.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    productCount: cat._count.products,
  }));

  // 3. Build Prisma query dynamic filters
  const andConditions: any[] = [
    { isActive: true },
    {
      categories: {
        some: {
          id: category.id,
        },
      },
    },
  ];

  // Platform Filter (comma-separated support)
  if (resolvedSearchParams.platform) {
    const platforms = resolvedSearchParams.platform
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    if (platforms.length > 0) {
      andConditions.push({
        OR: platforms.map((plat) => ({
          platform: { equals: plat, mode: "insensitive" },
        })),
      });
    }
  }

  // Genre Filter (comma-separated support)
  if (resolvedSearchParams.genre) {
    const genres = resolvedSearchParams.genre
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    if (genres.length > 0) {
      andConditions.push({
        genres: {
          hasSome: genres,
        },
      });
    }
  }

  // Price Filter (converts CLP final pricing back to DB raw pricing)
  if (resolvedSearchParams.minPrice || resolvedSearchParams.maxPrice) {
    const priceCondition: Record<string, any> = {};
    if (resolvedSearchParams.minPrice) {
      const rawMin = Number(resolvedSearchParams.minPrice) / CONSUMER_TO_DB_FACTOR;
      priceCondition.gte = rawMin;
    }
    if (resolvedSearchParams.maxPrice) {
      const rawMax = Number(resolvedSearchParams.maxPrice) / CONSUMER_TO_DB_FACTOR;
      priceCondition.lte = rawMax;
    }
    andConditions.push({
      sellPrice: priceCondition,
    });
  }

  // Availability Filter (comma-separated: in-stock, out-of-stock, offers, featured, preorders)
  if (resolvedSearchParams.availability) {
    const avails = resolvedSearchParams.availability
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    if (avails.length > 0) {
      const orConditions: any[] = [];
      if (avails.includes("in-stock")) {
        orConditions.push({ qty: { gt: 0 } });
      }
      if (avails.includes("out-of-stock")) {
        orConditions.push({ qty: { lte: 0 } });
      }
      if (avails.includes("offers")) {
        orConditions.push({ isOffer: true });
      }
      if (avails.includes("featured")) {
        orConditions.push({ isFeatured: true });
      }
      if (avails.includes("preorders")) {
        orConditions.push({ isPreorder: true });
      }

      if (orConditions.length > 0) {
        andConditions.push({ OR: orConditions });
      }
    }
  }

  // Region Filter (comma-separated support)
  if (resolvedSearchParams.region) {
    const regions = resolvedSearchParams.region
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    if (regions.length > 0) {
      const orConditions: any[] = [];
      regions.forEach((r) => {
        if (r === "global") {
          orConditions.push({ regionName: { equals: "Global", mode: "insensitive" } });
        } else if (r === "latam") {
          orConditions.push({ regionName: { equals: "LATAM", mode: "insensitive" } });
        } else if (r === "chile") {
          orConditions.push({
            OR: [
              { regionName: { equals: "Chile", mode: "insensitive" } },
              { countryLimitations: { has: "CL" } },
            ],
          });
        } else if (r === "europe") {
          orConditions.push({ regionName: { equals: "Europe", mode: "insensitive" } });
        } else if (r === "united-states") {
          orConditions.push({
            OR: [
              { regionName: { equals: "United States", mode: "insensitive" } },
              { regionName: { equals: "US", mode: "insensitive" } },
              { regionName: { equals: "USA", mode: "insensitive" } },
            ],
          });
        }
      });

      if (orConditions.length > 0) {
        andConditions.push({ OR: orConditions });
      }
    }
  }

  // Singular flags parameters fallback
  if (resolvedSearchParams.featured === "true") {
    andConditions.push({ isFeatured: true });
  }
  if (resolvedSearchParams.offer === "true") {
    andConditions.push({ isOffer: true });
  }
  if (resolvedSearchParams.preorder === "true") {
    andConditions.push({ isPreorder: true });
  }

  // Build the sorting orderBy clause
  const sort = (resolvedSearchParams.sort as SortValue) || "featured";
  let orderBy: Record<string, any> = { isFeatured: "desc" };

  if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "price-asc") {
    orderBy = { sellPrice: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { sellPrice: "desc" };
  } else if (sort === "offers") {
    orderBy = { isOffer: "desc" };
  }

  // Fetch filtered and sorted products from database
  const rawProducts = await prisma.product.findMany({
    where: {
      AND: andConditions,
    },
    orderBy,
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  // 4. Map raw DB products safely to CategoryProduct types
  const products: ReadonlyArray<CategoryProduct> = rawProducts.map((p) => {
    // Convert DB sellPrice Decimal safely using getConsumerPrice utility, then parse to number
    const displayPriceStr = getConsumerPrice(p.sellPrice);
    const sellPriceNum = Number(displayPriceStr);

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      originalName: p.originalName,
      platform: p.platform,
      genres: p.genres,
      coverImageUrl: p.coverImageUrl,
      sellPrice: sellPriceNum,
      qty: p.qty,
      isOffer: p.isOffer,
      isFeatured: p.isFeatured,
      isPreorder: p.isPreorder,
      regionName: p.regionName,
      regionalLimitations: p.regionalLimitations,
      countryLimitations: p.countryLimitations,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
        sortOrder: img.sortOrder,
        isCover: img.isCover,
      })),
    };
  });

  // Category mapping for page View Model
  const categoryViewModel = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    bannerUrl: category.bannerUrl,
  };

  return (
    <CategoryPage
      category={categoryViewModel}
      products={products}
      siblingCategories={siblingCategories}
      productCount={products.length}
    />
  );
}
