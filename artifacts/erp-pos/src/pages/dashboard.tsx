import { useGetDashboardStats, useGetLowStockProducts, useGetSalesByDay, useGetTopProducts, useGetCategorySales } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { Link } from "wouter";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: salesByDay, isLoading: salesLoading } = useGetSalesByDay({ days: 7 });
  const { data: topProducts, isLoading: topProductsLoading } = useGetTopProducts({ limit: 5 });
  const { data: categorySales, isLoading: categorySalesLoading } = useGetCategorySales({});

  if (statsLoading || salesLoading || topProductsLoading || categorySalesLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.todaySalesCount} sales today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.monthSalesCount} sales this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Expenses: ${stats?.monthExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className={stats?.lowStockCount && stats.lowStockCount > 0 ? "border-red-200 bg-red-50/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats?.lowStockCount && stats.lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.lowStockCount && stats.lowStockCount > 0 ? "text-red-600" : ""}`}>
              {stats?.lowStockCount || 0}
            </div>
            <Link href="/inventory" className="text-xs text-blue-600 hover:underline">
              View inventory details
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Daily Sales & Profit (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), 'MMM dd')} />
                  <YAxis />
                  <RechartsTooltip labelFormatter={(val) => format(new Date(val), 'MMM dd, yyyy')} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts?.map((product) => (
                <div key={product.productId} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.productName}</p>
                    <p className="text-sm text-muted-foreground">{product.categoryName}</p>
                  </div>
                  <div className="ml-auto font-medium">
                    {product.quantitySold} sold
                  </div>
                </div>
              ))}
              {(!topProducts || topProducts.length === 0) && (
                <div className="text-center text-muted-foreground py-4">No sales data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}