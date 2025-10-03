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
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col p-4"> {/* Reduced max-w, padding, and added flex-col */}
        <DialogHeader className="pb-2"> {/* Reduced padding */}
          <DialogTitle className="text-xl">{title}</DialogTitle> {/* Reduced font size */}
          <DialogDescription className="text-sm">{description}</DialogDescription> {/* Reduced font size */}
        </DialogHeader>

        <ScrollArea className="flex-1 pr-3 -mr-3"> {/* Reduced padding */}
          <div className="space-y-2 py-2"> {/* Reduced space-y and padding */}
            {expenses.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 text-sm"> {/* Reduced padding and font size */}
                Không có chi phí nào.
              </div>
            ) : (
              expenses.map((exp) => (
                <Card key={exp.expenseId} className="border-border">
                  <CardContent className="p-3 space-y-1.5"> {/* Reduced padding and space-y */}
                    <h3 className="font-semibold text-base">{exp.title}</h3> {/* Reduced font size */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"> {/* Reduced gap and font size */}
                      <User className="w-3.5 h-3.5" /> {/* Reduced size */}
                      <span>Người trả: {exp.paidBy}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"> {/* Reduced gap and font size */}
                      <Clock className="w-3.5 h-3.5" /> {/* Reduced size */}
                      <span>Ngày: {exp.date}</span>
                    </div>
                    <div className="text-base font-bold text-foreground mt-1.5"> {/* Reduced font size and margin */}
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