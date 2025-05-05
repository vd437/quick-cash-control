
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { fakeDb } from "@/lib/fakeDb";
import { formatCurrency } from "@/lib/helpers";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertCircle,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardSummary, Product, Sale } from "@/lib/types";
import LoadingScreen from "@/components/LoadingScreen";
import AppLayout from "@/components/AppLayout";
import { useLang } from "../contexts/LangContext";

// Import chart components
import { LineChart, BarChart } from "@/components/ui/chart";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [periodData, setPeriodData] = useState<"today" | "week" | "month">("week");
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [chartView, setChartView] = useState<"revenue" | "units">("revenue");
  const { t, isRTL } = useLang();

  // Fetch dashboard summary data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get sales summary for different periods
      const todaySummary = await fakeDb.sales.getSummary("day");
      const weekSummary = await fakeDb.sales.getSummary("week");
      const monthSummary = await fakeDb.sales.getSummary("month");
      const topProducts = await fakeDb.sales.getTopProducts(5);
      const lowStockProducts = await fakeDb.products.getLowStock();
      const productCount = await fakeDb.products.count();

      setSummary({
        today: {
          totalSales: todaySummary.totalSales,
          totalRevenue: todaySummary.totalRevenue,
          productSummary: todaySummary.productSummary
        },
        week: {
          totalSales: weekSummary.totalSales,
          totalRevenue: weekSummary.totalRevenue,
          productSummary: weekSummary.productSummary
        },
        month: {
          totalSales: monthSummary.totalSales,
          totalRevenue: monthSummary.totalRevenue,
          productSummary: monthSummary.productSummary
        },
        topProducts,
        lowStockProducts,
        productCount,
      });

      // Get all sales for charts
      const allSales = await fakeDb.sales.findAll();
      setSalesData(allSales);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Process chart data based on period
  const chartData = useMemo(() => {
    if (!salesData.length) return [];

    // Group sales by date
    const salesByDate = salesData.reduce((acc, sale) => {
      const date = new Date(sale.date);
      let key: string;

      if (periodData === "today") {
        // Group by hour for today
        key = `${date.getHours()}:00`;
      } else if (periodData === "week") {
        // Group by day name for week
        const options: Intl.DateTimeFormatOptions = { weekday: "short" };
        key = new Intl.DateTimeFormat("ar-SA", options).format(date);
      } else {
        // Group by day for month
        key = `${date.getDate()}/${date.getMonth() + 1}`;
      }

      if (!acc[key]) {
        acc[key] = { date: key, revenue: 0, units: 0 };
      }
      acc[key].revenue += sale.totalPrice;
      acc[key].units += sale.quantity;
      return acc;
    }, {} as Record<string, { date: string; revenue: number; units: number }>);

    // Convert to array and sort
    return Object.values(salesByDate).sort((a, b) => {
      if (periodData === "today") {
        return parseInt(a.date) - parseInt(b.date);
      }
      return 0; // For week and month, the order is fine
    });
  }, [salesData, periodData]);

  if (isLoading || !summary) {
    return <LoadingScreen />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard")}</h1>
          <Select
            value={periodData}
            onValueChange={(value) => setPeriodData(value as "today" | "week" | "month")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("selectPeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t("todayPeriod")}</SelectItem>
              <SelectItem value="week">{t("weekPeriod")}</SelectItem>
              <SelectItem value="month">{t("monthPeriod")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sales */}
          <Card className="stat-card">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="stat-label flex items-center">
                  <ShoppingCart className={`${isRTL ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                  {t("totalSales")}
                </p>
                <h3 className="stat-value">
                  {summary[periodData].totalSales} {t("units")}
                </h3>
              </div>
              <div className="flex items-center text-green-500">
                <ArrowUpRight className="h-4 w-4" />
                <span className={`text-sm font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {periodData === "today"
                    ? "+12%"
                    : periodData === "week"
                    ? "+18%"
                    : "+24%"}
                </span>
              </div>
            </div>
          </Card>

          {/* Total Revenue */}
          <Card className="stat-card">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="stat-label flex items-center">
                  <Calendar className={`${isRTL ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                  {t("totalRevenue")}
                </p>
                <h3 className="stat-value">
                  {formatCurrency(summary[periodData].totalRevenue)}
                </h3>
              </div>
              <div className={`flex items-center ${
                periodData === "today"
                  ? "text-red-500"
                  : "text-green-500"
              }`}>
                {periodData === "today" ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
                <span className={`text-sm font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {periodData === "today"
                    ? "-3%"
                    : periodData === "week"
                    ? "+15%"
                    : "+21%"}
                </span>
              </div>
            </div>
          </Card>

          {/* Products */}
          <Card className="stat-card">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="stat-label flex items-center">
                  <Package className={`${isRTL ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                  {t("products")}
                </p>
                <h3 className="stat-value">{summary.productCount}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 px-6 pb-6">
              إجمالي المنتجات في المخزون
            </p>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="stat-card">
            <div className="flex items-start justify-between p-6">
              <div>
                <p className="stat-label flex items-center">
                  <AlertCircle className={`${isRTL ? 'ml-1' : 'mr-1'} h-4 w-4 text-amber-500`} />
                  {t("lowStockAlerts")}
                </p>
                <h3 className="stat-value">{summary.lowStockProducts.length}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 px-6 pb-6">
              {t("productsNeedRestocking")}
            </p>
          </Card>
        </div>

        {/* Sales Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{t("salesOverview")}</h3>
                <div className="flex items-center gap-2">
                  <Select
                    value={chartView}
                    onValueChange={(value) => setChartView(value as "revenue" | "units")}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="عرض" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">{t("revenue")}</SelectItem>
                      <SelectItem value="units">{t("units")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="h-[300px]">
                {chartData.length > 0 ? (
                  chartView === "revenue" ? (
                    <LineChart
                      data={chartData}
                      xAxisDataKey="date"
                      series={[
                        { 
                          dataKey: "revenue", 
                          name: t("revenue"), 
                          stroke: "#3b82f6"
                        }
                      ]}
                      height={300}
                    />
                  ) : (
                    <BarChart
                      data={chartData}
                      xAxisDataKey="date"
                      series={[
                        { 
                          dataKey: "units", 
                          name: t("units"), 
                          fill: "#3b82f6"
                        }
                      ]}
                      height={300}
                    />
                  )
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    لا توجد بيانات مبيعات متاحة
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">{t("topProducts")}</h3>
            <div className="space-y-4">
              {summary.topProducts.slice(0, 5).map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.totalSold} {t("unitsSold")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(product.totalRevenue)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Low Stock Products */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">{t("lowStockAlerts")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.lowStockProducts.map((product: Product) => (
              <Card key={product.id} className="p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-amber-100 dark:bg-amber-900 p-1.5 rounded-full">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </div>
                  <h4 className="text-sm font-medium">{product.name}</h4>
                </div>
                <div className="mt-auto flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {product.quantity} {t("unitsLeft")}
                  </p>
                  <p className="text-xs font-medium">
                    {t("lowStockThreshold")}: {product.lowStockAlert}
                  </p>
                </div>
              </Card>
            ))}
            {summary.lowStockProducts.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">
                {t("noLowStockProducts")}
              </p>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
