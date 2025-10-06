import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmMonthCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  monthYear: string; // e.g., "tháng 10/2024"
  isConfirming: boolean;
}

const ConfirmMonthCompletionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  monthYear,
  isConfirming,
}: ConfirmMonthCompletionDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-xl">Xác nhận hoàn thành chi phí</AlertDialogTitle> {/* Adjusted font size */}
          <AlertDialogDescription className="text-xs sm:text-sm"> {/* Adjusted font size */}
            Bạn có chắc chắn muốn đánh dấu TẤT CẢ chi phí bạn đã tạo trong{" "}
            <span className="font-semibold text-foreground">{monthYear}</span> là đã hoàn thành không?
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming} className="h-9 text-sm">Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isConfirming} className="h-9 text-sm">
            {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmMonthCompletionDialog;