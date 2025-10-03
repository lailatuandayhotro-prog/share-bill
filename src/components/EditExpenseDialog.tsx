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

interface Member {
  id: string;
  name: string;
}

interface Guest {
  id: string;
  name: string;
}

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
  description?: string;
  amount: number;
  paidBy: string; // Name of the payer
  paidById: string; // ID of the payer
  date: string; // ISO string
  splitType?: string;
  participants: Participant[];
  receiptUrl?: string;
  guests?: Guest[];
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
  onUpdateExpense,
  members,
  currentUserId,
  currentUserName,
}: EditExpenseDialogProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [paidBy, setPaidBy] = useState<string>(currentUserId);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [receiptImage, setReceiptImage] = useState<File | null | 'removed'>(null); // 'removed' to indicate explicit removal
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (open && initialExpense) {
      setAmount(initialExpense.amount.toString());
      setDescription(initialExpense.description || initialExpense.title);
      setDate(parseISO(initialExpense.date)); // initialExpense.date is now guaranteed to be ISO string
      setSplitType((initialExpense.splitType as "equal" | "custom") || "equal");
      setPaidBy(initialExpense.paidById);

      const initialSelectedMembers = initialExpense.participants
        .filter(p => p.userId && !p.guestName)
        .map(p => p.userId!);
      setSelectedMembers(initialSelectedMembers);

      setGuests(initialExpense.guests || []);
      setReceiptImage(null); // Reset file input
      setReceiptPreview(initialExpense.receiptUrl || null);
    }
  }, [open, initialExpense]);

  const handleAddGuest = () => {
    if (!newGuestName.trim()) {
      toast.error("Vui lòng nhập tên khách");
      return;
    }
    
    const newGuest: Guest = {
      id: `guest-${Date.now()}`,
      name: newGuestName,
    };
    
    setGuests([...guests, newGuest]);
    setNewGuestName("");
    toast.success("Đã thêm khách mời");
  };

  const handleRemoveGuest = (guestId: string) => {
    setGuests(guests.filter(g => g.id !== guestId));
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

    const totalParticipants = selectedMembers.length + guests.length;
    const parsedAmount = parseFloat(amount);
    const amountPerPerson = totalParticipants > 0 ? parsedAmount / totalParticipants : 0;
    
    const updatedParticipants: Participant[] = [
      ...selectedMembers.map(memberId => {
        const existingParticipant = initialExpense.participants.find(p => p.userId === memberId);
        return {
          userId: memberId,
          userName: members.find(m => m.id === memberId)?.name || '',
          amount: amountPerPerson,
          isPaid: existingParticipant?.isPaid || false, // Preserve existing paid status
          isPayer: memberId === paidBy,
        };
      }),
      ...guests.map(guest => {
        const existingGuestParticipant = initialExpense.participants.find(p => p.guestId === guest.id);
        return {
          guestId: guest.id,
          guestName: guest.name,
          amount: amountPerPerson,
          isPaid: existingGuestParticipant?.isPaid || false, // Preserve existing paid status
          isPayer: false,
        };
      })
    ];

    const updatedExpense = {
      amount: parsedAmount,
      description,
      date: format(date, "yyyy-MM-dd"),
      splitType,
      paidBy,
      paidByName: members.find(m => m.id === paidBy)?.name || currentUserName,
      participants: updatedParticipants,
      allParticipants: selectedMembers,
      guests,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chi phí</DialogTitle>
          <DialogDescription>
            Chỉnh sửa chi phí cho {initialExpense.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Số tiền */}
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền (VNĐ)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Ăn trưa tại nhà hàng"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Người trả tiền */}
          <div className="space-y-2">
            <Label>Người trả tiền</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người trả tiền..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ngày */}
          <div className="space-y-2">
            <Label>Ngày</Label>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Người tham gia</Label>
            </div>

            {/* Split Type */}
            <div className="text-sm text-muted-foreground">
              Chi phí sẽ được chia đều cho tất cả người tham gia
            </div>

            {/* Member Selection */}
            <div className="space-y-3">
              <Select onValueChange={toggleMember}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Chọn người tham gia..." />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((memberId) => {
                    const member = members.find(m => m.id === memberId);
                    return member ? (
                      <div
                        key={memberId}
                        className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        <span>{member.name}</span>
                        <button
                          onClick={() => toggleMember(memberId)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Khách mời */}
          <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Khách mời</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGuest}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm khách
              </Button>
            </div>

            <Input
              placeholder="Nhập tên khách mời..."
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGuest()}
            />

            {guests.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Danh sách khách</Label>
                <div className="space-y-2">
                  {guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-2 bg-background rounded-lg border border-border"
                    >
                      <span className="text-sm">+ {guest.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveGuest(guest.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ảnh hóa đơn */}
          <div className="space-y-3">
            <Label>Ảnh hóa đơn (Tùy chọn)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <input
                type="file"
                id="receipt-upload"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
              />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {receiptImage instanceof File ? receiptImage.name : (receiptPreview ? "Đã có ảnh hóa đơn" : "Nhấp để tải lên ảnh hóa đơn")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG tối đa 5MB
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {receiptPreview && (
              <div className="rounded-lg border border-border overflow-hidden relative">
                <img
                  src={receiptPreview}
                  alt={`Hóa đơn: ${initialExpense.title}`}
                  className="w-full max-h-64 object-contain bg-muted"
                  loading="lazy"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleRemoveReceipt}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseDialog;