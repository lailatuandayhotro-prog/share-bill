import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Clock, User, QrCode } from "lucide-react"; // Import QrCode icon
import { Button } from "@/components/ui/button"; // Import Button component

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
  personBankAccountNumber?: string; // New prop for bank account number
  personBankName?: string; // New prop for bank name
  onShowQrCode: (bankAccountNumber: string, bankName: string, amount: number, description: string, accountName: string, personName: string) => void; // New callback
  formattedMonthYear: string; // New prop
}

const IndividualBalanceDetailDialog = ({ 
  open, 
  onOpenChange, 
  personName, 
  expenses, 
  type, 
  personBankAccountNumber, 
  personBankName, 
  onShowQrCode,
  formattedMonthYear // Accept new prop
}: IndividualBalanceDetailDialogProps) => {
  const title = type === 'pay' ? `Khoản bạn nợ ${personName}` : `Khoản ${personName} nợ bạn`;
  const description = type === 'pay' ? `Chi tiết các chi phí bạn cần trả cho ${personName}.` : `Chi tiết các chi phí ${personName} cần trả cho bạn.`;

  const handleShowQrCode = (expense: ContributingExpense) => {
    if (personBankAccountNumber && personBankName) {
      const qrDescription = `TT tháng ${formattedMonthYear}`; // Modified here
      onShowQrCode(personBankAccountNumber, personBankName, Math.floor(expense.amount), qrDescription, personName, personName); // Ensure no decimals
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col p-0 overflow-hidden"> {/* Added overflow-hidden */}
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base sm:text-xl">{title}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-2 px-4 py-2 pb-4">
            {expenses.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 text-sm">
                Không có chi phí nào.
              </div>
            ) : (
              expenses.map((exp) => (
                <Card key={exp.expenseId} className="border-border">
                  <CardContent className="p-3 space-y-1.5">
                    <h3 className="font-semibold text-sm sm:text-base">{exp.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      <span>Người trả: {exp.paidBy}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ngày: {exp.date}</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-foreground mt-1.5">
                      {Math.floor(exp.amount).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} đ
                    </div>
                    {type === 'pay' && personBankAccountNumber && personBankName && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 h-8 text-xs"
                        onClick={() => handleShowQrCode(exp)}
                      >
                        <QrCode className="w-3.5 h-3.5 mr-1" />
                        Chuyển khoản
                      </Button>
                    )}
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