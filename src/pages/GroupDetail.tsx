import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import ExpenseDetailDialog from "@/components/ExpenseDetailDialog";
import EditExpenseDialog from "@/components/EditExpenseDialog";
import InviteMemberDialog from "@/components/InviteMemberDialog";
import GroupMembersDialog from "@/components/GroupMembersDialog";
import BalanceDetailDialog from "@/components/BalanceDetailDialog";
import IndividualBalanceDetailDialog from "@/components/IndividualBalanceDetailDialog";
import { LogoutButton } from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  Pencil,
  ChevronRight,
  Copy,
  Check,
  UserPlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, endOfMonth, startOfMonth, getYear, setYear, setMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import MonthSelector from "@/components/MonthSelector";
import ConfirmMonthCompletionDialog from "@/components/ConfirmMonthCompletionDialog";
import ReceiptViewDialog from "@/components/ReceiptViewDialog"; // Import new component

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

interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // Name of the payer
  paidById: string; // ID of the payer
  splitWith: string[]; // This will now contain members and guests (with responsible member info)
  date: string; // ISO string from DB
  displayDate: string; // Formatted date for UI
  isCompleted: boolean;
  isMine: boolean;
  participants: Participant[]; // These are entries from expense_participants (members or unabsorbed guests)
  receiptUrl?: string;
  description?: string;
  splitType?: string;
  guests?: Guest[]; // Full guest list with responsibleMemberId, parsed from description
}

