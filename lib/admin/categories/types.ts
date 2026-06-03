export type AdminCategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  sortOrder: number;
  productCount: number;
  createdAt: string;
};

export type AdminCategoryEditData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  sortOrder: number;
  productCount: number;
};
