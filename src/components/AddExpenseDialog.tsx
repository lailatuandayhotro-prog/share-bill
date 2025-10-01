import { useState } from "react";
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

interface Member {
  id: string;
  name: string;
}

interface Guest {
  id: string;
  name: string;
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
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      setReceiptImage(file);
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

    // Calculate split amounts
    const totalParticipants = selectedMembers.length + guests.length;
    const amountPerPerson = parseFloat(amount) / totalParticipants;
    
    // Create participants list excluding the payer
    const participantsWithAmounts = [
      ...selectedMembers
        .filter(memberId => memberId !== paidBy)
        .map(memberId => ({
          userId: memberId,
          userName: members.find(m => m.id === memberId)?.name || '',
          amount: amountPerPerson,
          isPaid: false,
        })),
      ...guests.map(guest => ({
        guestId: guest.id,
        guestName: guest.name,
        amount: amountPerPerson,
        isPaid: false,
      }))
    ];

    const expense = {
      amount: parseFloat(amount),
      description,
      date: format(date, "dd/MM/yyyy"),
      splitType,
      paidBy,
      paidByName: members.find(m => m.id === paidBy)?.name || currentUserName,
      participants: participantsWithAmounts,
      allParticipants: selectedMembers,
      guests,
      receiptImage: receiptImage?.name,
    };

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
    setReceiptImage(null);
    
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
          <DialogTitle>Thêm chi phí mới</DialogTitle>
          <DialogDescription>
            Thêm chi phí mới cho tuan hoang
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
                      {receiptImage ? receiptImage.name : "Nhấp để tải lên ảnh hóa đơn"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG tối đa 5MB
                    </p>
                  </div>
                </div>
              </label>
            </div>
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
            Thêm chi phí
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