interface GroupMember {
  id: string;
  name: string;
  isOwner: boolean;
  avatarUrl?: string;
}

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
}

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openExpenseDetail, setOpenExpenseDetail] = useState(false);
  const [openEditExpense, setOpenEditExpense] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openInviteMemberDialog, setOpenInviteMemberDialog] = useState(false);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [openBalanceDetailDialog, setOpenBalanceDetailDialog] = useState(false);
  const [balanceDetailTitle, setBalanceDetailTitle] = useState("");
  const [balanceDetailDescription, setBalanceDetailDescription] = useState("");
  const [balancesToDisplay, setBalancesToDisplay] = useState<BalanceItem[]>([]);
  const [balanceDetailType, setBalanceDetailType] = useState<'pay' | 'collect'>('pay');

  const [openIndividualBalanceDetail, setOpenIndividualBalanceDetail] = useState(false);
  const [individualBalancePersonName, setIndividualBalancePersonName] = useState("");
  const [individualBalanceExpenses, setIndividualBalanceExpenses] = useState<ContributingExpense[]>([]);

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [shareCode, setShareCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [groupName, setGroupName] = useState("Test");
  const [isEditingName, setIsEditingName] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [isCompletingMonthExpenses, setIsCompletingMonthExpenses] = useState(false);
  const [openConfirmMonthCompletionDialog, setOpenConfirmMonthCompletionDialog] = useState(false);

  const [openReceiptViewDialog, setOpenReceiptViewDialog] = useState(false); // New state for receipt view dialog
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState<string | null>(null); // New state for current receipt URL
  const [currentReceiptTitle, setCurrentReceiptTitle] = useState<string>(""); // New state for current receipt title

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));

  useEffect(() => {
    if (!id || !user) return;
    loadGroupData();
  }, [id, user, selectedMonth, selectedYear]);

  const loadGroupData = async () => {
    if (!id || !user) return [];
    
    try {
      setLoading(true);
      
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('name, owner_id')
        .eq('id', id)
        .single();
      
      if (groupError) throw groupError;
      if (groupData) setGroupName(groupData.name);
      const groupOwnerId = groupData?.owner_id;

      const { data: groupMembersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', id);
      
      if (membersError) throw membersError;

      const userIds = groupMembersData?.map(m => m.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      const formattedMembers: GroupMember[] = profilesData?.map(p => ({
        id: p.id,
        name: p.full_name,
        isOwner: p.id === groupOwnerId,
        avatarUrl: p.avatar_url || undefined,
      })) || [];
      
      setMembers(formattedMembers);

      // Ensure selectedMonth always reflects the selectedYear
      const currentSelectedMonthWithYear = setYear(selectedMonth, selectedYear);

      const startOfSelectedMonth = format(startOfMonth(currentSelectedMonthWithYear), 'yyyy-MM-dd');
      const endOfSelectedMonth = format(endOfMonth(currentSelectedMonthWithYear), 'yyyy-MM-dd');

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_participants(*)
        `)
        .eq('group_id', id)
        .gte('expense_date', startOfSelectedMonth)
        .lte('expense_date', endOfSelectedMonth)
        .order('created_at', { ascending: false });
      
      if (expensesError) throw expensesError;

      console.log("Fetched expenses data:", expensesData); // Log the fetched data for debugging

      const formattedExpenses = expensesData?.map(exp => {
        const payer = formattedMembers.find(m => m.id === exp.paid_by);
        
        // Parse guests from description
        let guests: Guest[] = [];
        let cleanDescription = exp.description || exp.title;
        const guestsJsonMatch = cleanDescription.match(/guests:(\[.*\])/);
        if (guestsJsonMatch && guestsJsonMatch[1]) {
          try {
            guests = JSON.parse(guestsJsonMatch[1]);
            cleanDescription = cleanDescription.replace(guestsJsonMatch[0], '').trim();
          } catch (e) {
            console.error("Error parsing guests JSON from description:", e);
          }
        }

        // Participants are entries from expense_participants (members or unabsorbed guests)
        const participants = exp.expense_participants.map((p: any) => ({
          userId: p.user_id,
          userName: p.user_id ? formattedMembers.find(m => m.id === p.user_id)?.name : undefined,
          guestId: p.guest_name ? p.id : undefined, // Use expense_participant ID for guest
          guestName: p.guest_name,
          amount: p.amount,
          isPaid: p.is_paid,
          isPayer: p.user_id === exp.paid_by,
        }));

        // Construct splitWith for display
        const allSplitEntitiesNames = new Set<string>();
        participants.forEach(p => {
          if (p.userName) allSplitEntitiesNames.add(p.userName);
          if (p.guestName) allSplitEntitiesNames.add(p.guestName);
        });
        guests.forEach(guest => {
          if (guest.responsibleMemberId) {
            const responsibleMemberName = formattedMembers.find(m => m.id === guest.responsibleMemberId)?.name || 'Unknown';
            allSplitEntitiesNames.add(`${guest.name} (trả hộ bởi ${responsibleMemberName})`);
          }
        });

        return {
          id: exp.id,
          title: exp.title,
          description: cleanDescription,
          amount: exp.amount,
          paidBy: payer?.name || 'Unknown',
          paidById: exp.paid_by,
          splitWith: Array.from(allSplitEntitiesNames).filter(Boolean) as string[],
          date: exp.expense_date, // ISO string
          displayDate: new Date(exp.expense_date).toLocaleDateString('vi-VN'), // Formatted for UI
          isCompleted: exp.is_completed,
          isMine: exp.paid_by === user?.id,
          participants,
          receiptUrl: exp.receipt_url,
          splitType: exp.split_type || 'equal',
          guests, // Pass full guest list for EditExpenseDialog and ExpenseDetailDialog
        };
      }) || [];

      setExpenses(formattedExpenses);
      return formattedExpenses;
    } catch (error) {
      console.error('Error loading group data:', error);
      toast.error('Không thể tải dữ liệu nhóm');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const completedCount = expenses.filter((e) => e.isCompleted).length;

  const amountToPay = expenses
    .filter(exp => !exp.isCompleted)
    .reduce((sum, exp) => {
      const myParticipant = exp.participants.find(
        p => p.userId === user?.id && !p.isPayer && !p.isPaid
      );
      return sum + (myParticipant?.amount || 0);
    }, 0);

  const amountToCollect = expenses
    .filter(exp => !exp.isCompleted)
    .reduce((sum, exp) => {
      if (exp.paidById === user?.id) {
        const unpaidAmount = exp.participants
          .filter(p => !p.isPaid && !p.isPayer)
          .reduce((total, p) => total + p.amount, 0);
        return sum + unpaidAmount;
      }
      return sum;
    }, 0);

  const calculateDetailedBalances = (type: 'pay' | 'collect'): BalanceItem[] => {
    if (!user) return [];

    const balancesMap = new Map<string, BalanceItem>();

    expenses.filter(exp => !exp.isCompleted).forEach(exp => {
      const payerId = exp.paidById;
      const payerName = members.find(m => m.id === payerId)?.name || 'Unknown';
      const payerAvatar = members.find(m => m.id === payerId)?.avatarUrl;

      exp.participants.forEach(p => {
        const participantId = p.userId || p.guestId;
        const participantName = p.userName || p.guestName;
        const participantAvatar = p.userId ? members.find(m => m.id === p.userId)?.avatarUrl : undefined;
        const isGuest = !!p.guestName;

        if (!participantId || !participantName || p.isPaid) return;

        if (type === 'pay' && p.userId === user.id && !p.isPayer) {
          const currentBalance = balancesMap.get(payerId) || {
            id: payerId,
            name: payerName,
            amount: 0,
            avatarUrl: payerAvatar,
            isGuest: false,
            contributingExpenses: [],
          };
          currentBalance.amount -= p.amount;
          currentBalance.contributingExpenses.push({
            expenseId: exp.id,
            title: exp.title,
            amount: p.amount,
            date: exp.displayDate,
            paidBy: payerName,
          });
          balancesMap.set(payerId, currentBalance);
        } else if (type === 'collect' && payerId === user.id && !p.isPayer) {
          const currentBalance = balancesMap.get(participantId) || {
            id: participantId,
            name: participantName,
            amount: 0,
            avatarUrl: participantAvatar,
            isGuest: isGuest,
            contributingExpenses: [],
          };
          currentBalance.amount += p.amount;
          currentBalance.contributingExpenses.push({
            expenseId: exp.id,
            title: exp.title,
            amount: p.amount,
            date: exp.displayDate,
            paidBy: exp.paidBy,
          });
          balancesMap.set(participantId, currentBalance);
        }
      });
    });

    const filteredBalances = Array.from(balancesMap.values()).filter(b => b.amount !== 0);

    if (type === 'pay') {
      return filteredBalances.filter(b => b.amount < 0).map(b => ({ ...b, amount: Math.abs(b.amount) }));
    } else {
      return filteredBalances.filter(b => b.amount > 0);
    }
  };

  const handleOpenBalanceDetail = (type: 'pay' | 'collect') => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để xem chi tiết.");
      return;
    }
    const calculatedBalances = calculateDetailedBalances(type);
    setBalancesToDisplay(calculatedBalances);
    setBalanceDetailTitle(type === 'pay' ? "Khoản Tiền Phải Trả" : "Khoản Tiền Cần Thu");
    setBalanceDetailDescription(
      type === 'pay'
        ? "Chi tiết các khoản bạn cần trả cho các thành viên khác."
        : "Chi tiết các khoản các thành viên khác cần trả cho bạn."
    );
    setBalanceDetailType(type);
    setOpenBalanceDetailDialog(true);
  };

  const handleViewIndividualBalance = (personName: string, expenses: ContributingExpense[], type: 'pay' | 'collect') => {
    setIndividualBalancePersonName(personName);
    setIndividualBalanceExpenses(expenses);
    setBalanceDetailType(type);
    setOpenIndividualBalanceDetail(true);
  };

  const handleAddExpense = async (expenseData: any) => {
    if (!id || !user) return;

    try {
      let receiptUrl = null;

      if (expenseData.receiptImage) {
        const fileExt = expenseData.receiptImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, expenseData.receiptImage);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Không thể tải lên ảnh hóa đơn');
          // Do not throw here, continue with expense creation even if receipt upload fails
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName);
          receiptUrl = publicUrl;
        }
      }

      // Append guest details to description for storage, if any
      const descriptionWithGuests = expenseData.description + (expenseData.guests.length > 0 ? `guests:${JSON.stringify(expenseData.guests)}` : '');

      const { data: newExpense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          group_id: id,
          title: expenseData.description, // Title remains clean
          description: descriptionWithGuests, // Description includes guest data
          amount: expenseData.amount,
          paid_by: expenseData.paidBy,
          expense_date: expenseData.date,
          split_type: 'equal',
          receipt_url: receiptUrl
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Insert into expense_participants based on the calculated shares for members and unabsorbed guests
      const participantsToInsert = expenseData.participants.map((p: any) => ({
        expense_id: newExpense.id,
        user_id: p.userId,
        guest_name: p.guestName, // Will be null for members, name for unabsorbed guests
        amount: p.amount,
        is_paid: p.isPaid
      }));

      // Only attempt insert if there are participants to insert
      if (participantsToInsert.length > 0) {
        const { error: participantsError } = await supabase
          .from('expense_participants')
          .insert(participantsToInsert);

        if (participantsError) throw participantsError;
      }

      await loadGroupData();

      const payerName = members.find(m => m.id === expenseData.paidBy)?.name || currentUserName;
      toast.success(`Chi phí đã thêm! ${payerName} đã trả ${expenseData.amount.toLocaleString()} đ.`);
      
    } catch (error: any) { // Explicitly type error as any for better error message access
      console.error('Error adding expense:', error);
      toast.error(`Không thể thêm chi phí: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  const handleUpdateExpense = async (expenseId: string, updatedExpenseData: any) => {
    if (!id || !user) return;

    try {
      let receiptUrl = updatedExpenseData.receiptUrl;

      if (updatedExpenseData.receiptImage instanceof File) {
        if (selectedExpense?.receiptUrl) {
          const oldFileName = selectedExpense.receiptUrl.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('receipts').remove([`${user.id}/${oldFileName}`]);
          }
        }

        const fileExt = updatedExpenseData.receiptImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, updatedExpenseData.receiptImage);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Không thể tải lên ảnh hóa đơn mới');
          return;
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName);
          receiptUrl = publicUrl;
        }
      } else if (updatedExpenseData.receiptImage === null && selectedExpense?.receiptUrl) {
        const oldFileName = selectedExpense.receiptUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('receipts').remove([`${user.id}/${oldFileName}`]);
        }
        receiptUrl = null;
      }

      // Append guest details to description for storage, if any
      const descriptionWithGuests = updatedExpenseData.description + (updatedExpenseData.guests.length > 0 ? `guests:${JSON.stringify(updatedExpenseData.guests)}` : '');

      const { error: expenseError } = await supabase
        .from('expenses')
        .update({
          title: updatedExpenseData.description, // Title remains clean
          description: descriptionWithGuests, // Description includes guest data
          amount: updatedExpenseData.amount,
          paid_by: updatedExpenseData.paidBy,
          expense_date: updatedExpenseData.date,
          split_type: updatedExpenseData.splitType,
          receipt_url: receiptUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId);

      if (expenseError) throw expenseError;

      await supabase.from('expense_participants').delete().eq('expense_id', expenseId);

      // Insert updated participants based on the new logic
      const participantsToInsert = updatedExpenseData.participants.map((p: any) => ({
        expense_id: expenseId,
        user_id: p.userId,
        guest_name: p.guestName, // Will be null for members, name for unabsorbed guests
        amount: p.amount,
        is_paid: p.isPaid
      }));

      // Only attempt insert if there are participants to insert
      if (participantsToInsert.length > 0) {
        const { error: participantsError } = await supabase
          .from('expense_participants')
          .insert(participantsToInsert);

        if (participantsError) throw participantsError;
      }

      await loadGroupData();
      toast.success("Cập nhật chi phí thành công!");
      setOpenEditExpense(false);
      setExpenseToEdit(null);
    } catch (error: any) { // Explicitly type error as any for better error message access
      console.error('Error updating expense:', error);
      toast.error(`Không thể cập nhật chi phí: ${error.message || 'Lỗi không xác định'}`);
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

  const confirmCompleteAllMyExpensesInMonth = async () => {
    if (!user || !id) {
      toast.error("Vui lòng đăng nhập và chọn nhóm.");
      return;
    }

    setIsCompletingMonthExpenses(true);
    setOpenConfirmMonthCompletionDialog(false); // Close dialog immediately after confirmation
    try {
      const startOfSelectedMonth = format(startOfMonth(setYear(selectedMonth, selectedYear)), 'yyyy-MM-dd');
      const endOfSelectedMonth = format(endOfMonth(setYear(selectedMonth, selectedYear)), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('expenses')
        .update({ is_completed: true, updated_at: new Date().toISOString() })
        .eq('group_id', id)
        .eq('paid_by', user.id)
        .gte('expense_date', startOfSelectedMonth)
        .lte('expense_date', endOfSelectedMonth)
        .select(); // Select updated rows to get count

      if (error) throw error;

      if (data && data.length > 0) {
        toast.success(`Đã hoàn thành ${data.length} chi phí của bạn trong tháng ${format(selectedMonth, 'MM/yyyy', { locale: vi })}!`);
      } else {
        toast.info(`Không có chi phí nào của bạn trong tháng ${format(selectedMonth, 'MM/yyyy', { locale: vi })} để hoàn thành.`);
      }
      await loadGroupData();
    } catch (error: any) {
      console.error('Error completing all my expenses in month:', error);
      toast.error(`Không thể hoàn thành chi phí: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setIsCompletingMonthExpenses(false);
    }
  };

  const handleViewExpenseDetail = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenExpenseDetail(true);
  };

  const handleEditExpense = () => {
    if (selectedExpense) {
      setExpenseToEdit(selectedExpense);
      setOpenExpenseDetail(false);
      setOpenEditExpense(true);
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    setIsDeletingExpense(true); // Start loading
    try {
      const { error: participantsError } = await supabase
        .from('expense_participants')
        .delete()
        .eq('expense_id', selectedExpense.id);

      if (participantsError) throw participantsError;

      if (selectedExpense.receiptUrl) {
        const fileName = selectedExpense.receiptUrl.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('receipts')
            .remove([`${user?.id}/${fileName}`]);
          if (storageError) console.error('Error deleting receipt image:', storageError);
        }
      }

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
    } finally {
      setIsDeletingExpense(false); // End loading
    }
  };

  const handleMarkParticipantPaid = async (expenseId: string, participantId: string, currentIsPaid: boolean, isGuest: boolean) => {
    setIsMarkingPaid(true);
    try {
      const newPaidStatus = !currentIsPaid;
      const updateData = {
        is_paid: newPaidStatus,
        paid_at: newPaidStatus ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from('expense_participants')
        .update(updateData)
        .eq('expense_id', expenseId)
        .eq(isGuest ? 'id' : 'user_id', participantId); // Use 'id' for guest participants

      if (error) throw error;
      
      const updatedExpenses = await loadGroupData();
      
      const updatedSelectedExpense = updatedExpenses.find(exp => exp.id === expenseId);
      if (updatedSelectedExpense) {
        setSelectedExpense(updatedSelectedExpense);
      }

      toast.success(newPaidStatus ? "Đã đánh dấu đã trả!" : "Đã đánh dấu chưa trả!");
    } catch (error) {
      console.error('Error marking participant as paid:', error);
      toast.error('Không thể cập nhật trạng thái đã trả');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleShare = () => {
    if (id) {
      setShareCode(id);
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

  const handleViewReceipt = (receiptUrl?: string, expenseTitle?: string) => {
    if (receiptUrl && expenseTitle) {
      setCurrentReceiptUrl(receiptUrl);
      setCurrentReceiptTitle(expenseTitle);
      setOpenReceiptViewDialog(true);
    } else {
      toast.info("Không có hóa đơn cho chi phí này.");
    }
  };

  const handleInviteMembers = (emails: string[]) => {
    console.log("Sending invitations to:", emails);
    toast.success(`Đã gửi lời mời đến ${emails.length} địa chỉ email.`);
  };

  const handleMonthChange = (newMonth: Date) => {
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    setSelectedMonth(prevMonth => setYear(prevMonth, newYear));
  };

  const currentYear = getYear(new Date());
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

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

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setOpenMembersDialog(true)}
          >
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
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenBalanceDetail('pay')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
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

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenBalanceDetail('collect')}
            >
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

            <Button
              onClick={() => setOpenConfirmMonthCompletionDialog(true)}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-base"
              disabled={isCompletingMonthExpenses}
            >
              {isCompletingMonthExpenses ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              Hoàn thành chi phí của tôi trong tháng
            </Button>
          </div>
        </div>

        {/* Expenses List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Chi phí ({expenses.length})
            </h2>
            {/* Month and Year Selectors on the same line */}
            <div className="flex items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="year-select" className="text-xs text-muted-foreground">Chọn năm</Label>
                <Select onValueChange={handleYearChange} value={selectedYear.toString()}>
                  <SelectTrigger id="year-select" className="w-[90px] h-8 text-sm">
                    <SelectValue placeholder="Năm" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Chọn tháng</Label>
                <MonthSelector selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Hoàn thành:{" "}
            <span className="font-medium text-primary">
              {completedCount}/{expenses.length}
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Đang tải chi phí...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">Chưa có chi phí nào</p>
                <p className="text-muted-foreground mb-6">
                  Thêm chi phí mới để bắt đầu theo dõi.
                </p>
              </div>
            ) : (
              expenses.map((expense) => (
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
                          <span>{expense.displayDate}</span>
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
                        onClick={() => handleViewReceipt(expense.receiptUrl, expense.title)} // Pass expense.title
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
              ))
            )}
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
                        {member.isOwner && (
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
        expense={selectedExpense ? { ...selectedExpense, date: selectedExpense.displayDate } : null}
        onComplete={() => {
          if (selectedExpense) {
            handleCompleteExpense(selectedExpense.id, selectedExpense.isCompleted);
            setOpenExpenseDetail(false);
          }
        }}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
        onMarkPaid={(participantId: string, currentIsPaid: boolean, isGuest: boolean) => {
          if (selectedExpense) {
            handleMarkParticipantPaid(selectedExpense.id, participantId, currentIsPaid, isGuest);
          }
        }}
        isMarkingPaid={isMarkingPaid}
        isDeletingExpense={isDeletingExpense}
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

      {/* Group Members Dialog */}
      <GroupMembersDialog
        open={openMembersDialog}
        onOpenChange={setOpenMembersDialog}
        members={members}
        groupName={groupName}
      />

      {/* Balance Detail Dialog */}
      <BalanceDetailDialog
        open={openBalanceDetailDialog}
        onOpenChange={setOpenBalanceDetailDialog}
        title={balanceDetailTitle}
        description={balanceDetailDescription}
        balances={balancesToDisplay}
        currentUserId={user?.id || ""}
        onViewIndividualBalance={handleViewIndividualBalance}
        type={balanceDetailType}
      />

      {/* Individual Balance Detail Dialog */}
      <IndividualBalanceDetailDialog
        open={openIndividualBalanceDetail}
        onOpenChange={setOpenIndividualBalanceDetail}
        personName={individualBalancePersonName}
        expenses={individualBalanceExpenses}
        type={balanceDetailType}
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

      {/* Confirm Month Completion Dialog */}
      <ConfirmMonthCompletionDialog
        open={openConfirmMonthCompletionDialog}
        onOpenChange={setOpenConfirmMonthCompletionDialog}
        onConfirm={confirmCompleteAllMyExpensesInMonth}
        monthYear={format(selectedMonth, 'MM/yyyy', { locale: vi })}
        isConfirming={isCompletingMonthExpenses}
      />

      {/* Receipt View Dialog */}
      <ReceiptViewDialog
        open={openReceiptViewDialog}
        onOpenChange={setOpenReceiptViewDialog}
        receiptUrl={currentReceiptUrl}
        expenseTitle={currentReceiptTitle}
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