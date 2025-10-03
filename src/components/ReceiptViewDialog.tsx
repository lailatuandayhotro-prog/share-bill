import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReceiptViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl: string | null;
  expenseTitle: string;
}

const ReceiptViewDialog = ({ open, onOpenChange, receiptUrl, expenseTitle }: ReceiptViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Hóa đơn: {expenseTitle}</DialogTitle>
          <DialogDescription>
            Xem chi tiết hóa đơn của chi phí này.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-6 pt-4">
          {receiptUrl ? (
            <img
              src={receiptUrl}
              alt={`Hóa đơn cho ${expenseTitle}`}
              className="w-full h-auto object-contain rounded-lg border border-border max-h-[70vh]" // Added max-h-[70vh]
              loading="lazy"
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Không có hóa đơn để hiển thị.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewDialog;