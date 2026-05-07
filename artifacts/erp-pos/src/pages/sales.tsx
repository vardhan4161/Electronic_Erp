import { useState } from "react";
import { useListSales, useGetSale, useReturnSale, getListSalesQueryKey, getGetSaleQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Search, Eye, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Sales() {
  const [search, setSearch] = useState("");
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  
  const { data: sales, isLoading } = useListSales({ search });
  const { data: saleDetail, isLoading: detailLoading } = useGetSale(selectedSaleId || 0, { query: { enabled: !!selectedSaleId, queryKey: getGetSaleQueryKey(selectedSaleId || 0) } });
  
  const returnMut = useReturnSale();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleReturn = (saleId: number) => {
    if (!saleDetail) return;
    
    // Simplified: return all items
    const itemIds = saleDetail.items.map(i => i.id);
    
    returnMut.mutate({
      id: saleId,
      data: {
        reason: "Customer requested return",
        itemIds
      }
    }, {
      onSuccess: () => {
        toast({ title: "Sale returned successfully" });
        queryClient.invalidateQueries({ queryKey: getGetSaleQueryKey(saleId) });
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales History</h2>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-9" 
            placeholder="Search by invoice or customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-4">Loading...</TableCell></TableRow>
            ) : sales?.map((sale) => (
              <TableRow key={sale.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedSaleId(sale.id)}>
                <TableCell className="font-medium text-primary">{sale.invoiceNumber}</TableCell>
                <TableCell>{format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell>{sale.customerName || 'Walk-in'}</TableCell>
                <TableCell>{sale.paymentMethod}</TableCell>
                <TableCell className="text-right font-semibold">${sale.grandTotal.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {sale.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSaleId(sale.id); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sales?.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-4">No sales found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedSaleId} onOpenChange={(open) => !open && setSelectedSaleId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sale Details - {saleDetail?.sale.invoiceNumber}</DialogTitle>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="py-8 text-center">Loading details...</div>
          ) : saleDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-md">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <div className="font-medium">{format(new Date(saleDetail.sale.createdAt), 'PPpp')}</div>
                </div>
                <div>
                  <span className="text-gray-500">Customer:</span>
                  <div className="font-medium">{saleDetail.sale.customerName || 'Walk-in Customer'}</div>
                  {saleDetail.sale.customerPhone && <div className="text-gray-500">{saleDetail.sale.customerPhone}</div>}
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${saleDetail.sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {saleDetail.sale.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saleDetail.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-xs text-gray-500">{item.productSku}</div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.gstAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">${item.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>${saleDetail.sale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount:</span>
                    <span>-${saleDetail.sale.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax:</span>
                    <span>${saleDetail.sale.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${saleDetail.sale.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {saleDetail?.sale.status === 'COMPLETED' ? (
              <Button variant="destructive" onClick={() => handleReturn(saleDetail.sale.id)} disabled={returnMut.isPending}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Return Sale
              </Button>
            ) : <div />}
            <Button variant="outline" onClick={() => setSelectedSaleId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}