import { DollarSign } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">ChiTi</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Giải pháp chia tiền thông minh cho mọi nhóm
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Tính năng</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Ghi chi tiêu</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Quản lý nhóm</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Tổng hợp chi phí</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Hướng dẫn</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Pháp lý</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Điều khoản</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Bảo mật</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2024 ChiTi. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
