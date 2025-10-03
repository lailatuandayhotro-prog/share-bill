import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between"> {/* Reduced height */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"> {/* Smaller icon container */}
            <DollarSign className="w-5 h-5 text-primary" /> {/* Smaller icon */}
          </div>
          <span className="text-lg font-bold text-foreground">Share Bill</span> {/* Smaller text */}
        </div>
        
        <nav className="hidden md:flex items-center gap-4"> {/* Reduced gap */}
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

        <a href="/auth">
          <Button variant="outline" size="sm" className="h-8 px-3 text-sm"> {/* Smaller button */}
            Đăng nhập
          </Button>
        </a>
      </div>
    </header>
  );
};

export default Header;