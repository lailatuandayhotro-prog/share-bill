import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Mail } from "lucide-react";
import { toast } from "sonner";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (emails: string[]) => void;
  groupName: string;
}

const InviteMemberDialog = ({ open, onOpenChange, onInvite, groupName }: InviteMemberDialogProps) => {
  const [emailInput, setEmailInput] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Địa chỉ email không hợp lệ.");
      return;
    }
    if (invitedEmails.includes(email)) {
      toast.info("Email này đã có trong danh sách mời.");
      return;
    }
    setInvitedEmails([...invitedEmails, email]);
    setEmailInput("");
    toast.success(`Đã thêm ${email} vào danh sách mời.`);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInvitedEmails(invitedEmails.filter(email => email !== emailToRemove));
    toast.info(`Đã xóa ${emailToRemove} khỏi danh sách.`);
  };

  const handleSendInvitations = () => {
    if (invitedEmails.length === 0) {
      toast.error("Vui lòng thêm ít nhất một địa chỉ email để mời.");
      return;
    }
    onInvite(invitedEmails);
    setInvitedEmails([]);
    setEmailInput("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-xl">Mời thành viên vào nhóm</DialogTitle> {/* Adjusted font size */}
          <DialogDescription className="text-xs sm:text-sm"> {/* Adjusted font size */}
            Gửi lời mời tham gia nhóm "{groupName}" qua email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="email-invite" className="text-sm">Địa chỉ Email</Label>
            <div className="flex gap-2">
              <Input
                id="email-invite"
                type="email"
                placeholder="nguoidung@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddEmail} className="h-9 w-9">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {invitedEmails.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Danh sách email sẽ mời:</Label>
              <div className="space-y-1.5">
                {invitedEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2 bg-background rounded-lg border border-border"
                  >
                    <span className="text-sm">{email}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveEmail(email)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSendInvitations} className="w-full gap-2 h-9 text-sm">
            <Mail className="w-4 h-4" />
            Gửi lời mời
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;