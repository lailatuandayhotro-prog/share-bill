import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Trash2, Receipt, Users } from "lucide-react";
import { toast } from "sonner";

interface Participant {
  userId?: string;
  userName?: string;
  guestId?: string;
  guestName?: string;
  amount: number;
  isPaid: boolean;
  isPayer?: boolean;
}

interface ExpenseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: {
    id: string;
    title: string;
    amount: number;
    paidBy: string;
    date: string;
    participants?: Participant[];
  } | null;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: (participantId: string) => void;
}

const ExpenseDetailDialog = ({
  open,
  onOpenChange,
  expense,
  onComplete,
  onEdit,
  onDelete,
  onMarkPaid,
}: ExpenseDetailDialogProps) => {
  if (!expense) return null;

  // Convert participants data to display format
  const participants: Participant[] = expense.participants || [];

  const handleMarkPaid = (participantId: string) => {
    onMarkPaid(participantId);
    toast.success("Đã đánh dấu đã trả!");
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Receipt className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{expense.title}</h2>
              <p className="text-white/90 text-sm">
                Được trả bởi {expense.paidBy} • {expense.date}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
            <span className="text-white/80">Tổng chia</span>
            <span className="text-3xl font-bold">
              {expense.amount.toLocaleString()} đ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 pb-4">
          <Button
            onClick={onComplete}
            className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white"
          >
            <CheckCircle2 className="w-5 h-5" />
            Hoàn Thành
          </Button>
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1 h-12"
          >
            <Edit className="w-5 h-5" />
            Sửa
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            className="flex-1 h-12 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5" />
            Xóa
          </Button>
        </div>

        {/* Participants Section */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Users className="w-5 h-5 text-primary" />
            <span>Người tham gia ({participants.length})</span>
          </div>

          <div className="space-y-3">
            {participants.length > 0 ? (
              participants.map((participant, index) => {
                const participantName = participant.userName || participant.guestName || 'Unknown';
                const participantId = participant.userId || participant.guestId || `participant-${index}`;
                
                return (
                  <div
                    key={participantId}
                    className="border border-border rounded-xl p-4 bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-blue-500">
                        {getInitials(participantName)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">
                            {participantName}
                          </span>
                          {participant.guestName && (
                            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                              Khách
                            </span>
                          )}
                          {participant.isPayer && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                              Người trả tiền
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {participant.isPayer ? (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              Đã Trả
                            </span>
                          ) : participant.isPaid ? (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              Đã Trả
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                              Chờ Trả
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount and Action */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-foreground mb-2">
                          {participant.amount.toLocaleString()} đ
                        </div>
                        
                        {!participant.isPaid && !participant.isPayer && (
                          <Button
                            onClick={() => handleMarkPaid(participantId)}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Đánh Dấu Đã Trả
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Không có người tham gia nào
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailDialog;
