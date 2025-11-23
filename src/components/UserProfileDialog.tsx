import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
}

const UserProfileDialog = ({ open, onOpenChange, onProfileUpdated }: UserProfileDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  useEffect(() => {
    if (open && user) {
      fetchUserProfile();
    }
  }, [open, user]);

  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [avatarFile]);

  const fetchUserProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, nickname, bank_account_number, bank_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        setAvatarPreview(data.avatar_url || "");
        setNickname(data.nickname || "");
        setBankAccountNumber(data.bank_account_number || "");
        setBankName(data.bank_name || "");
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error.message);
      toast.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Bạn chưa đăng nhập.");
      return;
    }

    setLoading(true);
    try {
      let newAvatarUrl = avatarUrl;

      // Upload avatar if new file selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Delete old avatar if exists
        if (avatarUrl) {
          const oldPath = avatarUrl.split('/avatars/')[1];
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        }

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        newAvatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: newAvatarUrl,
          nickname: nickname,
          bank_account_number: bankAccountNumber,
          bank_name: bankName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Cập nhật thông tin thành công!");
      setAvatarFile(null);
      onProfileUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating user profile:", error.message);
      toast.error("Không thể cập nhật thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-xl">Chỉnh sửa thông tin cá nhân</DialogTitle> {/* Adjusted font size */}
          <DialogDescription className="text-xs sm:text-sm"> {/* Adjusted font size */}
            Cập nhật tên, biệt danh, avatar và thông tin ngân hàng của bạn.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview || avatarUrl} alt="Avatar" />
                <AvatarFallback>
                  <User className="h-10 w-10 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="w-full space-y-1.5">
                <Label htmlFor="avatar-file" className="text-sm">Ảnh đại diện</Label>
                <div className="flex gap-2">
                  <Input
                    id="avatar-file"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="h-9 text-sm"
                  />
                  {avatarFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(avatarUrl);
                      }}
                      className="h-9"
                    >
                      Hủy
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kích thước tối đa: 2MB. Định dạng: JPG, PNG, GIF
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="full-name" className="text-sm">Họ và tên</Label>
              <Input
                id="full-name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nickname" className="text-sm">Biệt danh</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="A Béo"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bank-account-number" className="text-sm">Số tài khoản ngân hàng</Label>
              <Input
                id="bank-account-number"
                type="text"
                placeholder="1234567890"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bank-name" className="text-sm">Tên ngân hàng</Label>
              <Input
                id="bank-name"
                type="text"
                placeholder="Vietcombank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
              />
            </div>

            <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;