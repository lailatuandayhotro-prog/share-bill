import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import ExpenseDetailDialog from "@/components/ExpenseDetailDialog";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
}

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openExpenseDetail, setOpenExpenseDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
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
          guestName: p.guest_name,
          amount: p.amount,
          isPaid: p.is_paid,
          isPayer: p.user_id === exp.paid_by
        }));

        return {
          id: exp.id,
          title: exp.title,
          amount: exp.amount,
          paidBy: payer?.name || 'Unknown',
          paidById: exp.paid_by,
          splitWith: participants.map(p => p.userName || p.guestName).filter(Boolean),
          date: new Date(exp.expense_date).toLocaleDateString('vi-VN'),
          isCompleted: exp.is_completed,
          isMine: exp.paid_by === user?.id,
          participants
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
          split_type: 'equal'
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

  const handleCompleteExpense = (expenseId: string) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === expenseId ? { ...exp, isCompleted: !exp.isCompleted } : exp
      )
    );
    toast.success("Đã cập nhật trạng thái!");
  };

  const handleViewExpenseDetail = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenExpenseDetail(true);
  };

  const handleEditExpense = () => {
    toast.info("Chức năng sửa chi phí đang được phát triển");
    setOpenExpenseDetail(false);
  };

  const handleDeleteExpense = () => {
    if (selectedExpense) {
      setExpenses(expenses.filter((e) => e.id !== selectedExpense.id));
      toast.success("Đã xóa chi phí!");
      setOpenExpenseDetail(false);
      setSelectedExpense(null);
    }
  };

  const handleMarkParticipantPaid = (participantId: string) => {
    // Logic to mark participant as paid
    toast.success("Đã đánh dấu đã trả!");
  };

  const handleShare = () => {
    toast.success("Đã sao chép link chia sẻ!");
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

          <Button variant="outline" className="px-6 h-12">
            <Settings className="w-5 h-5" />
            Quản lý
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
                <div className="text-xl font-bold text-foreground">1</div>
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
                  {totalExpense.toLocaleString()} đ
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
                    <Button variant="outline" size="sm" className="flex-1">
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
                      onClick={() => handleCompleteExpense(expense.id)}
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
              Thành viên (1)
            </h2>
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mb-3">
            Người tham gia nhóm
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">tuan hoang</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-green-500 text-white text-xs font-medium">
                        Bạn
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-yellow-500 text-white text-xs font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Trưởng nhóm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
            handleCompleteExpense(selectedExpense.id);
            setOpenExpenseDetail(false);
          }
        }}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        onMarkPaid={handleMarkParticipantPaid}
      />

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
