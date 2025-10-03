import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Trash2, Receipt, Users, RotateCcw, Loader2 } from "lucide-react";
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
    receiptUrl?: string;
  } | null;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: (participantId: string, currentIsPaid: boolean, isGuest: boolean) => void;
  isMarkingPaid: boolean;
}

const ExpenseDetailDialog = ({
  open,
  onOpenChange,
  expense,
  onComplete,
  onEdit,
  onDelete,
  onMarkPaid,
  isMarkingPaid,
}: ExpenseDetailDialogProps) => {
  if (!expense) return null;

  const participants: Participant[] = expense.participants || [];

  const handleMarkPaidToggle = (participantId: string, currentIsPaid: boolean, isGuest: boolean) => {
    onMarkPaid(participantId, currentIsPaid, isGuest);
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden"> {/* Adjusted max-w-2xl to max-w-xl */}
        <DialogHeader className="sr-only">
          <DialogTitle>Chi tiết chi phí: {expense.title}</DialogTitle>
          <DialogDescription>Hóa đơn và người tham gia</DialogDescription>
        </DialogHeader>
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white p-4 space-y-3"> {/* Adjusted p-6 to p-4, space-y-4 to space-y-3 */}
          <div className="flex items-start gap-3"> {/* Adjusted gap-4 to gap-3 */}
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"> {/* Adjusted w-14 h-14 to w-12 h-12 */}
              <Receipt className="w-6 h-6 text-white" /> {/* Adjusted w-7 h-7 to w-6 h-6 */}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{expense.title}</h2> {/* Adjusted text-2xl to text-xl, mb-2 to mb-1 */}
              <p className="text-white/90 text-xs"> {/* Adjusted text-sm to text-xs */}
                Được trả bởi {expense.paidBy} • {expense.date}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between"> {/* Adjusted rounded-2xl to rounded-xl, p-4 to p-3 */}
            <span className="text-white/80 text-sm">Tổng chia</span> {/* Added text-sm */}
            <span className="text-2xl font-bold"> {/* Adjusted text-3xl to text-2xl */}
              {expense.amount.toLocaleString()} đ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-4 pb-3"> {/* Adjusted p-6 pb-4 to p-4 pb-3, gap-3 to gap-2 */}
          <Button
            onClick={onComplete}
            className="flex-1 h-10 bg-green-500 hover:bg-green-600 text-white text-sm" // Adjusted h-12 to h-10, added text-sm
          >
            <CheckCircle2 className="w-4 h-4 mr-1" /> {/* Adjusted w-5 h-5 to w-4 h-4 */}
            Hoàn Thành
          </Button>
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1 h-10 text-sm" // Adjusted h-12 to h-10, added text-sm
          >
            <Edit className="w-4 h-4 mr-1" /> {/* Adjusted w-5 h-5 to w-4 h-4 */}
            Sửa
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            className="flex-1 h-10 text-red-500 hover:text-red-600 hover:bg-red-50 text-sm" // Adjusted h-12 to h-10, added text-sm
          >
            <Trash2 className="w-4 h-4 mr-1" /> {/* Adjusted w-5 h-5 to w-4 h-4 */}
            Xóa
          </Button>
        </div>

        {/* Participants Section */}
        <div className="px-4 pb-4 space-y-3"> {/* Adjusted px-6 pb-6 to px-4 pb-4, space-y-4 to space-y-3 */}
          <div className="flex items-center gap-2 text-base font-semibold"> {/* Adjusted text-lg to text-base */}
            <Users className="w-4 h-4 text-primary" /> {/* Adjusted w-5 h-5 to w-4 h-4 */}
            <span>Người tham gia ({participants.length})</span>
          </div>

          <div className="space-y-2"> {/* Adjusted space-y-3 to space-y-2 */}
            {participants.length > 0 ? (
              participants.map((participant, index) => {
                const participantName = participant.userName || participant.guestName || 'Unknown';
                const participantId = participant.userId || participant.guestId || `participant-${index}`;
                
                return (
                  <div
                    key={participantId}
                    className="border border-border rounded-lg p-3 bg-card hover:shadow-md transition-shadow" // Adjusted rounded-xl to rounded-lg, p-4 to p-3
                  >
                    <div className="flex items-center gap-3"> {/* Adjusted gap-4 to gap-3 */}
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 bg-blue-500"> {/* Adjusted w-12 h-12 to w-10 h-10, text-lg to text-base */}
                        {getInitials(participantName)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5"> {/* Adjusted gap-2 to gap-1, mb-1 to mb-0.5 */}
                          <span className="font-medium text-sm text-foreground"> {/* Adjusted font-semibold to font-medium, added text-sm */}
                            {participantName}
                          </span>
                          {participant.guestName && (
                            <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs"> {/* Adjusted px-2 to px-1.5 */}
                              Khách
                            </span>
                          )}
                          {participant.isPayer && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium"> {/* Adjusted px-2 to px-1.5 */}
                              Người trả tiền
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1"> {/* Adjusted gap-2 to gap-1 */}
                          {participant.isPayer ? (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"> {/* Adjusted px-3 to px-2 */}
                              Đã Trả
                            </span>
                          ) : participant.isPaid ? (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"> {/* Adjusted px-3 to px-2 */}
                              Đã Trả
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium"> {/* Adjusted px-3 to px-2 */}
                              Chờ Trả
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount and Action */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-foreground mb-1"> {/* Adjusted text-xl to text-lg, mb-2 to mb-1 */}
                          {participant.amount.toLocaleString()} đ
                        </div>
                        
                        {!participant.isPayer && (
                          <Button
                            onClick={() => handleMarkPaidToggle(participantId, participant.isPaid, !!participant.guestName)}
                            size="sm"
                            className={participant.isPaid ? "bg-red-500 hover:bg-red-600 text-white text-xs" : "bg-blue-500 hover:bg-blue-600 text-white text-xs"} // Added text-xs
                            disabled={isMarkingPaid}
                          >
                            {isMarkingPaid ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> {/* Adjusted w-4 h-4 to w-3 h-3 */}
                            ) : participant.isPaid ? (
                              <RotateCcw className="w-3 h-3 mr-1" /> {/* Adjusted w-4 h-4 to w-3 h-3 */}
                            ) : (
                              <CheckCircle2 className="w-3 h-3 mr-1" /> {/* Adjusted w-4 h-4 to w-3 h-3 */}
                            )}
                            {isMarkingPaid ? "Đang cập nhật..." : (participant.isPaid ? "Đánh Dấu Chưa Trả" : "Đánh Dấu Đã Trả")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm"> {/* Adjusted py-8 to py-6, added text-sm */}
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