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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
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

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: any) => void;
  members: Member[];
  currentUserId: string;
  currentUserName: string;
}

const AddExpenseDialog = ({ open, onOpenChange, onAddExpense, members, currentUserId, currentUserName }: AddExpenseDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUserId]);
  const [paidBy, setPaidBy] = useState<string>(currentUserId);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestResponsibleMemberId, setNewGuestResponsibleMemberId] = useState<string | undefined>(undefined); // Default to undefined (guest pays for self)
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Ensure current user is selected by default in members
    if (open) { // Only reset when dialog opens
      setSelectedMembers([currentUserId]);
      setPaidBy(currentUserId);
      setNewGuestResponsibleMemberId(undefined);
      setAmount("");
      setDescription("");
      setDate(new Date());
      setSplitType("equal");
      setGuests([]);
      setNewGuestName("");
      setReceiptImage(null);
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
    }
  }, [currentUserId, open]);

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
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
      setReceiptImage(file);
      setReceiptPreview(URL.createObjectURL(file));
      toast.success("Đã chọn ảnh hóa đơn");
    }
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
        guestParticipants.push({ guest_name: guestName, amount: sharePerEntity, is_paid: false });
      }
    });

    // Tạo danh sách participants từ memberAmountMap (trừ người trả tiền)
    const participantsToInsert: any[] = [];
    
    memberAmountMap.forEach((amount, memberId) => {
      if (memberId !== paidBy) {
        participantsToInsert.push({ user_id: memberId, amount, is_paid: false });
      }
    });

    // Thêm guests không có người trả hộ
    participantsToInsert.push(...guestParticipants);

    // Gói dữ liệu expense để gửi lên
    const expense = {
      amount: totalAmount,
      description,
      date: format(date, "yyyy-MM-dd"),
      splitType,
      paidBy,
      paidByName: members.find(m => m.id === paidBy)?.name || currentUserName,
      participants: participantsToInsert, // thành viên + khách (khách là 1 suất riêng)
      guests: guests, // lưu để hiển thị "trả hộ cho"
      receiptImage: receiptImage,
    };

    // Thêm một bản ghi cho người trả tiền (để hiển thị "Người trả tiền")
    if (!expense.participants.some((p: any) => p.user_id === paidBy)) {
      expense.participants.push({ user_id: paidBy, amount: 0, is_paid: true });
    }
    onAddExpense(expense);
    
    // Reset form
    setAmount("");
    setDescription("");
    setDate(new Date());
    setSplitType("equal");
    setSelectedMembers([currentUserId]);
    setPaidBy(currentUserId);
    setGuests([]);
    setNewGuestName("");
    setNewGuestResponsibleMemberId(undefined);
    setReceiptImage(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
    
    onOpenChange(false);
  };

  const toggleMember = (memberId: string, checked: boolean) => {
    setSelectedMembers(prev => 
      checked
        ? [...prev, memberId]
        : prev.filter(id => id !== memberId)
    );
  };

  const handleSelectAllMembers = (checked: boolean) => {
    if (checked) {
      // Select all members, ensuring currentUserId is always included
      setSelectedMembers(members.map(member => member.id));
    } else {
      // Deselect all members except currentUserId
      setSelectedMembers([currentUserId]);
    }
  };

  // Determine if all *other* members are selected to control the "Select All" checkbox state
  const allOtherMembersSelected = members
    .filter(member => member.id !== currentUserId)
    .every(member => selectedMembers.includes(member.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-4"> {/* Reduced max-w, padding, and added flex-col */}
        <DialogHeader className="pb-2"> {/* Reduced padding */}
          <DialogTitle 
            // Reduced font size
            className="text-xl"
          >Thêm chi phí mới</DialogTitle>
          <DialogDescription 
            // Reduced font size
            className="text-sm"
          >
            Thêm chi phí mới cho nhóm
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 -mx-4 px-4"> {/* Added flex-1, overflow-y-auto, reduced space-y, adjusted padding */}
          {/* Số tiền */}
          <div className="space-y-1.5"> {/* Reduced space-y */}
            <Label htmlFor="amount" 
              // Reduced font size
              className="text-sm"
            >Số tiền (VNĐ)</Label>
            <Input
              id="amount"
              type="text" // Changed to text to allow custom formatting
              inputMode="numeric" // Suggest numeric keyboard on mobile
              pattern="[0-9.]*" // Allow digits and dots for formatting
              placeholder="500.000"
              value={amount}
              onChange={(e) => setAmount(formatCurrencyInput(e.target.value))} // Use formatCurrencyInput
              // Reduced font size and height
              className="text-base h-9"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5"> {/* Reduced space-y */}
            <Label htmlFor="description" 
              // Reduced font size
              className="text-sm"
            >Mô tả</Label>
            {/* Reduced rows */}
            <Textarea
              id="description"
              placeholder="Ăn trưa tại nhà hàng"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              // Reduced font size
              className="text-sm"
            />
          </div>

          {/* Người trả tiền */}
          <div className="space-y-1.5"> {/* Reduced space-y */}
            <Label 
              // Reduced font size
              className="text-sm"
            >Người trả tiền</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger 
                // Reduced height and font size
                className="h-9 text-sm"
              >
                <SelectValue placeholder="Chọn người trả tiền..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id} 
                    // Reduced font size
                    className="text-sm"
                  >
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ngày */}
          <div className="space-y-1.5"> {/* Reduced space-y */}
            <Label 
              // Reduced font size
              className="text-sm"
            >Ngày</Label>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 text-sm", // Reduced height and font size
                    !date && "text-muted-foreground"
                  )}
                >
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
                // Reduced font size
                className="text-base font-semibold"
              >Người tham gia</Label>
            </div>

            <div 
              // Reduced font size
              className="text-xs text-muted-foreground"
            >
              Chi phí sẽ được chia đều cho tất cả thành viên được chọn và khách mời không có người trả hộ.
            </div>

            {/* Member Selection with Checkboxes */}
            <div className="space-y-2"> {/* Reduced space-y */}
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="select-all-members"
                  checked={allOtherMembersSelected}
                  onCheckedChange={(checked: boolean) => handleSelectAllMembers(checked)}
                />
                <Label htmlFor="select-all-members" className="text-sm font-semibold">
                  Chọn tất cả
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-2"> {/* Display members in a grid */}
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={(checked: boolean) => toggleMember(member.id, checked)}
                      disabled={member.id === currentUserId} // Disable checkbox for current user
                    />
                    <Label htmlFor={`member-${member.id}`} className="text-sm font-normal">
                      {member.name} {member.id === currentUserId && "(Bạn)"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Khách mời */}
          <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/20"> {/* Reduced space-y and padding */}
            <div className="flex items-center justify-between">
              <Label 
                // Reduced font size
                className="text-base font-semibold"
              >Khách mời</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGuest}
                // Reduced height and font size
                className="gap-1.5 h-8 text-xs"
              >
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
                // Reduced height and font size
                className="flex-1 h-9 text-sm"
              />
              <Select value={newGuestResponsibleMemberId} onValueChange={(value) => setNewGuestResponsibleMemberId(value === "undefined" ? undefined : value)}>
                <SelectTrigger 
                  // Reduced width, height and font size
                  className="w-full sm:w-[160px] h-9 text-sm"
                >
                  <SelectValue placeholder="Người trả tiền hộ (Tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined" 
                    // Reduced font size
                    className="text-sm"
                  >Không có người trả hộ</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id} 
                      // Reduced font size
                      className="text-sm"
                    >
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {guests.length > 0 && (
              <div className="space-y-2"> {/* Reduced space-y */}
                <Label 
                  // Reduced font size
                  className="text-xs text-muted-foreground"
                >Danh sách khách</Label>
                <div className="space-y-1.5"> {/* Reduced space-y */}
                  {guests.map((guest) => (
                    <div
                      key={guest.id}
                      // Reduced padding and gap
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-background rounded-lg border border-border gap-1.5"
                    >
                      <span 
                        // Reduced font size
                        className="text-sm font-medium"
                      >+ {guest.name}</span>
                      <div className="flex-1 flex items-center justify-end gap-1.5"> {/* Reduced gap */}
                        <Select 
                          value={guest.responsibleMemberId || "undefined"} 
                          onValueChange={(value) => handleUpdateGuestResponsibleMember(guest.id, value === "undefined" ? undefined : value)}
                        >
                          <SelectTrigger 
                            // Reduced height, font size and width
                            className="h-8 text-xs w-full sm:w-[140px]"
                          >
                            <SelectValue placeholder="Người trả tiền hộ (Tùy chọn)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="undefined" 
                              // Reduced font size
                              className="text-xs"
                            >Không có người trả hộ</SelectItem>
                            {members.map((member) => (
                              <SelectItem key={member.id} value={member.id} 
                                // Reduced font size
                                className="text-xs"
                              >
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          // Reduced size
                          className="h-5 w-5"
                          onClick={() => handleRemoveGuest(guest.id)}
                        >
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