import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-12 text-center text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">
              Đã đến lúc chia tiền thông minh hơn
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Tạo tài khoản miễn phí và trải nghiệm ngay hôm nay
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="/groups">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2"
                >
                  Bắt đầu miễn phí
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
