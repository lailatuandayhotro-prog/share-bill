import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const LogoutButton = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Đã đăng xuất");
    navigate("/auth");
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout}>
      <LogOut className="w-5 h-5" />
    </Button>
  );
};
