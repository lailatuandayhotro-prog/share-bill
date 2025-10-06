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
  const [loginPassword, setLoginLoginPassword] = useState("");
  
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
    
    if (!loginEmail || !loginLoginPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginEmail, loginLoginPassword);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-3">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> {/* Adjusted font size */}
              Share Bill
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground"> {/* Adjusted font size */}
            Chia tiền nhóm thông minh và dễ dàng
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList 
            className="grid w-full grid-cols-2 h-9"
          >
            <TabsTrigger value="login" 
              className="text-sm"
            >Đăng nhập</TabsTrigger>
            <TabsTrigger value="signup" 
              className="text-sm"
            >Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle 
                  className="text-base sm:text-xl"
                >Đăng nhập</CardTitle> {/* Adjusted font size */}
                <CardDescription 
                  className="text-xs sm:text-sm"
                >
                  Đăng nhập vào tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" 
                      className="text-sm"
                    >Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" 
                      className="text-sm"
                    >Mật khẩu</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginLoginPassword}
                      onChange={(e) => setLoginLoginPassword(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button type="submit" 
                    className="w-full h-9 text-sm" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đăng nhập
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle 
                  className="text-base sm:text-xl"
                >Đăng ký</CardTitle> {/* Adjusted font size */}
                <CardDescription 
                  className="text-xs sm:text-sm"
                >
                  Tạo tài khoản mới để bắt đầu
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" 
                      className="text-sm"
                    >Họ và tên</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" 
                      className="text-sm"
                    >Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" 
                      className="text-sm"
                    >Mật khẩu</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-confirm" 
                      className="text-sm"
                    >Xác nhận mật khẩu</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="h-9 text-sm placeholder:italic placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button type="submit" 
                    className="w-full h-9 text-sm" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Đăng ký
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-5 text-center">
          <a href="/" 
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;