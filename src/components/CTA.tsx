import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-secondary/20"> {/* Reduced padding */}
      <div className="container mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-10 text-center text-white shadow-xl"> {/* Reduced border radius and padding */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLnJvZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          
          <div className="relative z-10 space-y-5"> {/* Reduced space-y */}
            <h2 className="text-2xl md:text-4xl font-bold"> {/* Reduced font size */}
              Đã đến lúc chia tiền thông minh hơn
            </h2>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto"> {/* Reduced font size */}
              Tạo tài khoản miễn phí và trải nghiệm ngay hôm nay
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3"> {/* Reduced gap and padding */}
              <a href="/auth">
                {/* Smaller button */}
                <Button 
                  size="default" 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2 h-10 px-4 text-base"
                >
                  Đăng ký ngay
                  <ArrowRight className="w-4 h-4" /> {/* Smaller icon */}
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