import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Quản lý chi tiêu theo nhóm</span>
          </div>
          
          <h1 className="text-2xl md:text-5xl font-bold text-foreground leading-tight"> {/* Adjusted font size */}
            Dễ dàng chia chi phí cùng
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              nhóm bạn với Share Bill
            </span>
          </h1>
          
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto"> {/* Adjusted font size */}
            Theo dõi, tổng hợp và thanh toán chi tiêu chung chỉ trong vài bước. 
            Giảm tranh cãi, tăng minh bạch, phù hợp cho bạn bè, gia đình và đội nhóm.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <a href="#features">
              <Button variant="hero" size="default" className="gap-2 h-10 px-4 text-base">
                Xem tính năng
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="/auth">
              <Button variant="outline" size="default" className="h-10 px-4 text-base">
                Đăng nhập
              </Button>
            </a>
          </div>

          <div className="pt-10">
            <div className="relative rounded-xl overflow-hidden border border-border shadow-xl bg-card">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Demo Interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;