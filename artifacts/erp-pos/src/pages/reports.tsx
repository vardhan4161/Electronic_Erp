import { useGetGstReport, useGetProfitLoss, useGetCategorySales } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Reports() {
  const { data: gstReport, isLoading: gstLoading } = useGetGstReport({});
  const { data: profitLoss, isLoading: plLoading } = useGetProfitLoss({});
  const { data: categorySales, isLoading: catLoading } = useGetCategorySales({});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
      </div>

      <Tabs defaultValue="pl" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="gst">GST Report</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pl" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>Overview of revenue, costs, and margins</CardDescription>
            </CardHeader>
            <CardContent>
              {plLoading ? <div className="py-8 text-center">Loading...</div> : profitLoss ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
                      <div className="text-2xl font-bold text-blue-900">${profitLoss.revenue.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="text-sm text-orange-600 font-medium">Cost of Goods Sold</div>
                      <div className="text-2xl font-bold text-orange-900">${profitLoss.costOfGoods.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-sm text-green-600 font-medium">Gross Profit</div>
                      <div className="text-2xl font-bold text-green-900">${profitLoss.grossProfit.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-sm text-red-600 font-medium">Total Expenses</div>
                      <div className="text-2xl font-bold text-red-900">${profitLoss.totalExpenses.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 shadow-sm">
                      <div className="text-sm text-emerald-700 font-medium">Net Profit</div>
                      <div className="text-3xl font-bold text-emerald-900">${profitLoss.netProfit.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex gap-8 border-t pt-4">
                    <div>
                      <div className="text-sm text-gray-500">Gross Margin</div>
                      <div className="text-lg font-semibold">{profitLoss.grossMargin.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net Margin</div>
                      <div className="text-lg font-semibold">{profitLoss.netMargin.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>GST Tax Summary</CardTitle>
              <CardDescription>Breakdown of collected taxes</CardDescription>
            </CardHeader>
            <CardContent>
              {gstLoading ? <div className="py-8 text-center">Loading...</div> : gstReport ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-500">Total Taxable Sales</div>
                    <div className="text-2xl font-bold">${gstReport.totalSales.toFixed(2)}</div>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-500">Total CGST</div>
                    <div className="text-2xl font-bold">${gstReport.totalCgst.toFixed(2)}</div>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-500">Total SGST</div>
                    <div className="text-2xl font-bold">${gstReport.totalSgst.toFixed(2)}</div>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-500">Total IGST</div>
                    <div className="text-2xl font-bold">${gstReport.totalIgst.toFixed(2)}</div>
                  </div>
                  <div className="col-span-full p-4 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="text-sm text-primary font-medium">Total Tax Liability</div>
                    <div className="text-3xl font-bold text-primary">${gstReport.totalTax.toFixed(2)}</div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {catLoading ? <div className="py-8 text-center">Loading...</div> : categorySales ? (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full md:w-1/2 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySales}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="revenue"
                          nameKey="categoryName"
                        >
                          {categorySales.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    {categorySales.map((cat, idx) => (
                      <div key={cat.categoryId} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <span className="font-medium">{cat.categoryName}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${cat.revenue.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{cat.percentage.toFixed(1)}% ({cat.quantitySold} items)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}