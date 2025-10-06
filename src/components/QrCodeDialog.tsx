import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react"; // Changed from Copy to Download
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
  // Removed 'copied' state as it's no longer needed for copying text

  const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

  const handleDownloadQrCode = () => {
    if (!qrCodeUrl) {
      toast.error("Không có mã QR để tải về.");
      return;
    }
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_ChuyenKhoan_${personName}_${amount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải ảnh mã QR về máy!");
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
              <Button onClick={handleDownloadQrCode} className="w-full gap-2 h-9 text-sm">
                <Download className="w-4 h-4" />
                Lưu ảnh
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