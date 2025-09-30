import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Quản lý chi tiêu theo nhóm</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Dễ dàng chia chi phí cùng
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              nhóm bạn với ChiTi
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Theo dõi, tổng hợp và thanh toán chi tiêu chung chỉ trong vài bước. 
            Giảm tranh cãi, tăng minh bạch, phù hợp cho bạn bè, gia đình và đội nhóm.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button variant="hero" size="lg" className="gap-2">
              Xem tính năng
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              Dùng thử miễn phí
            </Button>
          </div>

          <div className="pt-12">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Demo Interface</p>
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
