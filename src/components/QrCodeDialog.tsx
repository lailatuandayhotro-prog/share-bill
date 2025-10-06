import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface QrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankId: string;
  accountNumber: string;
  amount: number;
  description: string;
  accountName: string;
  personName: string;
}

const QrCodeDialog = ({
  open,
  onOpenChange,
  bankId,
  accountNumber,
  amount,
  description,
  accountName,
  personName,
}: QrCodeDialogProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false); // Reset copied state when dialog closes
    }
  }, [open]);

  const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopyAccountInfo = async () => {
    const textToCopy = `Ngân hàng: ${bankId}\nSố tài khoản: ${accountNumber}\nTên tài khoản: ${accountName}\nSố tiền: ${amount.toLocaleString()} đ\nNội dung: ${description}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Đã sao chép thông tin chuyển khoản!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Không thể sao chép thông tin.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Chuyển khoản cho {personName}</DialogTitle>
          <DialogDescription className="text-sm">
            Sử dụng mã QR hoặc thông tin bên dưới để chuyển khoản.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-center">
          {bankId && accountNumber && amount && description && accountName ? (
            <>
              <img
                src={qrCodeUrl}
                alt="Mã QR chuyển khoản"
                className="w-full max-w-[250px] mx-auto rounded-lg border border-border"
              />
              <div className="text-left space-y-1.5 text-sm">
                <p><strong>Ngân hàng:</strong> {bankId}</p>
                <p><strong>Số tài khoản:</strong> {accountNumber}</p>
                <p><strong>Tên tài khoản:</strong> {accountName}</p>
                <p><strong>Số tiền:</strong> {amount.toLocaleString()} đ</p>
                <p><strong>Nội dung:</strong> {description}</p>
              </div>
              <Button onClick={handleCopyAccountInfo} className="w-full gap-2 h-9 text-sm">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Đã sao chép!" : "Sao chép thông tin"}
              </Button>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-6 text-sm">
              Không đủ thông tin để tạo mã QR.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;