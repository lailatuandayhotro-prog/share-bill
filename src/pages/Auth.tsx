import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/groups");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email hoặc mật khẩu không đúng");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Đăng nhập thành công!");
      navigate("/groups");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupFullName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName);
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Email này đã được đăng ký");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/groups"), 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-3"> {/* Reduced padding */}
      <div className="w-full max-w-sm"> {/* Reduced max-w */}
        <div className="text-center mb-6"> {/* Reduced margin */}
          <div className="inline-flex items-center gap-2 mb-3"> {/* Reduced margin */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"> {/* Smaller icon container */}
              <DollarSign className="w-6 h-6 text-primary" /> {/* Smaller icon */}
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> {/* Reduced font size */}
              Share Bill
            </h1>
          </div>
          <p className="text-sm text-muted-foreground"> {/* Reduced font size */}
            Chia tiền nhóm thông minh và dễ dàng
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-9"> {/* Reduced height */}
            <TabsTrigger value="login" className="text-sm">Đăng nhập</TabsTrigger> {/* Reduced font size */}
            <TabsTrigger value="signup" className="text-sm">Đăng ký</TabsTrigger> {/* Reduced font size */}
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader className="p-4 pb-2"> {/* Reduced padding */}
                <CardTitle className="text-xl">Đăng nhập</CardTitle> {/* Reduced font size */}
                <CardDescription className="text-sm">
                  Đăng nhập vào tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2"> {/* Reduced padding */}
                <form onSubmit={handleLogin} className="space-y-3"> {/* Reduced space-y */}
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <Label htmlFor="login-email" className="text-sm">Email</Label> {/* Reduced font size */}
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm" {/* Reduced height and font size */}
                    />
                  </div>
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <Label htmlFor="login-password" className="text-sm">Mật khẩu</Label> {/* Reduced font size */}
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm" {/* Reduced height and font size */}
                    />
                  </div>
                  <Button type="submit" className="w-full h-9 text-sm" disabled={loading}> {/* Reduced height and font size */}
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đăng nhập
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader className="p-4 pb-2"> {/* Reduced padding */}
                <CardTitle className="text-xl">Đăng ký</CardTitle> {/* Reduced font size */}
                <CardDescription className="text-sm">
                  Tạo tài khoản mới để bắt đầu
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2"> {/* Reduced padding */}
                <form onSubmit={handleSignup} className="space-y-3"> {/* Reduced space-y */}
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <Label htmlFor="signup-name" className="text-sm">Họ và tên</Label> {/* Reduced font size */}
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm" {/* Reduced height and font size */}
                    />
                  </div>
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <Label htmlFor="signup-email" className="text-sm">Email</Label> {/* Reduced font size */}
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm" {/* Reduced height and font size */}
                    />
                  </div>
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <Label htmlFor="signup-password" className="text-sm">Mật khẩu</Label> {/* Reduced font size */}
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm" {/* Reduced height and font size */}
                    />
                  </div>
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <Label htmlFor="signup-confirm" className="text-sm">Xác nhận mật khẩu</Label> {/* Reduced font size */}
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm" {/* Reduced height and font size */}
                    />
                  </div>
                  <Button type="submit" className="w-full h-9 text-sm" disabled={loading}> {/* Reduced height and font size */}
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đăng ký
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-5 text-center"> {/* Reduced margin */}
          <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors"> {/* Reduced font size */}
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;