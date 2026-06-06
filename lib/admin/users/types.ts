export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: string;
};

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: string;
  recentOrders: {
    id: string;
    status: string;
    total: string;
    currency: string;
    createdAt: string;
  }[];
};
