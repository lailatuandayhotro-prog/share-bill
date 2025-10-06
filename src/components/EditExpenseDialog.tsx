import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Upload, Plus, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatCurrencyInput, parseFormattedCurrency } from "@/utils/formatters"; // Import formatters

interface Member {
  id: string;
  name: string;
}

interface Guest {
  id: string;
  name: string;
  responsibleMemberId?: string; // Optional: if a member pays for this guest
}

interface Participant {
  userId?: string;
  userName?: string;
  guestId?: string; // ID for unabsorbed guest from expense_participants
  guestName?: string; // Name for unabsorbed guest from expense_participants
  amount: number;
  isPaid: boolean;
  isPayer?: boolean;
}

interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  paidBy: string; // Name of the payer
  paidById: string; // ID of the payer
  date: string; // ISO string
  splitType?: string;
  participants: Participant[];
  receiptUrl?: string;
  guests?: Guest[]; // Full guest list with responsibleMemberId
}

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialExpense: Expense;
  onUpdateExpense: (expenseId: string, updatedExpense: any) => void;
  members: Member[];
  currentUserId: string;
  currentUserName: string;
}

const EditExpenseDialog = ({
  open,
  onOpenChange,
  initialExpense,
  members,
  currentUserId,
  currentUserName,
  onUpdateExpense,
}: EditExpenseDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState<string>(currentUserId);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestResponsibleMemberId, setNewGuestResponsibleMemberId] = useState<string | undefined>(undefined); // Default to undefined
  const [receiptImage, setReceiptImage] = useState<File | null | 'removed'>(null); // 'removed' to indicate explicit removal
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (open && initialExpense) {
      setAmount(formatCurrencyInput(initialExpense.amount)); // Format initial amount
      setDescription(initialExpense.description || initialExpense.title);
      setDate(parseISO(initialExpense.date));
      setSplitType((initialExpense.splitType as "equal" | "custom") || "equal");
      setPaidBy(initialExpense.paidById);

      // Populate selectedMembers from initialExpense.participants (only actual members)
      const initialSelectedMembers = initialExpense.participants
        .filter(p => p.userId)
        .map(p => p.userId!);
      setSelectedMembers(initialSelectedMembers);

      // Populate guests from initialExpense.guests (parsed from description)
      setGuests(initialExpense.guests || []);
      setReceiptImage(null); // Reset file input
      setReceiptPreview(initialExpense.receiptUrl || null);
      setNewGuestResponsibleMemberId(undefined); // Reset for new guest input
    }
  }, [open, initialExpense, currentUserId]);

  const handleAddGuest = () => {
    if (!newGuestName.trim()) {
      toast.error("Vui lòng nhập tên khách");
      return;
    }
    
    const newGuest: Guest = {
      id: `guest-${Date.now()}`,
      name: newGuestName,
      responsibleMemberId: newGuestResponsibleMemberId,
    };
    
    setGuests([...guests, newGuest]);
    setNewGuestName("");
    setNewGuestResponsibleMemberId(undefined); // Reset for next guest
    toast.success("Đã thêm khách mời");
  };

  const handleRemoveGuest = (guestId: string) => {
    setGuests(guests.filter(g => g.id !== guestId));
  };

  const handleUpdateGuestResponsibleMember = (guestId: string, memberId: string | undefined) => {
    setGuests(prevGuests => 
      prevGuests.map(g => 
        g.id === guestId ? { ...g, responsibleMemberId: memberId } : g
      )
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file tối đa 5MB");
        return;
      }
      if (receiptPreview && receiptImage !== 'removed') URL.revokeObjectURL(receiptPreview);
      setReceiptImage(file);
      setReceiptPreview(URL.createObjectURL(file));
      toast.success("Đã chọn ảnh hóa đơn");
    }
  };

  const handleRemoveReceipt = () => {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptImage('removed'); // Mark for removal
    setReceiptPreview(null);
    toast.info("Đã xóa ảnh hóa đơn");
  };

  const handleSubmit = () => {
    if (!amount || !description) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (selectedMembers.length === 0 && guests.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người tham gia");
      return;
    }

    const totalAmount = parseFormattedCurrency(amount); // Use parseFormattedCurrency
    
    // Tính số suất chia theo số thành viên được chọn + số khách
    const memberIds = [...selectedMembers];
    const totalEntities = memberIds.length + guests.length;
    
    if (totalEntities === 0) {
      toast.error("Không có người tham gia hợp lệ để chia chi phí.");
      return;
    }

    const sharePerEntity = totalAmount / totalEntities;

    // Map để lưu số tiền mà mỗi member phải trả (bao gồm cả trả hộ cho guest)
    const memberAmountMap = new Map<string, number>();

    // Thêm suất cho mỗi member được chọn
    memberIds.forEach((memberId) => {
      memberAmountMap.set(memberId, sharePerEntity);
    });

    // Xử lý guests: nếu có người trả hộ thì gộp vào người đó, không thì tạo participant riêng
    const guestParticipants: any[] = [];
    
    guests.forEach((guest) => {
      const guestName = guest.name?.trim();
      if (!guestName) return;
      
      if (guest.responsibleMemberId) {
        // Có người trả hộ: gộp suất của guest vào người chịu trách nhiệm
        const currentAmount = memberAmountMap.get(guest.responsibleMemberId) || 0;
        memberAmountMap.set(guest.responsibleMemberId, currentAmount + sharePerEntity);
      } else {
        // Không có người trả hộ: guest tự trả
        const existingGuestParticipant = initialExpense.participants.find(p => p.guestName === guestName);
        guestParticipants.push({ 
          guest_name: guestName, 
          amount: sharePerEntity, 
          is_paid: existingGuestParticipant?.isPaid || false 
        });
      }
    });

    // Tạo danh sách participants từ memberAmountMap (trừ người trả tiền)
    const updatedParticipants: any[] = [];
    
    memberAmountMap.forEach((amount, memberId) => {
      if (memberId !== paidBy) {
        // Preserve existing paid status if the participant was already in the expense
        const existingParticipant = initialExpense.participants.find(p => p.userId === memberId);
        updatedParticipants.push({ user_id: memberId, amount, is_paid: existingParticipant?.isPaid || false });
      }
    });

    // Thêm guests không có người trả hộ
    updatedParticipants.push(...guestParticipants);

    const updatedExpense = {
      amount: totalAmount,
      description,
      date: format(date, "yyyy-MM-dd"),
      splitType,
      paidBy,
      paidByName: members.find(m => m.id === paidBy)?.name || currentUserName,
      participants: updatedParticipants, // This now contains members and unabsorbed guests
      guests: guests, // Full guest list with responsibleMemberId for display/tracking
      receiptImage: receiptImage === 'removed' ? null : receiptImage, // Pass null if removed, or File object
      receiptUrl: receiptImage === 'removed' ? null : (receiptImage instanceof File ? undefined : initialExpense.receiptUrl), // Keep old URL if no new file and not removed
    };

    onUpdateExpense(initialExpense.id, updatedExpense);
    onOpenChange(false);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-4"> {/* Reduced max-w, padding, and added flex-col */}
        <DialogHeader className="pb-2"> {/* Reduced padding */}
          <DialogTitle 
            className="text-xl"
          >Chỉnh sửa chi phí</DialogTitle> {/* Reduced font size */}
          <DialogDescription 
            className="text-sm"
          >
            Chỉnh sửa chi phí cho {initialExpense.title}
          </DialogDescription> {/* Reduced font size */}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 -mx-4 px-4"> {/* Added flex-1, overflow-y-auto, reduced space-y, adjusted padding */}
          {/* Số tiền */}
          <div className="space-y-1.5"> {/* Reduced space-y */}
            <Label htmlFor="amount" 
              className="text-sm"
            >Số tiền (VNĐ)</Label> {/* Reduced font size */}
            <Input
              id="amount"
              type="text" // Changed to text to allow custom formatting
              inputMode="numeric" // Suggest numeric keyboard on mobile
              pattern="[0-9.]*" // Allow digits and dots for formatting
              placeholder="500.000"
              value={amount}
              onChange={(e) => setAmount(formatCurrencyInput(e.target.value))} // Use formatCurrencyInput
              className="text-base h-9 placeholder:italic placeholder:text-muted-foreground"
            /> {/* Reduced font size and height */}
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5"> {/* Reduced space-y */}
            <Label htmlFor="description" 
              className="text-sm"
            >Mô tả</Label> {/* Reduced font size */}
            <Textarea
              id="description"
              placeholder="Ăn trưa tại nhà hàng"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              /* Reduced rows */
              className="text-sm placeholder:italic placeholder:text-muted-foreground"
            /> {/* Reduced font size */}
          </div>

          {/* Người trả tiền */}
          <div className="space-y-1.5"> {/* Reduced space-y */}
            <Label 
              className="text-sm"
            >Người trả tiền</Label> {/* Reduced font size */}
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger 
                className="h-9 text-sm"
              > {/* Reduced height and font size */}
                <SelectValue placeholder="Chọn người trả tiền..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id} 
                    className="text-sm"
                  > {/* Reduced font size */}
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ngày */}
          <div className="space-y-1.5"> {/* Reduced space-y */}
            <Label 
              className="text-sm"
            >Ngày</Label> {/* Reduced font size */}
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 text-sm",
                    !date && "text-muted-foreground"
                  )}
                > {/* Reduced height and font size */}
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate || new Date());
                    setShowDatePicker(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Người tham gia */}
          <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/20"> {/* Reduced space-y and padding */}
            <div className="flex items-center gap-1.5"> {/* Reduced gap */}
              <Label 
                className="text-base font-semibold"
              >Người tham gia</Label> {/* Reduced font size */}
            </div>

            <div 
              className="text-xs text-muted-foreground"
            > {/* Reduced font size */}
              Chi phí sẽ được chia đều cho tất cả thành viên được chọn và khách mời không có người trả hộ.
            </div>

            {/* Member Selection */}
            <div className="space-y-2"> {/* Reduced space-y */}
              <Select onValueChange={toggleMember} value={selectedMembers[0]}> {/* Added value prop */}
                <SelectTrigger 
                  className="bg-background h-9 text-sm"
                > {/* Reduced height and font size */}
                  <SelectValue placeholder="Chọn người tham gia..." />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id} 
                      className="text-sm"
                    > {/* Reduced font size */}
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5"> {/* Reduced gap */}
                  {selectedMembers.map((memberId) => {
                    const member = members.find(m => m.id === memberId);
                    return member ? (
                      <div
                        key={memberId}
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                      > {/* Reduced padding and font size */}
                        <span>{member.name}</span>
                        <button
                          onClick={() => toggleMember(memberId)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" /> {/* Smaller icon */}
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Khách mời */}
          <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/20"> {/* Reduced space-y and padding */}
            <div className="flex items-center justify-between">
              <Label 
                className="text-base font-semibold"
              >Khách mời</Label> {/* Reduced font size */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGuest}
                className="gap-1.5 h-8 text-xs"
              > {/* Reduced height and font size */}
                <Plus className="w-3.5 h-3.5" /> {/* Smaller icon */}
                Thêm khách
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Nhập tên khách mời..."
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGuest()}
                className="flex-1 h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
              /> {/* Reduced height and font size */}
              <Select value={newGuestResponsibleMemberId} onValueChange={(value) => setNewGuestResponsibleMemberId(value === "undefined" ? undefined : value)}>
                <SelectTrigger 
                  className="w-full sm:w-[160px] h-9 text-sm"
                > {/* Reduced width, height and font size */}
                  <SelectValue placeholder="Người trả tiền hộ (Tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined" 
                    className="text-sm"
                  >Không có người trả hộ</SelectItem> {/* Reduced font size */}
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id} 
                      className="text-sm"
                    > {/* Reduced font size */}
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {guests.length > 0 && (
              <div className="space-y-2"> {/* Reduced space-y */}
                <Label 
                  className="text-xs text-muted-foreground"
                >Danh sách khách</Label> {/* Reduced font size */}
                <div className="space-y-1.5"> {/* Reduced space-y */}
                  {guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-background rounded-lg border border-border gap-1.5"
                    > {/* Reduced padding and gap */}
                      <span 
                        className="text-sm font-medium"
                      >+ {guest.name}</span> {/* Reduced font size */}
                      <div className="flex-1 flex items-center justify-end gap-1.5"> {/* Reduced gap */}
                        <Select 
                          value={guest.responsibleMemberId || "undefined"} 
                          onValueChange={(value) => handleUpdateGuestResponsibleMember(guest.id, value === "undefined" ? undefined : value)}
                        >
                          <SelectTrigger 
                            className="h-8 text-xs w-full sm:w-[140px]"
                          > {/* Reduced height, font size and width */}
                            <SelectValue placeholder="Người trả tiền hộ (Tùy chọn)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="undefined" 
                              className="text-xs"
                            >Không có người trả hộ</SelectItem> {/* Reduced font size */}
                            {members.map((member) => (
                              <SelectItem key={member.id} value={member.id} 
                                className="text-xs"
                              > {/* Reduced font size */}
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                        > {/* Reduced size */}
                          <X className="w-3 h-3" /> {/* Smaller icon */}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ảnh hóa đơn */}
          <div className="space-y-2"> {/* Reduced space-y */}
            <Label 
              // Reduced font size
              className="text-sm"
            >Ảnh hóa đơn (Tùy chọn)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"> {/* Reduced padding */}
              <input
                type="file"
                id="receipt-upload"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
              />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-1.5"> {/* Reduced gap */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"> {/* Smaller icon container */}
                    <Upload className="w-5 h-5 text-primary" /> {/* Smaller icon */}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground"> {/* Reduced font size */}
                      {receiptImage ? receiptImage.name : "Nhấp để tải lên ảnh hóa đơn"}
                    </p>
                    <p 
                      // Reduced font size and margin
                      className="text-xs text-muted-foreground mt-0.5"
                    >
                      PNG, JPG tối đa 5MB
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {receiptPreview && (
              <div className="rounded-lg border border-border overflow-hidden">
                <img
                  src={receiptPreview}
                  alt={`Hóa đơn: ${receiptImage?.name ?? ''}`}
                  // Reduced max-height
                  className="w-full max-h-48 object-contain bg-muted"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t"> {/* Reduced gap and padding */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            // Reduced height and font size
            className="flex-1 h-9 text-sm"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            // Reduced height and font size
            className="flex-1 h-9 text-sm"
          >
            Thêm chi phí
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;