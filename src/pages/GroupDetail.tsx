import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import ExpenseDetailDialog from "@/components/ExpenseDetailDialog";
import EditExpenseDialog from "@/components/EditExpenseDialog";
import InviteMemberDialog from "@/components/InviteMemberDialog"; // New import
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DollarSign,
  ArrowLeft,
  Plus,
  Share2,
  Settings,
  Receipt,
  Users,
  Clock,
  User,
  Eye,
  FileText,
  CheckCircle2,
  MessageCircle,
  Crown,
  Filter,
  Pencil,
  ChevronRight,
  Copy,
  Check,
  UserPlus, // New icon for invite
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Participant {
  userId?: string;
  userName?: string;
  guestId?: string;
  guestName?: string;
  amount: number;
  isPaid: boolean;
  isPayer?: boolean;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  paidById: string;
  splitWith: string[];
  date: string;
  isCompleted: boolean;
  isMine: boolean;
  participants: Participant[];
  receiptUrl?: string;
  description?: string;
  splitType?: string;
  guests?: Array<{ id: string; name: string }>;
}

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openExpenseDetail, setOpenExpenseDetail] = useState(false);
  const [openEditExpense, setOpenEditExpense] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openInviteMemberDialog, setOpenInviteMemberDialog] = useState(false); // New state for invite dialog
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [shareCode, setShareCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [groupName, setGroupName] = useState("Test");
  const [isEditingName, setIsEditingName] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load group data
  useEffect(() => {
    if (!id || !user) return;
    loadGroupData();
  }, [id, user]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      
      // Load group info
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('name')
        .eq('id', id)
        .single();
      
      if (groupError) throw groupError;
      if (groupData) setGroupName(groupData.name);

      // Load member IDs
      const { data: memberIds, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', id);
      
      if (membersError) throw membersError;

      // Load profiles for these members
      const userIds = memberIds?.map(m => m.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      const formattedMembers = profilesData?.map(p => ({
        id: p.id,
        name: p.full_name
      })) || [];
      
      setMembers(formattedMembers);

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_participants(*)
        `)
        .eq('group_id', id)
        .order('created_at', { ascending: false });
      
      if (expensesError) throw expensesError;

      const formattedExpenses = expensesData?.map(exp => {
        const payer = formattedMembers.find(m => m.id === exp.paid_by);
        const participants = exp.expense_participants.map((p: any) => ({
          userId: p.user_id,
          userName: formattedMembers.find(m => m.id === p.user_id)?.name,
          guestId: p.guest_name ? p.id : undefined, // Use participant ID for guest ID
          guestName: p.guest_name,
          amount: p.amount,
          isPaid: p.is_paid,
          isPayer: p.user_id === exp.paid_by
        }));

        const guests = participants
          .filter(p => p.guestName)
          .map(p => ({ id: p.guestId!, name: p.guestName! }));

        return {
          id: exp.id,
          title: exp.title,
          description: exp.description || exp.title,
          amount: exp.amount,
          paidBy: payer?.name || 'Unknown',
          paidById: exp.paid_by,
          splitWith: participants.map(p => p.userName || p.guestName).filter(Boolean) as string[],
          date: new Date(exp.expense_date).toLocaleDateString('vi-VN'),
          isCompleted: exp.is_completed,
          isMine: exp.paid_by === user?.id,
          participants,
          receiptUrl: exp.receipt_url,
          splitType: exp.split_type || 'equal',
          guests,
        };
      }) || [];

      setExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error loading group data:', error);
      toast.error('Không thể tải dữ liệu nhóm');
    } finally {
      setLoading(false);
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const completedCount = expenses.filter((e) => e.isCompleted).length;

  // Calculate amount to pay (money current user owes to others)
  const amountToPay = expenses.reduce((sum, exp) => {
    const myParticipant = exp.participants.find(
      p => p.userId === user?.id && !p.isPayer && !p.isPaid
    );
    return sum + (myParticipant?.amount || 0);
  }, 0);

  // Calculate amount to collect (money others owe to current user)
  const amountToCollect = expenses.reduce((sum, exp) => {
    if (exp.paidById === user?.id) {
      const unpaidAmount = exp.participants
        .filter(p => !p.isPaid && !p.isPayer)
        .reduce((total, p) => total + p.amount, 0);
      return sum + unpaidAmount;
    }
    return sum;
  }, 0);

  const handleAddExpense = async (expenseData: any) => {
    if (!id || !user) return;

    try {
      let receiptUrl = null;

      // Upload receipt image if exists
      if (expenseData.receiptImage) {
        const fileExt = expenseData.receiptImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, expenseData.receiptImage);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Không thể tải lên ảnh hóa đơn');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName);
          receiptUrl = publicUrl;
        }
      }

      // Insert expense
      const { data: newExpense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id: id,
          title: expenseData.description,
          description: expenseData.description,
          amount: expenseData.amount,
          paid_by: expenseData.paidBy,
          expense_date: expenseData.date,
          split_type: 'equal',
          receipt_url: receiptUrl
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Insert participants
      const participantsToInsert = expenseData.participants.map((p: any) => ({
        expense_id: newExpense.id,
        user_id: p.userId,
        guest_name: p.guestName,
        amount: p.amount,
        is_paid: false
      }));

      const { error: participantsError } = await supabase
        .from('expense_participants')
        .insert(participantsToInsert);

      if (participantsError) throw participantsError;

      // Reload expenses
      await loadGroupData();

      // Show success message
      const totalParticipants = expenseData.participants.length;
      if (totalParticipants > 0) {
        const amountPerPerson = expenseData.participants[0]?.amount || 0;
        toast.success(
          `Chi phí đã thêm! Mỗi người phải trả: ${amountPerPerson.toLocaleString()} đ`
        );
      } else {
        toast.success("Thêm chi phí thành công!");
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Không thể thêm chi phí');
    }
  };

  const handleUpdateExpense = async (expenseId: string, updatedExpenseData: any) => {
    if (!id || !user) return;

    try {
      let receiptUrl = updatedExpenseData.receiptUrl; // Keep existing URL if not changed

      // Handle receipt image update
      if (updatedExpenseData.receiptImage instanceof File) {
        // Delete old receipt if exists
        if (selectedExpense?.receiptUrl) {
          const oldFileName = selectedExpense.receiptUrl.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('receipts').remove([`${user.id}/${oldFileName}`]);
          }
        }

        // Upload new receipt image
        const fileExt = updatedExpenseData.receiptImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, updatedExpenseData.receiptImage);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Không thể tải lên ảnh hóa đơn mới');
          return; // Stop if upload fails
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName);
          receiptUrl = publicUrl;
        }
      } else if (updatedExpenseData.receiptImage === null && selectedExpense?.receiptUrl) {
        // User explicitly removed the receipt image
        const oldFileName = selectedExpense.receiptUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('receipts').remove([`${user.id}/${oldFileName}`]);
        }
        receiptUrl = null;
      }

      // Update expense
      const { error: expenseError } = await supabase
        .from('expenses')
        .update({
          title: updatedExpenseData.description,
          description: updatedExpenseData.description,
          amount: updatedExpenseData.amount,
          paid_by: updatedExpenseData.paidBy,
          expense_date: updatedExpenseData.date,
          split_type: updatedExpenseData.splitType,
          receipt_url: receiptUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId);

      if (expenseError) throw expenseError;

      // Delete existing participants and insert new ones
      await supabase.from('expense_participants').delete().eq('expense_id', expenseId);

      const participantsToInsert = updatedExpenseData.participants.map((p: any) => ({
        expense_id: expenseId,
        user_id: p.userId,
        guest_name: p.guestName,
        amount: p.amount,
        is_paid: p.isPaid // Preserve paid status
      }));

      const { error: participantsError } = await supabase
        .from('expense_participants')
        .insert(participantsToInsert);

      if (participantsError) throw participantsError;

      await loadGroupData();
      toast.success("Cập nhật chi phí thành công!");
      setOpenEditExpense(false);
      setExpenseToEdit(null);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Không thể cập nhật chi phí');
    }
  };

  const handleCompleteExpense = async (expenseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ is_completed: !currentStatus })
        .eq('id', expenseId);

      if (error) throw error;

      await loadGroupData();
      toast.success("Đã cập nhật trạng thái chi phí!");
    } catch (error) {
      console.error('Error updating expense completion status:', error);
      toast.error('Không thể cập nhật trạng thái chi phí');
    }
  };

  const handleViewExpenseDetail = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenExpenseDetail(true);
  };

  const handleEditExpense = () => {
    if (selectedExpense) {
      setExpenseToEdit(selectedExpense);
      setOpenExpenseDetail(false); // Close detail dialog
      setOpenEditExpense(true); // Open edit dialog
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      // Delete associated participants first
      const { error: participantsError } = await supabase
        .from('expense_participants')
        .delete()
        .eq('expense_id', selectedExpense.id);

      if (participantsError) throw participantsError;

      // Delete receipt image from storage if exists
      if (selectedExpense.receiptUrl) {
        const fileName = selectedExpense.receiptUrl.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('receipts')
            .remove([`${user?.id}/${fileName}`]);
          if (storageError) console.error('Error deleting receipt image:', storageError);
        }
      }

      // Then delete the expense
      const { error: expenseError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', selectedExpense.id);

      if (expenseError) throw expenseError;

      await loadGroupData();
      toast.success("Đã xóa chi phí thành công!");
      setOpenExpenseDetail(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Không thể xóa chi phí');
    }
  };

  const handleMarkParticipantPaid = async (expenseId: string, participantId: string, isGuest: boolean) => {
    try {
      if (isGuest) {
        // For guests, we update by guest_name and expense_id
        const { error } = await supabase
          .from('expense_participants')
          .update({ is_paid: true, paid_at: new Date().toISOString() })
          .eq('expense_id', expenseId)
          .eq('id', participantId); // Assuming participantId is the ID of the expense_participant row for guests
        if (error) throw error;
      } else {
        // For registered users, we update by user_id and expense_id
        const { error } = await supabase
          .from('expense_participants')
          .update({ is_paid: true, paid_at: new Date().toISOString() })
          .eq('expense_id', expenseId)
          .eq('id', participantId); // Assuming participantId is the ID of the expense_participant row for users
        if (error) throw error;
      }
      await loadGroupData();
      toast.success("Đã đánh dấu đã trả!");
    } catch (error) {
      console.error('Error marking participant as paid:', error);
      toast.error('Không thể đánh dấu đã trả');
    }
  };

  const handleShare = () => {
    if (id) {
      setShareCode(id); // Set the group ID as the share code
      setOpenShareDialog(true);
    } else {
      toast.error("Không thể lấy mã nhóm");
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      toast.success("Đã sao chép mã nhóm!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Không thể sao chép mã nhóm");
    }
  };

  const handleViewReceipt = (receiptUrl?: string) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    } else {
      toast.info("Không có hóa đơn cho chi phí này.");
    }
  };

  const handleInviteMembers = (emails: string[]) => {
    // This is a placeholder for actual email sending and member invitation logic.
    // In a real application, you would:
    // 1. Call a Supabase Edge Function or a backend API to send emails.
    // 2. The email would contain a link to join the group (e.g., /join-group?groupId=XYZ&email=abc@example.com).
    // 3. Upon clicking the link, the user would be prompted to sign up/log in and then added to the group.
    console.log("Sending invitations to:", emails);
    toast.success(`Đã gửi lời mời đến ${emails.length} địa chỉ email.`);
    // For now, we just show a toast.
    // You might want to add these emails to a 'pending_invitations' table in Supabase.
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/groups")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>

              {isEditingName ? (
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                  className="w-32 h-8"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{groupName}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5" />
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            onClick={() => setOpenAddExpense(true)}
          >
            <Plus className="w-5 h-5" />
            Thêm chi phí
          </Button>

          <Button
            variant="default"
            className="flex-1 h-12"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
            Chia sẻ
          </Button>

          <Button variant="outline" className="px-6 h-12" onClick={() => setOpenInviteMemberDialog(true)}>
            <UserPlus className="w-5 h-5" />
            Mời thành viên
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-500">
                <Receipt className="w-5 h-5" />
                <span className="text-xs font-medium">Tổng Chi Phí</span>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-foreground">
                  {totalExpense.toLocaleString()} đ
                </div>
                <div className="text-xs text-muted-foreground">Tổng Chi Phí</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-500">
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">Tổng thành viên</span>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-foreground">{members.length}</div>
                <div className="text-xs text-muted-foreground">trong nhóm này</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-yellow-500">
                <User className="w-5 h-5" />
                <span className="text-xs font-medium">Phần Của Tôi</span>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-foreground">
                  {amountToPay.toLocaleString()} đ
                </div>
                <div className="text-xs text-muted-foreground">phần của tôi</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Thao tác nhanh
          </h2>
          <div className="space-y-2">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="font-medium">Khoản Tiền Phải Trả</div>
                    <div className="text-xl font-bold text-red-500">
                      {amountToPay.toLocaleString()} đ
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Khoản Tiền Cần Thu</div>
                    <div className="text-xl font-bold text-green-500">
                      {amountToCollect.toLocaleString()} đ
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expenses List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Chi phí ({expenses.length})
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
              Lọc
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Hoàn thành:{" "}
            <span className="font-medium text-primary">
              {completedCount}/{expenses.length}
            </span>
          </div>

          <div className="space-y-3">
            {expenses.map((expense) => (
              <Card
                key={expense.id}
                className={`${
                  expense.isCompleted ? "opacity-60" : ""
                } transition-all`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{expense.title}</h3>
                        {expense.isMine && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium">
                            Chi phí của bạn
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{expense.paidBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{expense.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-500">
                        {expense.amount.toLocaleString()} đ
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Chia đều
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {expense.splitWith.join(", ")}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewExpenseDetail(expense)}
                    >
                      <Eye className="w-4 h-4" />
                      Xem Chi Tiết
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewReceipt(expense.receiptUrl)}
                      disabled={!expense.receiptUrl}
                    >
                      <FileText className="w-4 h-4" />
                      Hóa đơn
                    </Button>
                    <Button
                      size="sm"
                      className={`flex-1 ${
                        expense.isCompleted
                          ? "bg-muted text-muted-foreground"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      onClick={() => handleCompleteExpense(expense.id, expense.isCompleted)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {expense.isCompleted ? "Đã hoàn thành" : "Hoàn thành"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" />
              Thành viên ({members.length})
            </h2>
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mb-3">
            Người tham gia nhóm
          </div>

          {members.map(member => (
            <Card key={member.id} className="mb-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      <div className="flex gap-1">
                        {member.id === user?.id && (
                          <span className="px-2 py-0.5 rounded-md bg-green-500 text-white text-xs font-medium">
                            Bạn
                          </span>
                        )}
                        {/* Assuming owner status is determined by group.owner_id */}
                        {/* This needs to be fetched from group_members table */}
                        {id && expenses.length > 0 && expenses[0].paidById === member.id && ( // This is a temporary check, should be from group_members role
                          <span className="px-2 py-0.5 rounded-md bg-yellow-500 text-white text-xs font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Trưởng nhóm
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={openAddExpense}
        onOpenChange={setOpenAddExpense}
        onAddExpense={handleAddExpense}
        members={members}
        currentUserId={user?.id || ""}
        currentUserName={members.find(m => m.id === user?.id)?.name || ""}
      />

      {/* Expense Detail Dialog */}
      <ExpenseDetailDialog
        open={openExpenseDetail}
        onOpenChange={setOpenExpenseDetail}
        expense={selectedExpense}
        onComplete={() => {
          if (selectedExpense) {
            handleCompleteExpense(selectedExpense.id, selectedExpense.isCompleted);
            setOpenExpenseDetail(false);
          }
        }}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        onMarkPaid={(participantId: string) => {
          if (selectedExpense) {
            const participant = selectedExpense.participants.find(p => (p.userId === user?.id && p.userId === participantId) || p.guestId === participantId);
            handleMarkParticipantPaid(selectedExpense.id, participantId, !!participant?.guestName);
          }
        }}
      />

      {/* Edit Expense Dialog */}
      {expenseToEdit && (
        <EditExpenseDialog
          open={openEditExpense}
          onOpenChange={setOpenEditExpense}
          initialExpense={expenseToEdit}
          onUpdateExpense={handleUpdateExpense}
          members={members}
          currentUserId={user?.id || ""}
          currentUserName={members.find(m => m.id === user?.id)?.name || ""}
        />
      )}

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={openInviteMemberDialog}
        onOpenChange={setOpenInviteMemberDialog}
        onInvite={handleInviteMembers}
        groupName={groupName}
      />

      {/* Share Dialog */}
      <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ nhóm</DialogTitle>
            <DialogDescription>
              Chia sẻ mã này để mời người khác tham gia nhóm
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={shareCode}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleCopyCode}
                className="flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Người nhận mã sẽ cần đăng nhập để tham gia nhóm
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-4 right-4 flex justify-between max-w-4xl mx-auto">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg"
          onClick={() => toast.info("Mở chat")}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          onClick={() => setOpenAddExpense(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default GroupDetail;