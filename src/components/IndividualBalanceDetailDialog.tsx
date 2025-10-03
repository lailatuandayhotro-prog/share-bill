import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Clock, User } from "lucide-react";

interface ContributingExpense {
  expenseId: string;
  title: string;
  amount: number; // amount for this specific participant in this expense
  date: string;
  paidBy: string; // name of the payer
}

interface IndividualBalanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string; // The person whose balance details are being shown
  expenses: ContributingExpense[];
  type: 'pay' | 'collect'; // To adjust title/description
}

const IndividualBalanceDetailDialog = ({ open, onOpenChange, personName, expenses, type }: IndividualBalanceDetailDialogProps) => {
  const title = type === 'pay' ? `Khoản bạn nợ ${personName}` : `Khoản ${personName} nợ bạn`;
  const description = type === 'pay' ? `Chi tiết các chi phí bạn cần trả cho ${personName}.` : `Chi tiết các chi phí ${personName} cần trả cho bạn.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-3 py-4">
            {expenses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Không có chi phí nào.
              </div>
            ) : (
              expenses.map((exp) => (
                <Card key={exp.expenseId} className="border-border">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-base">{exp.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Người trả: {exp.paidBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Ngày: {exp.date}</span>
                    </div>
                    <div className="text-lg font-bold text-foreground mt-2">
                      {exp.amount.toLocaleString()} đ
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default IndividualBalanceDetailDialog;