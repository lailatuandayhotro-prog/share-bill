import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

interface BalanceItem {
  id: string; // user ID or guest ID
  name: string;
  amount: number; // positive for money owed to current user, negative for money current user owes
  avatarUrl?: string;
  isGuest?: boolean;
}

interface BalanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  balances: BalanceItem[];
  currentUserId: string;
}

const BalanceDetailDialog = ({ open, onOpenChange, title, description, balances, currentUserId }: BalanceDetailDialogProps) => {
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 py-4">
            {balances.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Không có khoản nào cần hiển thị.
              </div>
            ) : (
              balances.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.avatarUrl} alt={item.name} />
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{item.name}</div>
                    {item.isGuest && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                        Khách
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.amount.toLocaleString()} đ
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-sm ${item.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.amount > 0 ? (
                        <>
                          <ArrowDownLeft className="w-4 h-4" />
                          <span>Cần thu</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-4 h-4" />
                          <span>Cần trả</span>
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