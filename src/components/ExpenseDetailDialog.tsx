import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Trash2, Receipt, Users, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Participant {
  userId?: string;
  userName?: string;
  guestId?: string; // ID for unabsorbed guest from expense_participants
  guestName?: string; // Name for unabsorbed guest from expense_participants
  amount: number;
  isPaid: boolean;
  isPayer?: boolean;
}

interface Guest {
  id: string;
  name: string;
  responsibleMemberId?: string; // Optional: if a member pays for this guest
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
    participants?: Participant[]; // These are entries from expense_participants (members or unabsorbed guests)
    receiptUrl?: string;
    guests?: Guest[]; // Full guest list with responsibleMemberId
  } | null;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: (participantId: string, currentIsPaid: boolean, isGuest: boolean) => void;
  isMarkingPaid: boolean;
  isDeletingExpense: boolean; // New prop for delete loading state
  isExpenseCreator: boolean; // New prop to indicate if current user is the expense creator
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
  isDeletingExpense,
  isExpenseCreator, // Destructure new prop
}: ExpenseDetailDialogProps) => {
  if (!expense) return null;

  const participants: Participant[] = expense.participants || [];
  const guests: Guest[] = expense.guests || [];

  const handleMarkPaidToggle = (participantId: string, currentIsPaid: boolean, isGuest: boolean) => {
    onMarkPaid(participantId, currentIsPaid, isGuest);
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Group guests by their responsible member
  const memberToGuestsMap = new Map<string, Guest[]>();
  guests.forEach(guest => {
    if (guest.responsibleMemberId) {
      if (!memberToGuestsMap.has(guest.responsibleMemberId)) {
        memberToGuestsMap.set(guest.responsibleMemberId, []);
      }
      memberToGuestsMap.get(guest.responsibleMemberId)?.push(guest);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden"> {/* Reduced max-w */}
        <DialogHeader className="sr-only">
          <DialogTitle>Chi tiết chi phí: {expense.title}</DialogTitle>
          <DialogDescription>Hóa đơn và người tham gia</DialogDescription>
        </DialogHeader>
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 text-white p-3 space-y-2"> {/* Reduced padding and space-y */}
          <div className="flex items-start gap-2"> {/* Reduced gap */}
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"> {/* Smaller icon container */}
              <Receipt className="w-5 h-5 text-white" /> {/* Smaller icon */}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-0.5">{expense.title}</h2> {/* Reduced font size */}
              <p className="text-white/90 text-xs">
                Được trả bởi {expense.paidBy} • {expense.date}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center justify-between"> {/* Reduced border radius and padding */}
            <span className="text-white/80 text-sm">Tổng chia</span>
            <span className="text-xl font-bold"> {/* Reduced font size */}
              {expense.amount.toLocaleString()} đ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-3 pb-2"> {/* Reduced gap and padding */}
          <Button
            onClick={onComplete}
            className="flex-1 h-9 bg-green-500 hover:bg-green-600 text-white text-xs"
            disabled={!isExpenseCreator} // Disable if not the creator
            /* Reduced height and font size */
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {/* Smaller icon */}
            Hoàn Thành
          </Button>
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1 h-9 text-xs"
            disabled={!isExpenseCreator} // Disable if not the creator
            /* Reduced height and font size */
          >
            <Edit className="w-3.5 h-3.5 mr-1" /> {/* Smaller icon */}
            Sửa
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            className="flex-1 h-9 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
            /* Reduced height and font size */
            disabled={isDeletingExpense || !isExpenseCreator} // Disable button when deleting or if not creator
          >
            {isDeletingExpense ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> /* Smaller icon */
            ) : (
              <Trash2 className="w-3.5 h-3.5 mr-1" /> /* Smaller icon */
            )}
            {isDeletingExpense ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>

        {/* Participants Section */}
        <div className="px-3 pb-3 space-y-2"> {/* Reduced padding and space-y */}
          <div className="flex items-center gap-1.5 text-sm font-semibold"> {/* Reduced font size and gap */}
            <Users className="w-3.5 h-3.5 text-primary" /> {/* Smaller icon */}
            <span>Người tham gia ({participants.length + guests.filter(g => !g.responsibleMemberId).length})</span>
          </div>

          <div className="space-y-1.5"> {/* Reduced space-y */}
            {participants.length === 0 && guests.filter(g => !g.responsibleMemberId).length === 0 ? (
              <div className="text-center py-5 text-muted-foreground text-sm"> {/* Reduced padding and font size */}
                Không có người tham gia nào
              </div>
            ) : (
              <>
                {participants.map((participant) => {
                  const isMember = !!participant.userId;
                  const name = isMember ? participant.userName : participant.guestName;
                  const id = isMember ? participant.userId : participant.guestId;
                  const responsibleGuests = isMember ? memberToGuestsMap.get(participant.userId!) || [] : [];

                  return (
                    <div
                      key={id}
                      className="border border-border rounded-lg p-2.5 bg-card hover:shadow-md transition-shadow"
                      /* Reduced padding */
                    >
                      <div className="flex items-start gap-2.5"> {/* Reduced gap */}
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-blue-500"> {/* Smaller avatar and font size */}
                          {getInitials(name || 'U')}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="font-medium text-sm text-foreground"> {/* Reduced font size */}
                              {name}
                            </span>
                            {participant.isPayer && (
                              <span className="px-1 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                                Người trả tiền
                              </span>
                            )}
                            {!isMember && (
                              <span className="px-1 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                                Khách
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {participant.isPayer ? (
                              <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                Đã Trả
                              </span>
                            ) : participant.isPaid ? (
                              <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                Đã Trả
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                Chờ Trả
                              </span>
                            )}
                          </div>
                          {responsibleGuests.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-0.5"> {/* Reduced font size and margin */}
                              Trả hộ cho: {responsibleGuests.map(g => g.name).join(', ')}
                            </div>
                          )}
                        </div>

                        {/* Amount and Action */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-base font-bold text-foreground mb-0.5"> {/* Reduced font size */}
                            {participant.amount.toLocaleString()} đ
                          </div>
                          
                          {!participant.isPayer && (
                            <Button
                              onClick={() => handleMarkPaidToggle(id!, participant.isPaid, !isMember)}
                              size="sm"
                              className={participant.isPaid ? "bg-red-500 hover:bg-red-600 text-white text-xs h-7 px-2" : "bg-blue-500 hover:bg-blue-600 text-white text-xs h-7 px-2"}
                              /* Reduced height, padding and font size */
                              disabled={isMarkingPaid || !isExpenseCreator} // Disable if marking paid or not creator
                            >
                              <span>
                                {isMarkingPaid ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> /* Smaller icon */
                                ) : participant.isPaid ? (
                                  <RotateCcw className="w-3 h-3 mr-1" /> /* Smaller icon */
                                ) : (
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> /* Smaller icon */
                                )}
                                {isMarkingPaid ? "Đang cập nhật..." : (participant.isPaid ? "Đánh Dấu Chưa Trả" : "Đánh Dấu Đã Trả")}
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailDialog;