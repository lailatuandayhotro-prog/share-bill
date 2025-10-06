import { Zap, Shield, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Ghi chi tiêu nhanh",
    description: "Thêm chi tiêu trong vài giây, hỗ trợ nhiều loại chi phí.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: Shield,
    title: "Đồng bộ và bảo mật",
    description: "Dữ liệu lưu trữ an toàn, đồng bộ trên mọi thiết bị.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Tổng hợp minh bạch",
    description: "Tự động tính toán nợ và gợi ý thanh toán tối ưu.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-xl md:text-3xl font-bold text-foreground"> {/* Adjusted font size */}
            Các tính năng nổi bật
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto"> {/* Adjusted font size */}
            Được thiết kế để đơn giản hoá việc chia tiền trong mọi hoàn cảnh: 
            từ chuyến đi chơi đến chi tiêu gia đình hay dự án nhóm với Share Bill.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-5 space-y-3">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground"> {/* Adjusted font size */}
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;