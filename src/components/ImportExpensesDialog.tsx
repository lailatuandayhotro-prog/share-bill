import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportExpensesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  currentUserId: string;
  onImportSuccess: () => void;
}

interface ParsedExpense {
  date: string;
  time: string;
  amount: number;
  category: string;
  subCategory: string;
  description: string;
  spentFor: string;
}

export function ImportExpensesDialog({
  open,
  onOpenChange,
  groupId,
  currentUserId,
  onImportSuccess,
}: ImportExpensesDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<ParsedExpense[]>([]);
  const [error, setError] = useState<string>("");

  const parseExcelFile = async (file: File): Promise<ParsedExpense[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          const expenses: ParsedExpense[] = [];
          
          // Start from row 10 (index 10) as data starts there
          for (let i = 10; i < jsonData.length; i++) {
            const row: any = jsonData[i];
            
            // Skip empty rows or rows without date
            if (!row[1]) continue;
            
            const expenseAmount = row[4]; // Số tiền chi (column index 4)
            
            // Only process rows with expense amount
            if (expenseAmount && expenseAmount > 0) {
              expenses.push({
                date: row[1], // Ngày
                time: row[2] || "", // Giờ
                amount: expenseAmount,
                category: row[6] || "", // Hạng mục cha
                subCategory: row[7] || "", // Hạng mục con
                spentFor: row[8] || "", // Chi cho ai
                description: row[10] || "", // Diễn giải
              });
            }
          }
          
          resolve(expenses);
        } catch (error) {
          reject(new Error("Không thể đọc file. Vui lòng kiểm tra định dạng file."));
        }
      };
      
      reader.onerror = () => reject(new Error("Lỗi khi đọc file"));
      reader.readAsBinaryString(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError("");
    setPreviewData([]);
    
    if (!selectedFile) return;
    
    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      return;
    }
    
    setFile(selectedFile);
    
    try {
      const parsedExpenses = await parseExcelFile(selectedFile);
      
      if (parsedExpenses.length === 0) {
        setError("Không tìm thấy chi tiêu nào trong file");
        return;
      }
      
      setPreviewData(parsedExpenses);
    } catch (err: any) {
      setError(err.message || "Lỗi khi xử lý file");
    }
  };

  const formatDateForSupabase = (dateStr: string): string => {
    // Handle format like "22/11/2025"
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const expense of previewData) {
        try {
          const title = expense.description || expense.subCategory || expense.category || "Chi tiêu";
          const description = [expense.category, expense.subCategory, expense.spentFor]
            .filter(Boolean)
            .join(" - ");
          
          // Create expense
          const { data: expenseData, error: expenseError } = await supabase
            .from('expenses')
            .insert({
              group_id: groupId,
              title: title,
              description: description,
              amount: expense.amount,
              paid_by: currentUserId,
              expense_date: formatDateForSupabase(expense.date),
              split_type: 'equal',
            })
            .select()
            .single();
          
          if (expenseError) throw expenseError;
          
          // Create participant (only the payer)
          await supabase
            .from('expense_participants')
            .insert({
              expense_id: expenseData.id,
              user_id: currentUserId,
              amount: expense.amount,
              is_paid: true,
            });
          
          successCount++;
        } catch (err) {
          console.error('Error creating expense:', err);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Đã import thành công ${successCount} chi tiêu`);
        onImportSuccess();
        onOpenChange(false);
        setFile(null);
        setPreviewData([]);
      }
      
      if (errorCount > 0) {
        toast.error(`Có ${errorCount} chi tiêu không thể import`);
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi import chi tiêu");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setFile(null);
      setPreviewData([]);
      setError("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Chi Tiêu Từ File Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel với định dạng: Ngày, Số tiền chi, Hạng mục, Diễn giải
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Chọn file Excel</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hỗ trợ định dạng .xlsx, .xls
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('excel-file-input')?.click()}
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Chọn File
              </Button>
              {file && (
                <p className="text-xs text-muted-foreground mt-2">
                  Đã chọn: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Tìm thấy {previewData.length} chi tiêu trong file
              </AlertDescription>
            </Alert>
          )}

          {previewData.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2 border-b">Ngày</th>
                      <th className="text-right p-2 border-b">Số tiền</th>
                      <th className="text-left p-2 border-b">Mô tả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((expense, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{expense.date}</td>
                        <td className="p-2 text-right">{expense.amount.toLocaleString('vi-VN')}</td>
                        <td className="p-2">{expense.description || expense.subCategory || expense.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Và {previewData.length - 10} chi tiêu khác...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Hủy
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={previewData.length === 0 || isProcessing}
          >
            {isProcessing ? "Đang xử lý..." : `Import ${previewData.length} chi tiêu`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
