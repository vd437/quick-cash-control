
import { Product, Sale, SalesSummary, TopProduct, User } from "./types";

// Simulated database with in-memory data storage
class FakeDB {
  // Private data arrays with underscore prefix to avoid naming conflicts
  private _users: User[] = [
    {
      id: 1,
      name: "مدير النظام",
      email: "admin@example.com",
      password: "password", // In a real app, this would be hashed
      role: "admin",
      createdAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      name: "الكاشير",
      email: "cashier@example.com",
      password: "password", // In a real app, this would be hashed
      role: "cashier",
      createdAt: "2023-01-01T00:00:00.000Z",
    },
  ];

  private _products: Product[] = [
    {
      id: 1,
      name: "لابتوب ديل XPS 13",
      description: "حاسب محمول خفيف وسريع مع شاشة 13 بوصة",
      price: 4999.99,
      quantity: 7,
      lowStockAlert: 5,
      imageUrl: "https://via.placeholder.com/150",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      name: "سماعات سوني WH-1000XM4",
      description: "سماعات لاسلكية بتقنية إلغاء الضوضاء",
      price: 899.99,
      quantity: 15,
      lowStockAlert: 5,
      imageUrl: "https://via.placeholder.com/150",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 3,
      name: "آيفون 14 برو ماكس",
      description: "أحدث هواتف أبل مع كاميرا متطورة",
      price: 5399.99,
      quantity: 3,
      lowStockAlert: 5,
      imageUrl: "https://via.placeholder.com/150",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 4,
      name: "جالاكسي تاب S8",
      description: "تابلت سامسونج بشاشة 12 بوصة",
      price: 2599.99,
      quantity: 9,
      lowStockAlert: 5,
      imageUrl: "https://via.placeholder.com/150",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 5,
      name: "ساعة أبل الإصدار 8",
      description: "ساعة ذكية مع مستشعرات صحية",
      price: 1699.99,
      quantity: 0,
      lowStockAlert: 5,
      imageUrl: "https://via.placeholder.com/150",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
    {
      id: 6,
      name: "إيكو دوت (الجيل الخامس)",
      description: "مكبر صوت ذكي من أمازون",
      price: 199.99,
      quantity: 25,
      lowStockAlert: 5,
      imageUrl: "https://via.placeholder.com/150",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    },
  ];

  private _sales: Sale[] = [
    {
      id: 1,
      productId: 1,
      productName: "لابتوب ديل XPS 13",
      quantity: 1,
      unitPrice: 4999.99,
      totalPrice: 4999.99,
      date: this.getRandomDate(30),
    },
    {
      id: 2,
      productId: 2,
      productName: "سماعات سوني WH-1000XM4",
      quantity: 2,
      unitPrice: 899.99,
      totalPrice: 1799.98,
      date: this.getRandomDate(7),
    },
    {
      id: 3,
      productId: 3,
      productName: "آيفون 14 برو ماكس",
      quantity: 1,
      unitPrice: 5399.99,
      totalPrice: 5399.99,
      date: this.getRandomDate(1),
    },
    {
      id: 4,
      productId: 4,
      productName: "جالاكسي تاب S8",
      quantity: 1,
      unitPrice: 2599.99,
      totalPrice: 2599.99,
      date: this.getRandomDate(1),
    },
    {
      id: 5,
      productId: 2,
      productName: "سماعات سوني WH-1000XM4",
      quantity: 3,
      unitPrice: 899.99,
      totalPrice: 2699.97,
      date: this.getRandomDate(14),
    },
  ];

  private lastIds = {
    user: 2,
    product: 6,
    sale: 5,
  };

  // Helper to generate random dates for demo data
  private getRandomDate(daysBack: number): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date.toISOString();
  }

  // Authentication
  public auth = {
    login: async (email: string, password: string): Promise<User | null> => {
      const user = this._users.find(
        (u) => u.email === email && u.password === password
      );
      return user || null;
    },

    register: async (userData: Omit<User, "id">): Promise<User> => {
      const id = ++this.lastIds.user;
      const newUser = { ...userData, id };
      this._users.push(newUser);
      return newUser;
    },
  };

  // User methods
  public users = {
    findByEmail: async (email: string): Promise<User | null> => {
      const user = this._users.find((u) => u.email === email);
      return user || null;
    },

    findById: async (id: number): Promise<User | null> => {
      const user = this._users.find((u) => u.id === id);
      return user || null;
    },

    create: async (userData: Omit<User, "id">): Promise<User> => {
      const id = ++this.lastIds.user;
      const newUser = { ...userData, id };
      this._users.push(newUser);
      return newUser;
    }
  };

