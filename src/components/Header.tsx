import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">ChiTi</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Tính năng
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cách hoạt động
          </a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Đánh giá
          </a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        <a href="/groups">
          <Button variant="outline" size="sm">
            Dùng thử ngay
          </Button>
        </a>
      </div>
    </header>
  );
};

export default Header;
