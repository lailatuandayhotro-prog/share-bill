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
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-4"> {/* Reduced max-w and padding */}
        <DialogHeader className="p-0 pb-2"> {/* Reduced padding */}
          <DialogTitle className="text-xl">Hóa đơn: {expenseTitle}</DialogTitle> {/* Reduced font size */}
          <DialogDescription className="text-sm">
            Xem chi tiết hóa đơn của chi phí này.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-0 pt-2"> {/* Reduced padding */}
          {receiptUrl ? (
            <img
              src={receiptUrl}
              alt={`Hóa đơn cho ${expenseTitle}`}
              className="w-full h-auto object-contain rounded-lg border border-border max-h-[70vh]"
              loading="lazy"
            />
          ) : (
            <div className="text-center text-muted-foreground py-6 text-sm"> {/* Reduced padding and font size */}
              Không có hóa đơn để hiển thị.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewDialog;