import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner"; // Import toast for error messages

interface ContributingExpense {
  expenseId: string;
  title: string;
  amount: number; // amount for this specific participant in this expense
  date: string;
  paidBy: string; // name of the payer
}

interface BalanceItem {
  id: string; // user ID or guest ID
  name: string;
  amount: number; // positive for money owed to current user, negative for money current user owes
  avatarUrl?: string;
  isGuest?: boolean;
  contributingExpenses: ContributingExpense[]; // New field
  bankAccountNumber?: string; // Add bank account number
  bankName?: string; // Add bank name
}

interface BalanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  balances: BalanceItem[];
  currentUserId: string;
  onViewIndividualBalance: (personName: string, expenses: ContributingExpense[], type: 'pay' | 'collect', bankAccountNumber?: string, bankName?: string) => void; // Updated callback
  onShowQrCodeForTotal: (bankAccountNumber: string, bankName: string, amount: number, description: string, accountName: string, personName: string) => void; // New callback
  type: 'pay' | 'collect'; // New prop to pass down
  formattedMonthYear: string; // New prop
}

const BalanceDetailDialog = ({ open, onOpenChange, title, description, balances, currentUserId, onViewIndividualBalance, onShowQrCodeForTotal, type, formattedMonthYear }: BalanceDetailDialogProps) => {
  const { user } = useAuth();

  const handleItemClick = (item: BalanceItem) => {
    if (type === 'pay') {
      // For 'pay' type, clicking the item should show the QR for the total amount
      if (item.bankAccountNumber && item.bankName) {
        const qrDescription = `TT tháng ${formattedMonthYear}`; // Modified here
        onShowQrCodeForTotal(item.bankAccountNumber, item.bankName, item.amount, qrDescription, item.name, item.name);
      } else {
        toast.error(`Không có thông tin ngân hàng cho ${item.name}. Vui lòng cập nhật thông tin cá nhân của họ.`);
      }
    } else {
      // For 'collect' type, clicking the item should show individual balance details
      onViewIndividualBalance(item.name, item.contributingExpenses, type, item.bankAccountNumber, item.bankName);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base sm:text-xl">{title}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1"> {/* Removed h-full */}
          <div className="space-y-3 px-4 py-2">
            {balances.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 text-sm">
                Không có khoản nào cần hiển thị.
              </div>
            ) : (
              balances.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleItemClick(item)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={item.avatarUrl} alt={item.name} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{item.name}</div>
                    {item.isGuest && (
                      <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                        Khách
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-base sm:text-lg ${type === 'pay' ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.floor(item.amount).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} đ
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-xs ${type === 'pay' ? 'text-red-500' : 'text-green-500'}`}>
                      {type === 'pay' ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Cần trả</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>Cần thu</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BalanceDetailDialog;