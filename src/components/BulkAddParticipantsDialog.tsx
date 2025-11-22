import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface Member {
  id: string;
  name: string;
}

interface BulkAddParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExpenseIds: string[];
  members: Member[];
  onComplete: () => void;
}

export function BulkAddParticipantsDialog({
  open,
  onOpenChange,
  selectedExpenseIds,
  members,
  onComplete,
}: BulkAddParticipantsDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedMembers([]);
    }
  }, [open]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Vui lòng chọn ít nhất một thành viên");
      return;
    }

    setLoading(true);
    try {
      // Process each expense
      for (const expenseId of selectedExpenseIds) {
        // Get the expense details
        const { data: expense, error: expenseError } = await supabase
          .from("expenses")
          .select("amount")
          .eq("id", expenseId)
          .single();

        if (expenseError) throw expenseError;

        // Get existing participants
        const { data: existingParticipants, error: participantsError } = await supabase
          .from("expense_participants")
          .select("id, user_id")
          .eq("expense_id", expenseId);

        if (participantsError) throw participantsError;

        const existingUserIds = new Set(
          existingParticipants?.map((p) => p.user_id).filter((id): id is string => id !== null) || []
        );

        // Filter out members who are already participants
        const newMembers = selectedMembers.filter((id) => !existingUserIds.has(id));

        if (newMembers.length === 0) continue;

        // Calculate new total participants count
        const totalParticipants = existingParticipants.length + newMembers.length;
        const newShareAmount = expense.amount / totalParticipants;

        // Update existing participants' amounts
        for (const participant of existingParticipants) {
          const { error: updateError } = await supabase
            .from("expense_participants")
            .update({ amount: newShareAmount })
            .eq("expense_id", expenseId)
            .eq("id", participant.id);

          if (updateError) throw updateError;
        }

        // Add new participants
        const newParticipants = newMembers.map((memberId) => ({
          expense_id: expenseId,
          user_id: memberId,
          amount: newShareAmount,
          is_paid: false,
        }));

        const { error: insertError } = await supabase
          .from("expense_participants")
          .insert(newParticipants);

        if (insertError) throw insertError;
      }

      toast.success(
        `Đã thêm ${selectedMembers.length} thành viên vào ${selectedExpenseIds.length} chi phí`
      );
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding participants:", error);
      toast.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm người tham gia</DialogTitle>
          <DialogDescription>
            Thêm thành viên vào {selectedExpenseIds.length} chi phí đã chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label className="text-sm font-medium">Chọn thành viên</Label>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`member-${member.id}`}
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={() => toggleMember(member.id)}
                />
                <Label
                  htmlFor={`member-${member.id}`}
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{member.name}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
