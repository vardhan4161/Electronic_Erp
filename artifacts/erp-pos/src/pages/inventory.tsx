import { useState } from "react";
import { useListStockMovements, useCreateStockMovement, useGetLowStockProducts, useListProducts, getListStockMovementsQueryKey, getGetLowStockProductsQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CreateStockMovementBodyMovementType } from "@workspace/api-client-react";

export default function Inventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    productId: string;
    movementType: CreateStockMovementBodyMovementType | "";
    quantity: string;
    reference: string;
    notes: string;
  }>({
    productId: "",
    movementType: "",
    quantity: "",
    reference: "",
    notes: ""
  });

  const { data: movements, isLoading } = useListStockMovements({});
  const { data: products } = useListProducts({});
  const { data: lowStockProducts } = useGetLowStockProducts({});
  
  const createMut = useCreateStockMovement();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.productId || !formData.movementType || !formData.quantity) return;

    createMut.mutate({
      data: {
        productId: Number(formData.productId),
        movementType: formData.movementType as CreateStockMovementBodyMovementType,
        quantity: Number(formData.quantity),
        reference: formData.reference,
        notes: formData.notes
      }
    }, {
      onSuccess: () => {
        toast({ title: "Stock movement recorded" });
        setIsModalOpen(false);
        setFormData({ productId: "", movementType: "", quantity: "", reference: "", notes: "" });
        queryClient.invalidateQueries({ queryKey: getListStockMovementsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLowStockProductsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Record Movement
        </Button>
      </div>

      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" /> Low Stock Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map(p => (
              <div key={p.id} className="bg-white p-3 rounded shadow-sm border border-red-100 flex justify-between items-center">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.sku}</div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold">{p.currentStock} left</div>
                  <div className="text-xs text-gray-500">Reorder: {p.reorderLevel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Previous</TableHead>
              <TableHead className="text-right">New</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-4">Loading...</TableCell></TableRow>
            ) : movements?.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{format(new Date(m.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell>
                  <div className="font-medium">{m.productName}</div>
                  <div className="text-xs text-gray-500">{m.productSku}</div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    m.movementType === 'PURCHASE' ? 'bg-blue-100 text-blue-800' :
                    m.movementType === 'SALE' ? 'bg-green-100 text-green-800' :
                    m.movementType === 'RETURN' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {m.movementType}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {m.movementType === 'SALE' || (m.movementType === 'ADJUSTMENT' && m.quantity < 0) ? '-' : '+'}{Math.abs(m.quantity)}
                </TableCell>
                <TableCell className="text-right text-gray-500">{m.previousStock}</TableCell>
                <TableCell className="text-right font-medium">{m.newStock}</TableCell>
                <TableCell className="text-sm text-gray-500">{m.reference}</TableCell>
              </TableRow>
            ))}
            {movements?.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-4">No stock movements found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={formData.productId} onValueChange={v => setFormData({...formData, productId: v})}>
                <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                <SelectContent>
                  {products?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Movement Type</Label>
              <Select value={formData.movementType} onValueChange={v => setFormData({...formData, movementType: v as any})}>
                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE">Purchase (Add Stock)</SelectItem>
                  <SelectItem value="RETURN">Return (Add Stock)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment (Use negative for deduction)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="e.g. 10 or -5 for adjustment" />
            </div>
            <div className="space-y-2">
              <Label>Reference (Optional)</Label>
              <Input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="PO number, etc." />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}