  // Product methods
  public products = {
    findAll: async (): Promise<Product[]> => {
      return [...this._products];
    },

    findById: async (id: number): Promise<Product | null> => {
      const product = this._products.find((p) => p.id === id);
      return product || null;
    },

    create: async (
      productData: Omit<Product, "id">
    ): Promise<Product> => {
      const id = ++this.lastIds.product;
      const newProduct = { ...productData, id } as Product;
      this._products.push(newProduct);
      return newProduct;
    },

    update: async (
      id: number,
      productData: Omit<Product, "id">
    ): Promise<Product | null> => {
      const index = this._products.findIndex((p) => p.id === id);
      if (index === -1) return null;

      const updatedProduct = { ...productData, id };
      this._products[index] = updatedProduct;
      return updatedProduct;
    },

    remove: async (id: number): Promise<boolean> => {
      const initialLength = this._products.length;
      this._products = this._products.filter((p) => p.id !== id);
      return this._products.length !== initialLength;
    },

    getLowStock: async (): Promise<Product[]> => {
      return this._products.filter(
        (p) => p.quantity <= p.lowStockAlert && p.quantity > 0
      );
    },

    count: async (): Promise<number> => {
      return this._products.length;
    },

    updateStock: async (
      productId: number,
      quantity: number
    ): Promise<Product | null> => {
      const index = this._products.findIndex((p) => p.id === productId);
      if (index === -1) return null;

      // Update quantity
      const updatedProduct = {
        ...this._products[index],
        quantity: Math.max(0, this._products[index].quantity - quantity),
        updatedAt: new Date().toISOString(),
      };

      this._products[index] = updatedProduct;
      return updatedProduct;
    },
  };

  // Sales methods
  public sales = {
    findAll: async (): Promise<Sale[]> => {
      return [...this._sales].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },

    findById: async (id: number): Promise<Sale | null> => {
      const sale = this._sales.find((s) => s.id === id);
      return sale || null;
    },

    create: async (saleData: Omit<Sale, "id">): Promise<Sale> => {
      const id = ++this.lastIds.sale;
      const newSale = { ...saleData, id };

      // Update product stock
      await this.products.updateStock(saleData.productId, saleData.quantity);

      this._sales.push(newSale);
      return newSale;
    },

    getByDateRange: async (
      fromDate: string,
      toDate: string
    ): Promise<Sale[]> => {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      return this._sales
        .filter((sale) => {
          const saleDate = new Date(sale.date);
          return saleDate >= from && saleDate <= to;
        })
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    },

    getSummary: async (
      period: "day" | "week" | "month"
    ): Promise<SalesSummary> => {
      const now = new Date();
      let startDate = new Date();

      // Set the start date based on the period
      if (period === "day") {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === "week") {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setMonth(now.getMonth() - 1);
      }

      // Filter sales within the period
      const filteredSales = this._sales.filter(
        (sale) => new Date(sale.date) >= startDate
      );

      // Calculate summary
      const totalSales = filteredSales.length;
      const totalRevenue = filteredSales.reduce(
        (sum, sale) => sum + sale.totalPrice,
        0
      );

      // Get product summary
      const productMap = new Map<number, { name: string; sold: number; revenue: number }>();
      
      filteredSales.forEach((sale) => {
        const existingProduct = productMap.get(sale.productId);
        if (existingProduct) {
          existingProduct.sold += sale.quantity;
          existingProduct.revenue += sale.totalPrice;
        } else {
          productMap.set(sale.productId, {
            name: sale.productName,
            sold: sale.quantity,
            revenue: sale.totalPrice,
          });
        }
      });

      const productSummary = Array.from(productMap.entries()).map(
        ([productId, data]) => ({
          productId,
          productName: data.name,
          totalSold: data.sold,
          totalRevenue: data.revenue,
        })
      );

      return {
        totalSales,
        totalRevenue,
        productSummary,
      };
    },

    getTopProducts: async (limit: number = 5): Promise<TopProduct[]> => {
      // Group sales by product
      const productMap = new Map<number, { name: string; sold: number; revenue: number }>();
      
      this._sales.forEach((sale) => {
        const existingProduct = productMap.get(sale.productId);
        if (existingProduct) {
          existingProduct.sold += sale.quantity;
          existingProduct.revenue += sale.totalPrice;
        } else {
          productMap.set(sale.productId, {
            name: sale.productName,
            sold: sale.quantity,
            revenue: sale.totalPrice,
          });
        }
      });

      // Convert to array and sort by revenue
      const topProducts = Array.from(productMap.entries())
        .map(([productId, data]) => ({
          productId,
          productName: data.name,
          totalSold: data.sold,
          totalRevenue: data.revenue,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);

      return topProducts;
    },
  };
}

export const fakeDb = new FakeDB();
