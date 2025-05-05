
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Printer } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency, formatDate, generateCsv, downloadFile } from "@/lib/helpers";
import { fakeDb } from "@/lib/fakeDb";
import { Sale, DateRange, TopProduct } from "@/lib/types";
import { useToast } from "../hooks/use-toast";
import LoadingScreen from "@/components/LoadingScreen";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Import recharts components directly
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PERIODS = {
  day: { label: "Today", days: 0 },
  week: { label: "This Week", days: 7 },
  month: { label: "This Month", days: 30 },
  quarter: { label: "Last 3 Months", days: 90 },
  custom: { label: "Custom", days: 0 }, // Add custom to the periods
};

// Define the period type to include "custom"
type PeriodType = "day" | "week" | "month" | "quarter" | "custom";

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("week");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const { toast } = useToast();

  // Date formatting helper
  const formatDisplayDate = (date: Date) => {
    return format(date, "MMM dd, yyyy");
  };

  // Load sales data
  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      // Convert dates to ISO strings for the API
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();
      
      const salesData = await fakeDb.sales.getByDateRange(fromDate, toDate);
      setSales(salesData);
      
      // Calculate totals
      const revenue = salesData.reduce((sum, sale) => sum + sale.totalPrice, 0);
      setTotalRevenue(revenue);
      setSalesCount(salesData.length);
      
      // Get top products
      const topProductsData = await fakeDb.sales.getTopProducts(5);
      setTopProducts(topProductsData);
      
      // Prepare chart data - group sales by date
      const chartDataMap = salesData.reduce((acc, sale) => {
        const date = new Date(sale.date);
        const dateString = format(date, "MM/dd");
        
        if (!acc[dateString]) {
          acc[dateString] = {
            date: dateString,
            revenue: 0,
            units: 0,
          };
        }
        
        acc[dateString].revenue += sale.totalPrice;
        acc[dateString].units += sale.quantity;
        return acc;
      }, {} as Record<string, { date: string; revenue: number; units: number }>);
      
      // Convert to array and sort by date
      const chartDataArray = Object.values(chartDataMap).sort((a, b) => {
        const [monthA, dayA] = a.date.split('/').map(Number);
        const [monthB, dayB] = b.date.split('/').map(Number);
        
        if (monthA !== monthB) {
          return monthA - monthB;
        }
        return dayA - dayB;
      });
      
      setChartData(chartDataArray);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load sales data",
        description: "There was a problem fetching the sales data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (value: PeriodType) => {
    setPeriod(value);
    
    if (value !== "custom") {
      const today = new Date();
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - PERIODS[value].days);
      
      setDateRange({
        from: fromDate,
        to: today,
      });
    }
  };

  // Handle date range selection
  const handleDateSelect = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      
      const to = new Date(range.to);
      to.setHours(23, 59, 59, 999);
      
      setDateRange({ from, to });
      setPeriod("custom");
    } else if (range.from) {
      setDateRange({ ...dateRange, from: range.from });
    } else if (range.to) {
      setDateRange({ ...dateRange, to: range.to });
    }
  };

  // Export sales to CSV
  const exportToCSV = () => {
    try {
      // Map sales data to CSV format
      const salesData = sales.map(sale => ({
        'ID': sale.id.toString(),
        'Product': sale.productName,
        'Quantity': sale.quantity.toString(),
        'Unit Price': sale.unitPrice.toFixed(2),
        'Total': sale.totalPrice.toFixed(2),
        'Date': formatDate(sale.date, 'long'),
      }));
      
      const headers = ['ID', 'Product', 'Quantity', 'Unit Price', 'Total', 'Date'];
      const csvContent = generateCsv(salesData, headers);
      
      // Create filename with date range
      const fromDateStr = format(dateRange.from, "yyyyMMdd");
      const toDateStr = format(dateRange.to, "yyyyMMdd");
      const filename = `sales_${fromDateStr}_to_${toDateStr}.csv`;
      
      downloadFile(csvContent, filename, 'text/csv');
      
      toast({
        title: "Export successful",
        description: `Sales data exported to ${filename}`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was a problem exporting the sales data.",
      });
    }
  };

  // Print sales report
  const printSalesReport = () => {
    try {
      // Create a report window
      const reportWindow = window.open('', '_blank');
      if (!reportWindow) {
        throw new Error('Popup blocked');
      }
      
      // Format date range
      const fromDateStr = formatDisplayDate(dateRange.from);
      const toDateStr = formatDisplayDate(dateRange.to);
      
      // Generate sales rows
      const salesRows = sales.map((sale, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${sale.productName}</td>
          <td>${sale.quantity}</td>
          <td>${formatCurrency(sale.unitPrice)}</td>
          <td>${formatCurrency(sale.totalPrice)}</td>
          <td>${formatDate(sale.date)}</td>
        </tr>
      `).join('');
      
      // Top products
      const topProductsRows = topProducts.map((product, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${product.productName}</td>
          <td>${product.totalSold}</td>
          <td>${formatCurrency(product.totalRevenue)}</td>
        </tr>
      `).join('');
      
      // Create the report HTML
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Report (${fromDateStr} - ${toDateStr})</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 30px;
              line-height: 1.5;
            }
            h1, h2, h3 {
              color: #333;
            }
            .report-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .summary {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              gap: 20px;
            }
            .summary-card {
              flex: 1;
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              background-color: #f8f8f8;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .section {
              margin-bottom: 30px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>Sales Report</h1>
            <h3>${fromDateStr} - ${toDateStr}</h3>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h2>Total Revenue</h2>
              <p style="font-size: 24px; font-weight: bold;">${formatCurrency(totalRevenue)}</p>
            </div>
            <div class="summary-card">
              <h2>Total Sales</h2>
              <p style="font-size: 24px; font-weight: bold;">${salesCount} transactions</p>
            </div>
          </div>
          
          <div class="section">
            <h2>Top Products</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${topProductsRows}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Sales Detail</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${salesRows}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Generated on ${formatDate(new Date().toISOString(), 'long')}</p>
            <p>Quick Cash Control - Accounting System</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;
      
      reportWindow.document.open();
      reportWindow.document.write(reportHtml);
      reportWindow.document.close();
    } catch (error) {
      console.error("Error printing report:", error);
      toast({
        variant: "destructive",
        title: "Print failed",
        description: "Failed to generate printable report. Please check your popup settings.",
      });
    }
  };

  // Fetch data when date range changes
  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  if (isLoading && sales.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={printSalesReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={period} onValueChange={(value) => handlePeriodChange(value as PeriodType)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">{PERIODS.day.label}</SelectItem>
            <SelectItem value="week">{PERIODS.week.label}</SelectItem>
            <SelectItem value="month">{PERIODS.month.label}</SelectItem>
            <SelectItem value="quarter">{PERIODS.quarter.label}</SelectItem>
            <SelectItem value="custom">{PERIODS.custom.label}</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto flex justify-start"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>
                {formatDisplayDate(dateRange.from)} -{" "}
                {formatDisplayDate(dateRange.to)}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-3xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground mb-2">Number of Sales</div>
            <div className="text-3xl font-bold">{salesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground mb-2">Average Sale Value</div>
            <div className="text-3xl font-bold">
              {formatCurrency(
                salesCount > 0 ? totalRevenue / salesCount : 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-medium">Sales Trend</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No sales data in the selected date range
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Top Products</h3>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {product.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.totalSold} units
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(product.totalRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No product sales data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Sales Records</h3>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell>{sale.productName}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{formatCurrency(sale.unitPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(sale.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No sales found in the selected date range
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
