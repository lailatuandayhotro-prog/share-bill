import { DollarSign } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-10 px-4 border-t border-border bg-muted/30"> {/* Reduced padding */}
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-6"> {/* Reduced gap */}
          <div className="space-y-3"> {/* Reduced space-y */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"> {/* Smaller icon container */}
                <DollarSign className="w-4 h-4 text-primary" /> {/* Smaller icon */}
              </div>
              <span className="text-base font-bold text-foreground">Share Bill</span> {/* Reduced font size */}
            </div>
            <p className="text-xs text-muted-foreground"> {/* Reduced font size */}
              Giải pháp chia tiền thông minh cho mọi nhóm
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3">Tính năng</h3> {/* Reduced font size and margin */}
            <ul className="space-y-1.5 text-xs text-muted-foreground"> {/* Reduced space-y and font size */}
              <li><a href="#" className="hover:text-foreground transition-colors">Ghi chi tiêu</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Quản lý nhóm</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Tổng hợp chi phí</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3">Hỗ trợ</h3> {/* Reduced font size and margin */}
            <ul className="space-y-1.5 text-xs text-muted-foreground"> {/* Reduced space-y and font size */}
              <li><a href="#" className="hover:text-foreground transition-colors">Hướng dẫn</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-foreground mb-3">Pháp lý</h3> {/* Reduced font size and margin */}
            <ul className="space-y-1.5 text-xs text-muted-foreground"> {/* Reduced space-y and font size */}
              <li><a href="#" className="hover:text-foreground transition-colors">Điều khoản</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Bảo mật</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground"> {/* Reduced margin, padding and font size */}
          © 2024 Share Bill. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;