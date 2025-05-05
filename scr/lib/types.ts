
// Add the missing type definitions or update existing ones

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "cashier";
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  lowStockAlert: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  productSummary: ProductSummary[];
}

export interface ProductSummary {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface DashboardSummary {
  today: {
    totalSales: number;
    totalRevenue: number;
    productSummary: ProductSummary[];
  };
  week: {
    totalSales: number;
    totalRevenue: number;
    productSummary: ProductSummary[];
  };
  month: {
    totalSales: number;
    totalRevenue: number;
    productSummary: ProductSummary[];
  };
  topProducts: TopProduct[];
  lowStockProducts: Product[];
  productCount: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}
