import { useState } from "react";
import { useListExpenses, useCreateExpense, useDeleteExpense, getListExpensesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Expenses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    reference: ""
  });
  
  const { data: expenses, isLoading } = useListExpenses({});
  const createMut = useCreateExpense();
  const deleteMut = useDeleteExpense();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleOpenModal = () => {
    setFormData({
      category: "",
      description: "",
      amount: "",
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      reference: ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    createMut.mutate({
      data: {
        ...formData,
        amount: Number(formData.amount)
      }
    }, {
      onSuccess: () => {
        toast({ title: "Expense recorded" });
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteMut.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Expense deleted" });
          queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" /> Record Expense
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-4">Loading...</TableCell></TableRow>
            ) : expenses?.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="font-medium">{expense.category}</TableCell>
                <TableCell className="text-gray-600">{expense.description}</TableCell>
                <TableCell>{expense.paymentMethod}</TableCell>
                <TableCell className="text-gray-500 text-sm">{expense.reference}</TableCell>
                <TableCell className="text-right font-semibold">${expense.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(expense.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {expenses?.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-4">No expenses found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Utilities, Rent, Supplies" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={v => setFormData({...formData, paymentMethod: v})}>
                <SelectTrigger><SelectValue placeholder="Select Method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="Receipt/Invoice number" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending}>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}